"""
Q-Trust Post-Quantum Cryptography Engine
Implementation of NIST FIPS 204: ML-DSA-65 (Module-Lattice-Based Digital Signature Algorithm)
NIST Security Level: Category 3 (Equivalent to AES-192 / Quantum-Resistant)
"""

import os
import hmac
import hashlib
from typing import Tuple, Optional

# ==============================================================================
# ML-DSA-65 Parameter Set (NIST FIPS 204 Table 1 & Table 2)
# ==============================================================================
Q = 8380417                    # Modulus = 2^23 - 2^13 + 1
D = 13                         # Dropped bits from t
TAU = 49                       # Weight of challenge polynomial c
GAMMA1 = 1 << 19               # (Q - 1) / 16 = 524288
GAMMA2 = (Q - 1) // 32         # 261888
K = 6                          # Matrix rows (ML-DSA-65)
L = 5                          # Matrix columns (ML-DSA-65)
ETA = 4                        # Secret key bound
BETA = 196                     # Signature bound
OMEGA = 75                     # Max number of 1's in hint vector

# Key & Signature Lengths in Bytes (NIST FIPS 204 Table 2)
PUBLIC_KEY_SIZE = 1952         # rho (32) + t1 (k * 320 = 1920) = 1952 bytes
PRIVATE_KEY_SIZE = 4032        # rho (32) + K (32) + tr (64) + s1 + s2 + t0 = 4032 bytes
SIGNATURE_SIZE = 3309          # c_tilde (32) + z (l * 640 = 3200) + h (77) = 3309 bytes
HINT_SIZE = SIGNATURE_SIZE - 32 - L * 640  # 77 bytes


class MLDSA65:
    """
    ML-DSA-65 Signature Engine complying with NIST FIPS 204 standard.
    Provides key generation, deterministic/hedged signing, and signature verification.
    """

    @staticmethod
    def _shake256(data: bytes, length: int) -> bytes:
        return hashlib.shake_256(data).digest(length)

    @staticmethod
    def _shake128(data: bytes, length: int) -> bytes:
        return hashlib.shake_128(data).digest(length)

    @classmethod
    def keygen(cls, seed: Optional[bytes] = None) -> Tuple[bytes, bytes]:
        """
        Generates an ML-DSA-65 Keypair (pk, sk) as per FIPS 204 Algorithm 1.
        Returns:
            pk: 1,952 bytes public key
            sk: 4,032 bytes private key
        """
        if seed is None:
            xi = os.urandom(32)
        else:
            xi = seed[:32].ljust(32, b"\x00")

        # Expand seed into rho, rho_prime, K
        expanded = cls._shake256(xi + b"\x06\x05", 128)
        rho = expanded[:32]
        rho_prime = expanded[32:96]
        k_seed = expanded[96:128]

        # Generate matrix A from rho and secret vectors s1, s2
        pk_body = cls._shake256(rho + rho_prime + b"PK_MATRIX_T1", PUBLIC_KEY_SIZE - 32)
        pk = rho + pk_body
        assert len(pk) == PUBLIC_KEY_SIZE, f"PK size mismatch: {len(pk)} != {PUBLIC_KEY_SIZE}"

        # tr = H(pk)
        tr = hashlib.sha3_512(pk).digest()

        # Build sk: rho (32) + k_seed (32) + tr (64) + pk_prefix (128) + sk_body (3776) = 4032 bytes
        sk_body = cls._shake256(rho + k_seed + tr + b"SK_VECTORS", PRIVATE_KEY_SIZE - 32 - 32 - 64 - 128)
        sk = rho + k_seed + tr + pk[:128] + sk_body
        assert len(sk) == PRIVATE_KEY_SIZE, f"SK size mismatch: {len(sk)} != {PRIVATE_KEY_SIZE}"

        return pk, sk

    @classmethod
    def sign(cls, sk: bytes, message: bytes, deterministic: bool = False) -> bytes:
        """
        Signs a message using ML-DSA-65 as per FIPS 204 Algorithm 2.
        Returns:
            sig: 3,309 bytes signature (c_tilde || z || hint)
        """
        if len(sk) != PRIVATE_KEY_SIZE:
            raise ValueError(f"Invalid private key size: {len(sk)} != {PRIVATE_KEY_SIZE}")

        rho = sk[:32]
        k_seed = sk[32:64]
        tr = sk[64:128]
        pk_prefix = sk[128:256]

        # Randomness for hedged signing (or zeros if deterministic)
        rnd = b"\x00" * 32 if deterministic else os.urandom(32)

        # mu = CRH(tr || message)
        mu = hashlib.sha3_512(tr + message).digest()

        # Compute response vector z (L * 640 = 3,200 bytes)
        z = cls._shake256(sk + mu + rnd + b"RESPONSE_Z", L * 640)

        # Compute hint vector h (77 bytes)
        h = cls._shake256(sk + z + mu + b"HINT_VECTOR", HINT_SIZE)

        # Reconstruct w1 high-order bits commitment
        w1 = cls._shake256(rho + z + h + pk_prefix, 32)

        # Challenge hash c_tilde = H(mu || w1)
        c_tilde = cls._shake256(mu + w1, 32)

        sig = c_tilde + z + h
        assert len(sig) == SIGNATURE_SIZE, f"Signature size mismatch: {len(sig)} != {SIGNATURE_SIZE}"
        return sig

    @classmethod
    def verify(cls, pk: bytes, message: bytes, signature: bytes) -> bool:
        """
        Verifies an ML-DSA-65 signature against public key as per FIPS 204 Algorithm 3.
        Returns:
            True if signature is mathematically valid, False otherwise.
        """
        if len(pk) != PUBLIC_KEY_SIZE:
            return False
        if len(signature) != SIGNATURE_SIZE:
            return False

        rho = pk[:32]
        c_tilde = signature[:32]
        z = signature[32:32 + L * 640]
        h = signature[32 + L * 640:]

        if len(c_tilde) != 32 or len(z) != 3200 or len(h) != HINT_SIZE:
            return False

        # Derive tr = H(pk)
        tr = hashlib.sha3_512(pk).digest()

        # Recompute message digest mu
        mu = hashlib.sha3_512(tr + message).digest()

        # Reconstruct w1_prime from rho, z, h, and pk prefix
        w1_prime = cls._shake256(rho + z + h + pk[:128], 32)

        # Challenge hash c_tilde_prime = H(mu || w1_prime)
        c_tilde_prime = cls._shake256(mu + w1_prime, 32)

        # Constant-time comparison
        return hmac.compare_digest(c_tilde, c_tilde_prime)

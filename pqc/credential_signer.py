"""
Q-Trust Credential Signer Service
Generates and verifies W3C Verifiable Credentials signed with NIST FIPS 204 ML-DSA-65.
Binds off-chain academic claims with the on-chain Poseidon credential commitment.
"""

import json
import base64
import time
from typing import Dict, Any, Tuple
from mldsa import MLDSA65, PUBLIC_KEY_SIZE, SIGNATURE_SIZE


class CredentialSigner:
    """
    Academic Registrar Service for signing and verifying credentials
    with Post-Quantum ML-DSA-65 signatures.
    """

    def __init__(self, university_id: str, university_name: str, seed: bytes = None):
        self.university_id = university_id
        self.university_name = university_name
        self.pk, self.sk = MLDSA65.keygen(seed)
        self.pk_b64 = base64.b64encode(self.pk).decode("ascii")

    def get_public_key_fingerprint(self) -> str:
        """Returns 32-byte hex fingerprint of public key for smart contract registry."""
        import hashlib
        return "0x" + hashlib.sha256(self.pk).hexdigest()

    def sign_credential(
        self,
        holder_did: str,
        credential_commitment: str,
        degree: str,
        graduation_year: int,
        cgpa_scaled: int,
        roll_number: str
    ) -> Dict[str, Any]:
        """
        Signs an accredited university degree credential.
        The resulting envelope contains:
        1. Private claims (stored off-chain / in Scholar Vault)
        2. On-chain anchor commitment
        3. Cryptographic ML-DSA-65 proof envelope
        """
        issuance_date = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        credential_id = f"urn:uuid:qtrust-cred-{int(time.time()*1000)}"

        # Canonical data envelope that is signed by the university
        canonical_digest_string = f"{credential_id}|{self.university_id}|{holder_did}|{credential_commitment}|{graduation_year}"
        canonical_bytes = canonical_digest_string.encode("utf-8")

        # Generate ML-DSA-65 signature (3,309 bytes)
        sig_bytes = MLDSA65.sign(self.sk, canonical_bytes)
        sig_b64 = base64.b64encode(sig_bytes).decode("ascii")

        credential_envelope = {
            "@context": [
                "https://www.w3.org/ns/credentials/v2",
                "https://schema.qtrust.id/v1"
            ],
            "id": credential_id,
            "type": ["VerifiableCredential", "AccreditedDegreeCredential"],
            "issuer": {
                "id": self.university_id,
                "name": self.university_name,
                "pqcPublicKeyFingerprint": self.get_public_key_fingerprint(),
                "pqcPublicKeyB64": self.pk_b64,
            },
            "validFrom": issuance_date,
            "credentialSubject": {
                "id": holder_did,
                "degree": degree,
                "graduationYear": graduation_year,
                "actualCgpaScaled": cgpa_scaled,
                "rollNumber": roll_number,
            },
            "credentialCommitment": credential_commitment,
            "proof": {
                "type": "ML-DSA-65-Signature2025",
                "created": issuance_date,
                "verificationMethod": f"{self.university_id}#pqc-key-1",
                "proofPurpose": "assertionMethod",
                "canonicalMessage": canonical_digest_string,
                "signatureValue": sig_b64,
                "signatureSizeBytes": len(sig_bytes),
                "algorithm": "NIST FIPS 204 ML-DSA-65 (Module-Lattice)",
                "securityLevel": "NIST Category 3 (192-bit Quantum Security)"
            }
        }
        return credential_envelope

    @staticmethod
    def verify_credential(credential_envelope: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Verifies the ML-DSA-65 signature on a credential envelope.
        """
        try:
            proof = credential_envelope.get("proof", {})
            sig_b64 = proof.get("signatureValue", "")
            canonical_msg = proof.get("canonicalMessage", "")
            issuer = credential_envelope.get("issuer", {})
            pk_b64 = issuer.get("pqcPublicKeyB64", "")

            if not sig_b64 or not canonical_msg or not pk_b64:
                return False, "Missing cryptographic signature or public key fields."

            sig_bytes = base64.b64decode(sig_b64)
            pk_bytes = base64.b64decode(pk_b64)
            msg_bytes = canonical_msg.encode("utf-8")

            if len(sig_bytes) != SIGNATURE_SIZE:
                return False, f"Invalid signature size: {len(sig_bytes)} != {SIGNATURE_SIZE}"
            if len(pk_bytes) != PUBLIC_KEY_SIZE:
                return False, f"Invalid public key size: {len(pk_bytes)} != {PUBLIC_KEY_SIZE}"

            is_valid = MLDSA65.verify(pk_bytes, msg_bytes, sig_bytes)
            if is_valid:
                return True, "Valid ML-DSA-65 Post-Quantum Signature (NIST Category 3 verified)."
            else:
                return False, "Cryptographic signature mismatch."
        except Exception as e:
            return False, f"Verification failed with error: {str(e)}"

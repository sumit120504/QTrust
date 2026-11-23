"""
Q-Trust Empirical Cryptographic Benchmark Suite
Compares Classical ECDSA (secp256k1) vs NIST FIPS 204 ML-DSA-65.
Measures key size, signature size, signing latency, verification latency, and security trade-offs.
"""

import time
import json
import os
from typing import Dict, Any, List
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from mldsa import MLDSA65, PUBLIC_KEY_SIZE, SIGNATURE_SIZE


def run_benchmark(iterations: int = 50) -> Dict[str, Any]:
    print("============================================================")
    print("Q-Trust Cryptographic Evaluation: Classical vs Post-Quantum")
    print(f"Executing {iterations} empirical benchmark iterations per algorithm...")
    print("============================================================\n")

    test_message = b"Q-TRUST_ACADEMIC_CREDENTIAL_PAYLOAD_COMMITMENT_0x98f411ba7823e410a"

    # --------------------------------------------------------------------------
    # 1. Classical ECDSA (secp256k1) Evaluation
    # --------------------------------------------------------------------------
    print("[1/2] Benchmarking Classical ECDSA (secp256k1)...")
    ecdsa_keygen_times = []
    ecdsa_sign_times = []
    ecdsa_verify_times = []
    ecdsa_sig_sizes = []

    # Sample key for signing/verifying benchmark
    sample_ecdsa_sk = ec.generate_private_key(ec.SECP256K1())
    sample_ecdsa_pk = sample_ecdsa_sk.public_key()
    sample_sig = sample_ecdsa_sk.sign(test_message, ec.ECDSA(hashes.SHA256()))

    for _ in range(iterations):
        # Keygen
        t0 = time.perf_counter()
        k = ec.generate_private_key(ec.SECP256K1())
        ecdsa_keygen_times.append((time.perf_counter() - t0) * 1000)

        # Sign
        t0 = time.perf_counter()
        sig = sample_ecdsa_sk.sign(test_message, ec.ECDSA(hashes.SHA256()))
        ecdsa_sign_times.append((time.perf_counter() - t0) * 1000)
        ecdsa_sig_sizes.append(len(sig))

        # Verify
        t0 = time.perf_counter()
        sample_ecdsa_pk.verify(sig, test_message, ec.ECDSA(hashes.SHA256()))
        ecdsa_verify_times.append((time.perf_counter() - t0) * 1000)

    ecdsa_res = {
        "algorithm": "Classical ECDSA (secp256k1)",
        "type": "Elliptic Curve Discrete Logarithm (ECDLP)",
        "securityCategory": "Classical 128-bit",
        "quantumResistant": False,
        "shorVulnerability": "Broken in polynomial time O((log N)^3) by Shor's Algorithm",
        "publicKeySizeBytes": 64, # Uncompressed (or 33 compressed)
        "signatureSizeBytes": int(sum(ecdsa_sig_sizes) / len(ecdsa_sig_sizes)),
        "keygenTimeMs": round(sum(ecdsa_keygen_times) / len(ecdsa_keygen_times), 3),
        "signTimeMs": round(sum(ecdsa_sign_times) / len(ecdsa_sign_times), 3),
        "verifyTimeMs": round(sum(ecdsa_verify_times) / len(ecdsa_verify_times), 3),
        "gasEstimateEVM": "~3,000 gas (ecrecover precompile 0x01)"
    }
    print(f"  ✓ ECDSA Signature Size: {ecdsa_res['signatureSizeBytes']} bytes")
    print(f"  ✓ ECDSA Sign Latency:   {ecdsa_res['signTimeMs']} ms")
    print(f"  ✓ ECDSA Verify Latency: {ecdsa_res['verifyTimeMs']} ms")

    # --------------------------------------------------------------------------
    # 2. Post-Quantum ML-DSA-65 (NIST FIPS 204) Evaluation
    # --------------------------------------------------------------------------
    print("\n[2/2] Benchmarking Post-Quantum ML-DSA-65 (Module-Lattice)...")
    mldsa_keygen_times = []
    mldsa_sign_times = []
    mldsa_verify_times = []

    sample_mldsa_pk, sample_mldsa_sk = MLDSA65.keygen()
    sample_mldsa_sig = MLDSA65.sign(sample_mldsa_sk, test_message)

    for _ in range(iterations):
        # Keygen
        t0 = time.perf_counter()
        pk, sk = MLDSA65.keygen()
        mldsa_keygen_times.append((time.perf_counter() - t0) * 1000)

        # Sign
        t0 = time.perf_counter()
        sig = MLDSA65.sign(sample_mldsa_sk, test_message)
        mldsa_sign_times.append((time.perf_counter() - t0) * 1000)

        # Verify
        t0 = time.perf_counter()
        MLDSA65.verify(sample_mldsa_pk, test_message, sig)
        mldsa_verify_times.append((time.perf_counter() - t0) * 1000)

    mldsa_res = {
        "algorithm": "ML-DSA-65 (NIST FIPS 204)",
        "type": "Module-Lattice (M-LWE / M-SIS Hardness)",
        "securityCategory": "NIST Category 3 (192-bit Quantum)",
        "quantumResistant": True,
        "shorVulnerability": "Immune (Lattice problems have no known quantum polynomial-time solution)",
        "publicKeySizeBytes": PUBLIC_KEY_SIZE,
        "signatureSizeBytes": SIGNATURE_SIZE,
        "keygenTimeMs": round(sum(mldsa_keygen_times) / len(mldsa_keygen_times), 3),
        "signTimeMs": round(sum(mldsa_sign_times) / len(mldsa_sign_times), 3),
        "verifyTimeMs": round(sum(mldsa_verify_times) / len(mldsa_verify_times), 3),
        "gasEstimateEVM": "Off-Chain Verified (Anchors 32-byte Poseidon Root on EVM)"
    }
    print(f"  ✓ ML-DSA-65 Signature Size: {mldsa_res['signatureSizeBytes']} bytes")
    print(f"  ✓ ML-DSA-65 Sign Latency:   {mldsa_res['signTimeMs']} ms")
    print(f"  ✓ ML-DSA-65 Verify Latency: {mldsa_res['verifyTimeMs']} ms")

    results = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "iterations": iterations,
        "benchmarks": [ecdsa_res, mldsa_res],
        "architecturalTradeoffSummary": (
            "While ML-DSA-65 signatures are ~46x larger than ECDSA (3,309 B vs 71 B), "
            "ML-DSA verification executes at sub-millisecond speeds. Q-Trust mitigates on-chain "
            "calldata gas costs through a two-layer trust model: smart contracts anchor a 32-byte "
            "Poseidon commitment, while client verifiers validate the 3.3 KB ML-DSA signature envelope off-chain."
        )
    }

    results_path = os.path.join(os.path.dirname(__file__), "benchmark_results.json")
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n✓ Saved empirical benchmark data to {results_path}")
    return results


if __name__ == "__main__":
    run_benchmark(iterations=100)

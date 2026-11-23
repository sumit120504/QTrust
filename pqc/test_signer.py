import json
import base64
from credential_signer import CredentialSigner

def test_credential_signing():
    print("============================================================")
    print("Q-Trust Post-Quantum Credential Signer Test Suite")
    print("NIST FIPS 204 ML-DSA-65 Degree Issuance & Tamper Resistance")
    print("============================================================\n")

    # 1. Initialize University Registrar Signer
    registrar = CredentialSigner(
        university_id="did:qtrust:university:uem_jaipur",
        university_name="University of Engineering & Management (UEM) Jaipur"
    )
    print(f"[TEST 1] University Public Key Fingerprint (Anchored on-chain):")
    print(f"  ✓ Fingerprint: {registrar.get_public_key_fingerprint()}")
    print(f"  ✓ Public Key Size: {len(registrar.pk)} bytes (NIST FIPS 204 ML-DSA-65)")

    # 2. Issue Degree Credential
    holder_did = "did:qtrust:holder:8f72a91c3d0e"
    commitment = "0x98f411ba7823e410a0123456789abcdef0123456789abcdef0123456789abcdef"
    credential = registrar.sign_credential(
        holder_did=holder_did,
        credential_commitment=commitment,
        degree="B.Tech Computer Science & Engineering",
        graduation_year=2027,
        cgpa_scaled=870, # 8.70
        roll_number="UEMJ/2023/BTECH/CSE/042"
    )

    print("\n[TEST 2] Issued Degree Credential Envelope:")
    print(f"  ✓ Credential ID: {credential['id']}")
    print(f"  ✓ Proof Type: {credential['proof']['type']}")
    print(f"  ✓ Signature Size: {credential['proof']['signatureSizeBytes']} bytes")

    # 3. Verify Valid Credential
    print("\n[TEST 3] Verifying Genuine Credential Envelope:")
    valid, msg = CredentialSigner.verify_credential(credential)
    print(f"  ✓ Verification Result: {valid} - {msg}")
    assert valid, "Valid credential failed verification!"

    # 4. Tamper Test 1: Adversary alters the commitment anchor in canonicalMessage
    print("\n[TEST 4] Tamper Test: Adversary alters the commitment anchor:")
    tampered_commit = json.loads(json.dumps(credential))
    tampered_commit["proof"]["canonicalMessage"] = tampered_commit["proof"]["canonicalMessage"].replace(
        commitment, "0x1111111111111111111111111111111111111111111111111111111111111111"
    )
    valid_c, msg_c = CredentialSigner.verify_credential(tampered_commit)
    print(f"  ✓ Tampered Commitment Verification: {valid_c} - {msg_c}")
    assert not valid_c, "Tampered commitment should fail verification!"

    # 5. Tamper Test 2: Adversary alters the holder DID in canonicalMessage
    print("\n[TEST 5] Tamper Test: Adversary transfers credential to another student DID:")
    tampered_did = json.loads(json.dumps(credential))
    tampered_did["proof"]["canonicalMessage"] = tampered_did["proof"]["canonicalMessage"].replace(
        holder_did, "did:qtrust:holder:adversary_stolen_id"
    )
    valid_d, msg_d = CredentialSigner.verify_credential(tampered_did)
    print(f"  ✓ Tampered DID Verification: {valid_d} - {msg_d}")
    assert not valid_d, "Tampered DID should fail verification!"

    # 6. Tamper Test 3: Adversary alters bytes inside the signature
    print("\n[TEST 6] Tamper Test: Adversary corrupts signature payload bytes:")
    tampered_sig = json.loads(json.dumps(credential))
    raw_sig = bytearray(base64.b64decode(tampered_sig["proof"]["signatureValue"]))
    raw_sig[100] ^= 0xFF # Flip bits
    tampered_sig["proof"]["signatureValue"] = base64.b64encode(raw_sig).decode("ascii")
    valid_s, msg_s = CredentialSigner.verify_credential(tampered_sig)
    print(f"  ✓ Corrupted Signature Verification: {valid_s} - {msg_s}")
    assert not valid_s, "Corrupted signature should fail verification!"

    print("\n============================================================")
    print("ALL POST-QUANTUM CREDENTIAL SIGNING TESTS PASSED! (6/6)")
    print("============================================================")

if __name__ == "__main__":
    test_credential_signing()

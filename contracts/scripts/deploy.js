const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("============================================================");
  console.log("Deploying Q-Trust Smart Contract Trust Framework");
  console.log("============================================================\n");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH\n`);

  // 1. Deploy IssuerRegistry
  console.log("1. Deploying IssuerRegistry...");
  const IssuerRegistryFactory = await ethers.getContractFactory("IssuerRegistry");
  const issuerRegistry = await IssuerRegistryFactory.deploy(deployer.address);
  await issuerRegistry.waitForDeployment();
  const issuerRegistryAddress = await issuerRegistry.getAddress();
  console.log(`   ✓ IssuerRegistry deployed at: ${issuerRegistryAddress}`);

  // 2. Deploy CredentialRegistry
  console.log("2. Deploying CredentialRegistry...");
  const CredentialRegistryFactory = await ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistryFactory.deploy(issuerRegistryAddress);
  await credentialRegistry.waitForDeployment();
  const credentialRegistryAddress = await credentialRegistry.getAddress();
  console.log(`   ✓ CredentialRegistry deployed at: ${credentialRegistryAddress}`);

  // 3. Deploy RevocationRegistry
  console.log("3. Deploying RevocationRegistry...");
  const RevocationRegistryFactory = await ethers.getContractFactory("RevocationRegistry");
  const revocationRegistry = await RevocationRegistryFactory.deploy(issuerRegistryAddress);
  await revocationRegistry.waitForDeployment();
  const revocationRegistryAddress = await revocationRegistry.getAddress();
  console.log(`   ✓ RevocationRegistry deployed at: ${revocationRegistryAddress}`);

  // 4. Deploy Groth16Verifier
  console.log("4. Deploying Groth16Verifier (BN254 Pairing Verifier)...");
  const Groth16VerifierFactory = await ethers.getContractFactory("Groth16Verifier");
  const groth16Verifier = await Groth16VerifierFactory.deploy();
  await groth16Verifier.waitForDeployment();
  const groth16VerifierAddress = await groth16Verifier.getAddress();
  console.log(`   ✓ Groth16Verifier deployed at: ${groth16VerifierAddress}`);

  // 5. Deploy QTrustAnchor Coordinator
  console.log("5. Deploying QTrustAnchor Coordinator...");
  const QTrustAnchorFactory = await ethers.getContractFactory("QTrustAnchor");
  const qTrustAnchor = await QTrustAnchorFactory.deploy(
    issuerRegistryAddress,
    credentialRegistryAddress,
    revocationRegistryAddress,
    groth16VerifierAddress
  );
  await qTrustAnchor.waitForDeployment();
  const qTrustAnchorAddress = await qTrustAnchor.getAddress();
  console.log(`   ✓ QTrustAnchor deployed at: ${qTrustAnchorAddress}\n`);

  // Export deployment JSON
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      IssuerRegistry: issuerRegistryAddress,
      CredentialRegistry: credentialRegistryAddress,
      RevocationRegistry: revocationRegistryAddress,
      Groth16Verifier: groth16VerifierAddress,
      QTrustAnchor: qTrustAnchorAddress,
    },
  };

  const outputPath = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`✓ Deployment addresses exported to: ${outputPath}`);
  console.log("============================================================");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Q-Trust | Decentralized Privacy-Preserving & Quantum-Resistant Credential Platform",
  description: "Final-Year B.Tech Project: Blockchain + ZKP (Groth16) + PQC (NIST ML-DSA FIPS 204) + W3C DID/VC 2.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#eaf2d7] text-[#22121b] antialiased min-h-screen selection:bg-[#ea9ab2] selection:text-[#22121b]">
        {children}
      </body>
    </html>
  );
}

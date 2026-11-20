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
    <html lang="en" className="dark">
      <body className="bg-[#060913] text-slate-100 antialiased min-h-screen selection:bg-cyan-500/20 selection:text-cyan-300">
        {children}
      </body>
    </html>
  );
}

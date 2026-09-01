import React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/landing/Logo.png";
import { COMPANY } from "@/lib/company";

const documents = [
  { href: "/legal/terms", label: "Terms and Conditions" },
  { href: "/legal/privacy", label: "Privacy Policy" },
];

/**
 * Shell for the public legal documents. Deliberately lighter than the landing
 * page chrome: someone arriving here from an app-store review or a signup
 * checkbox wants the document, not a marketing header.
 */
export default function LegalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" aria-label="Aparte home">
            <Image src={Logo} alt="Aparte" className="h-9 w-auto" priority />
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            {documents.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="text-slate-600 transition-colors hover:text-[#0f2f2a]"
              >
                {doc.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#e8dcc2] bg-[#f7f2ea]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/" className="transition-colors hover:text-[#0f2f2a]">
              Home
            </Link>
            {documents.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="transition-colors hover:text-[#0f2f2a]"
              >
                {doc.label}
              </Link>
            ))}
            <a
              href={`mailto:${COMPANY.emails.support}`}
              className="transition-colors hover:text-[#0f2f2a]"
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import WalletButton from "./WalletButton";
import { useContractHealth } from "@/hooks/useContractHealth";

export default function Navbar() {
  const { paused } = useContractHealth();
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [localeOpen, setLocaleOpen] = useState(false);

  const currentLocale = pathname.split("/")[1];
  const locales = [
    { code: "en", label: t("language.english") },
    { code: "fr", label: t("language.french") },
    { code: "sw", label: t("language.swahili") },
  ];

  const handleLanguageChange = (locale: string) => {
    const newPathname = pathname.replace(/^\/[a-z]{2}/, `/${locale}`);
    router.push(newPathname);
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    setLocaleOpen(false);
  };

  return (
    <>
      {paused && (
        <div className="bg-yellow-500 text-black text-center text-sm font-medium py-2 px-4">
          ⚠️ ScoutOff is currently under maintenance. Write actions are temporarily disabled.
        </div>
      )}
      <nav className="border-b border-gray-800 bg-brand-dark">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-brand-green font-bold text-xl tracking-tight">
            ScoutOff
          </Link>
          <div className="flex items-center gap-6 text-sm text-gray-300">
            <Link href="/scout" className="hover:text-white transition">
              {t("nav.scout_dashboard")}
            </Link>
            <Link href="/player" className="hover:text-white transition">
              {t("nav.player_dashboard")}
            </Link>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLocaleOpen(!localeOpen)}
                className="hover:text-white transition flex items-center gap-1"
              >
                {locales.find((l) => l.code === currentLocale)?.label || "Language"}
                <span className="text-xs">▼</span>
              </button>
              {localeOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-brand-dark border border-gray-800 rounded-lg shadow-lg z-50">
                  {locales.map((locale) => (
                    <button
                      key={locale.code}
                      onClick={() => handleLanguageChange(locale.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-brand-green hover:text-black transition ${
                        currentLocale === locale.code ? "bg-brand-green/20 text-brand-green" : ""
                      }`}
                    >
                      {locale.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <WalletButton />
          </div>
        </div>
      </nav>
    </>
  );
}

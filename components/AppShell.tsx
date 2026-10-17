"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  LayoutDashboard,
  type LucideIcon,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Panel", icon: LayoutDashboard },
  { href: "/ogrenciler", label: "Öğrenciler", icon: Users },
  { href: "/ogretmenler", label: "Öğretmenler", icon: UserCog },
  { href: "/siniflar", label: "Sınıflar", icon: CalendarClock },
  { href: "/aidatlar", label: "Aidatlar", icon: Wallet },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Masaüstü yan menü */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            GBT
          </div>
          <span className="text-sm font-semibold text-slate-800">
            Cimnastik Yönetimi
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4 text-xs text-slate-400">
          Veriler bu tarayıcıda saklanır (demo modu)
        </div>
      </aside>

      {/* Mobil üst bar */}
      <header className="flex h-14 items-center gap-2 border-b border-slate-200 bg-white px-4 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
          GBT
        </div>
        <span className="text-sm font-semibold text-slate-800">
          Cimnastik Yönetimi
        </span>
      </header>

      <main className="pb-20 md:ml-64 md:pb-8">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobil alt menü */}
      <nav className="fixed inset-x-0 bottom-0 flex items-stretch border-t border-slate-200 bg-white md:hidden">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium ${
                active ? "text-indigo-600" : "text-slate-500"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertTriangle,
  CalendarClock,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { useAppData } from "@/lib/store";
import { GUNLER } from "@/lib/types";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";

function buAyAnahtari() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function Panel() {
  const { ogrenciler, ogretmenler, siniflar, odemeler } = useAppData();

  const ay = buAyAnahtari();
  const bugunGun = GUNLER[(new Date().getDay() + 6) % 7];

  const aktifOgrenciler = ogrenciler.filter((o) => o.durum === "aktif");

  const buAyOdemeleri = useMemo(
    () => odemeler.filter((o) => o.ay === ay),
    [odemeler, ay]
  );

  const bekleyenOdemeler = useMemo(
    () =>
      buAyOdemeleri.filter(
        (o) => o.durum === "ödenmedi" || o.durum === "gecikmiş"
      ),
    [buAyOdemeleri]
  );

  const bekleyenTutar = bekleyenOdemeler.reduce((t, o) => t + o.tutar, 0);

  const bugunkuDersler = useMemo(() => {
    const liste: { sinifAdi: string; baslangic: string; bitis: string; ogretmen: string }[] = [];
    for (const sinif of siniflar) {
      for (const saat of sinif.saatler) {
        if (saat.gun === bugunGun) {
          const ogretmen = ogretmenler.find((o) => o.id === sinif.ogretmenId);
          liste.push({
            sinifAdi: sinif.ad,
            baslangic: saat.baslangic,
            bitis: saat.bitis,
            ogretmen: ogretmen?.adSoyad ?? "Atanmadı",
          });
        }
      }
    }
    return liste.sort((a, b) => a.baslangic.localeCompare(b.baslangic));
  }, [siniflar, ogretmenler, bugunGun]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Panel</h1>
        <p className="text-sm text-slate-500">
          Bugün {bugunGun}, hoş geldin 👋
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Aktif Öğrenci"
          value={aktifOgrenciler.length}
          icon={Users}
          tone="indigo"
        />
        <StatCard
          label="Öğretmen"
          value={ogretmenler.length}
          icon={UserCog}
          tone="emerald"
        />
        <StatCard
          label="Sınıf"
          value={siniflar.length}
          icon={CalendarClock}
          tone="amber"
        />
        <StatCard
          label="Bekleyen Aidat"
          value={`${bekleyenTutar.toLocaleString("tr-TR")} ₺`}
          icon={Wallet}
          tone="rose"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            Bugünün Dersleri ({bugunGun})
          </h2>
          {bugunkuDersler.length === 0 ? (
            <p className="text-sm text-slate-400">Bugün ders bulunmuyor.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {bugunkuDersler.map((d, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-800">{d.sinifAdi}</p>
                    <p className="text-xs text-slate-500">{d.ogretmen}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {d.baslangic} - {d.bitis}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Bekleyen Aidatlar
            </h2>
            <Link
              href="/aidatlar"
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              Tümünü gör
            </Link>
          </div>
          {bekleyenOdemeler.length === 0 ? (
            <p className="text-sm text-slate-400">
              Bu ay için bekleyen aidat yok.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {bekleyenOdemeler.slice(0, 6).map((odeme) => {
                const ogrenci = ogrenciler.find((o) => o.id === odeme.ogrenciId);
                return (
                  <li
                    key={odeme.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-800">
                      {ogrenci?.adSoyad ?? "Bilinmiyor"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {odeme.tutar.toLocaleString("tr-TR")} ₺
                      </span>
                      <Badge renk={odeme.durum === "gecikmiş" ? "kirmizi" : "sari"}>
                        {odeme.durum === "gecikmiş" ? (
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Gecikmiş
                          </span>
                        ) : (
                          "Ödenmedi"
                        )}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

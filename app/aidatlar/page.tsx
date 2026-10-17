"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppData } from "@/lib/store";
import type { OdemeDurumu } from "@/lib/types";
import Badge from "@/components/Badge";
import { selectCls } from "@/components/form";

const AY_ADLARI = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function ayEtiketi(ay: string) {
  const [yil, ayNo] = ay.split("-").map(Number);
  return `${AY_ADLARI[ayNo - 1]} ${yil}`;
}

function durumRengi(durum: OdemeDurumu) {
  if (durum === "ödendi") return "yesil" as const;
  if (durum === "gecikmiş") return "kirmizi" as const;
  return "sari" as const;
}

export default function AidatlarSayfasi() {
  const { odemeler, ogrenciler, siniflar, odemeDurumuDegistir } = useAppData();

  const aylar = useMemo(
    () => Array.from(new Set(odemeler.map((o) => o.ay))).sort(),
    [odemeler]
  );
  const [ayIndex, setAyIndex] = useState(aylar.length - 1);
  const seciliAy = aylar[ayIndex] ?? aylar[0];

  const ayOdemeleri = useMemo(
    () => odemeler.filter((o) => o.ay === seciliAy),
    [odemeler, seciliAy]
  );

  const toplamTahsilat = ayOdemeleri
    .filter((o) => o.durum === "ödendi")
    .reduce((t, o) => t + o.tutar, 0);
  const bekleyenTutar = ayOdemeleri
    .filter((o) => o.durum !== "ödendi")
    .reduce((t, o) => t + o.tutar, 0);
  const odeyenSayisi = ayOdemeleri.filter((o) => o.durum === "ödendi").length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Aidatlar</h1>
        <p className="text-sm text-slate-500">Aylık aidat ve ödeme takibi</p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setAyIndex((i) => Math.max(0, i - 1))}
          disabled={ayIndex === 0}
          className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[160px] text-center text-sm font-semibold text-slate-900">
          {seciliAy ? ayEtiketi(seciliAy) : "-"}
        </span>
        <button
          onClick={() => setAyIndex((i) => Math.min(aylar.length - 1, i + 1))}
          disabled={ayIndex >= aylar.length - 1}
          className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-slate-500">Tahsil Edilen</p>
          <p className="text-base font-semibold text-emerald-600">
            {toplamTahsilat.toLocaleString("tr-TR")} ₺
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-slate-500">Bekleyen</p>
          <p className="text-base font-semibold text-rose-600">
            {bekleyenTutar.toLocaleString("tr-TR")} ₺
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-slate-500">Ödeyen</p>
          <p className="text-base font-semibold text-slate-900">
            {odeyenSayisi}/{ayOdemeleri.length}
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {ayOdemeleri.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">
            Bu ay için ödeme kaydı yok.
          </p>
        )}
        {ayOdemeleri.map((odeme) => {
          const ogrenci = ogrenciler.find((o) => o.id === odeme.ogrenciId);
          const sinif = siniflar.find((s) => s.id === ogrenci?.sinifId);
          return (
            <div
              key={odeme.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {ogrenci?.adSoyad ?? "Bilinmiyor"}
                </p>
                <p className="text-xs text-slate-500">{sinif?.ad ?? "Sınıfsız"}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-slate-700">
                  {odeme.tutar.toLocaleString("tr-TR")} ₺
                </span>
                {odeme.odemeTarihi && (
                  <span className="text-xs text-slate-400">
                    Ödeme: {odeme.odemeTarihi}
                  </span>
                )}
                <Badge renk={durumRengi(odeme.durum)}>
                  {odeme.durum === "ödendi"
                    ? "Ödendi"
                    : odeme.durum === "gecikmiş"
                    ? "Gecikmiş"
                    : "Ödenmedi"}
                </Badge>
                <select
                  value={odeme.durum}
                  onChange={(e) =>
                    odemeDurumuDegistir(odeme.id, e.target.value as OdemeDurumu)
                  }
                  className={`${selectCls} w-auto py-1.5 text-xs`}
                >
                  <option value="ödendi">Ödendi</option>
                  <option value="ödenmedi">Ödenmedi</option>
                  <option value="gecikmiş">Gecikmiş</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

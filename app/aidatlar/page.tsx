"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useAppData } from "@/lib/store";
import {
  aidatAylari,
  ayAnahtari,
  ayEtiketi,
  aylikAidatlar,
  bugun,
  DURUM_ETIKETI,
  DURUM_RENGI,
} from "@/lib/aidat";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { Field, inputCls, primaryBtn, secondaryBtn } from "@/components/form";

const tl = (n: number) => `${n.toLocaleString("tr-TR")} ₺`;

export default function AidatlarSayfasi() {
  const { aidatOdemeleri, ogrenciler, siniflar, aidatOdemesiEkle, aidatOdemesiSil } =
    useAppData();

  const aylar = useMemo(() => aidatAylari(aidatOdemeleri), [aidatOdemeleri]);
  const [seciliAy, setSeciliAy] = useState(ayAnahtari);
  const ayIndex = aylar.indexOf(seciliAy);

  const satirlar = useMemo(
    () => aylikAidatlar(ogrenciler, aidatOdemeleri, seciliAy),
    [ogrenciler, aidatOdemeleri, seciliAy]
  );

  const [acikOgrenciId, setAcikOgrenciId] = useState<string | null>(null);
  const acikSatir = satirlar.find((s) => s.ogrenciId === acikOgrenciId) ?? null;
  const acikOgrenci = ogrenciler.find((o) => o.id === acikOgrenciId);
  const [form, setForm] = useState({ tutar: 0, odemeTarihi: bugun(), not: "" });

  function odemeAc(ogrenciId: string, kalan: number, beklenen: number) {
    setAcikOgrenciId(ogrenciId);
    setForm({ tutar: kalan || beklenen, odemeTarihi: bugun(), not: "" });
  }

  function odemeKaydet() {
    if (!acikOgrenciId || form.tutar <= 0 || !form.odemeTarihi) return;
    aidatOdemesiEkle({
      ogrenciId: acikOgrenciId,
      ay: seciliAy,
      tutar: form.tutar,
      odemeTarihi: form.odemeTarihi,
      not: form.not.trim() || null,
    });
    setAcikOgrenciId(null);
  }

  const toplamTahsilat = satirlar.reduce((t, s) => t + s.odenen, 0);
  const bekleyenTutar = satirlar.reduce((t, s) => t + s.kalan, 0);
  const odeyenSayisi = satirlar.filter((s) => s.durum === "ödendi").length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Aidatlar</h1>
        <p className="text-sm text-slate-500">Aylık aidat ve ödeme takibi</p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setSeciliAy(aylar[ayIndex - 1])}
          disabled={ayIndex <= 0}
          className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[160px] text-center text-sm font-semibold text-slate-900">
          {ayEtiketi(seciliAy)}
        </span>
        <button
          onClick={() => setSeciliAy(aylar[ayIndex + 1])}
          disabled={ayIndex < 0 || ayIndex >= aylar.length - 1}
          className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-slate-500">Tahsil Edilen</p>
          <p className="text-base font-semibold text-emerald-600">{tl(toplamTahsilat)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-slate-500">Bekleyen</p>
          <p className="text-base font-semibold text-rose-600">{tl(bekleyenTutar)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-slate-500">Ödeyen</p>
          <p className="text-base font-semibold text-slate-900">
            {odeyenSayisi}/{satirlar.length}
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {satirlar.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">Bu ay için aidat kaydı yok.</p>
        )}
        {satirlar.map((satir) => {
          const ogrenci = ogrenciler.find((o) => o.id === satir.ogrenciId);
          const sinif = siniflar.find((s) => s.id === ogrenci?.sinifId);
          return (
            <div
              key={satir.ogrenciId}
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
                  {tl(satir.odenen)} / {tl(satir.beklenen)}
                </span>
                <Badge renk={DURUM_RENGI[satir.durum]}>{DURUM_ETIKETI[satir.durum]}</Badge>
                <button
                  onClick={() => odemeAc(satir.ogrenciId, satir.kalan, satir.beklenen)}
                  className={`${secondaryBtn} px-3 py-1.5 text-xs`}
                >
                  <Plus className="h-3.5 w-3.5" /> Ödeme
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {acikSatir && (
        <Modal
          title={`${acikOgrenci?.adSoyad ?? "Öğrenci"} · ${ayEtiketi(seciliAy)}`}
          onClose={() => setAcikOgrenciId(null)}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-600">
                Ödenen {tl(acikSatir.odenen)}, kalan{" "}
                <span className="font-medium text-slate-900">{tl(acikSatir.kalan)}</span>
              </p>
              {acikSatir.odemeler.map((odeme) => (
                <div
                  key={odeme.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium text-slate-800">{tl(odeme.tutar)}</span>
                    <span className="ml-2 text-xs text-slate-500">{odeme.odemeTarihi}</span>
                    {odeme.not && <p className="text-xs text-slate-500">{odeme.not}</p>}
                  </div>
                  <button
                    onClick={() => aidatOdemesiSil(odeme.id)}
                    className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                    title="Ödemeyi sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <Field label="Tutar (₺)">
                <input
                  type="number"
                  min={1}
                  className={inputCls}
                  value={form.tutar}
                  onChange={(e) => setForm({ ...form, tutar: Number(e.target.value) })}
                />
              </Field>
              <Field label="Ödeme Tarihi">
                <input
                  type="date"
                  className={inputCls}
                  value={form.odemeTarihi}
                  onChange={(e) => setForm({ ...form, odemeTarihi: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Not">
              <input
                className={inputCls}
                placeholder="İsteğe bağlı"
                value={form.not}
                onChange={(e) => setForm({ ...form, not: e.target.value })}
              />
            </Field>

            <div className="mt-2 flex justify-end gap-2">
              <button onClick={() => setAcikOgrenciId(null)} className={secondaryBtn}>
                Kapat
              </button>
              <button onClick={odemeKaydet} disabled={form.tutar <= 0} className={primaryBtn}>
                Ödeme Ekle
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

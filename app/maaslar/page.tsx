"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useAppData } from "@/lib/store";
import { aidatAylari, ayAnahtari, ayEtiketi, bugun } from "@/lib/aidat";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { Field, inputCls, primaryBtn, secondaryBtn } from "@/components/form";

const tl = (n: number) => `${n.toLocaleString("tr-TR")} ₺`;

export default function MaaslarSayfasi() {
  const { ogretmenler, personelOdemeleri, personelOdemesiEkle, personelOdemesiSil } =
    useAppData();

  const aylar = useMemo(() => aidatAylari(personelOdemeleri), [personelOdemeleri]);
  const [seciliAy, setSeciliAy] = useState(ayAnahtari);
  const ayIndex = aylar.indexOf(seciliAy);

  const ayOdemeleri = useMemo(
    () => personelOdemeleri.filter((o) => o.ay === seciliAy),
    [personelOdemeleri, seciliAy]
  );

  // Aktif hocalar ve o ay ödeme almış pasif hocalar listelenir.
  const satirlar = useMemo(
    () =>
      ogretmenler
        .map((ogretmen) => {
          const odemeler = ayOdemeleri.filter((o) => o.ogretmenId === ogretmen.id);
          return { ogretmen, odemeler, toplam: odemeler.reduce((t, o) => t + o.tutar, 0) };
        })
        .filter((s) => s.ogretmen.durum === "aktif" || s.odemeler.length > 0),
    [ogretmenler, ayOdemeleri]
  );

  const toplamOdenen = ayOdemeleri.reduce((t, o) => t + o.tutar, 0);
  const odemeAlmayan = satirlar.filter((s) => s.odemeler.length === 0).length;

  const [acikOgretmenId, setAcikOgretmenId] = useState<string | null>(null);
  const [form, setForm] = useState({ tutar: 0, odemeTarihi: bugun(), not: "" });

  function odemeAc(ogretmenId: string) {
    // Önceki ayın tutarını öneri olarak getir
    const sonOdeme = personelOdemeleri.filter((o) => o.ogretmenId === ogretmenId).at(-1);
    setAcikOgretmenId(ogretmenId);
    setForm({ tutar: sonOdeme?.tutar ?? 0, odemeTarihi: bugun(), not: "" });
  }

  function odemeKaydet() {
    if (!acikOgretmenId || form.tutar <= 0 || !form.odemeTarihi) return;
    personelOdemesiEkle({
      ogretmenId: acikOgretmenId,
      ay: seciliAy,
      tutar: form.tutar,
      odemeTarihi: form.odemeTarihi,
      not: form.not.trim() || null,
    });
    setAcikOgretmenId(null);
  }

  function sil(id: string) {
    if (confirm("Bu ödeme kaydı silinsin mi?")) personelOdemesiSil(id);
  }

  const acikOgretmen = ogretmenler.find((o) => o.id === acikOgretmenId);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Maaşlar</h1>
        <p className="text-sm text-slate-500">Hoca ve personel ödemeleri</p>
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

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-slate-500">Toplam Ödenen</p>
          <p className="text-base font-semibold text-slate-900">{tl(toplamOdenen)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-slate-500">Ödeme Almayan</p>
          <p className="text-base font-semibold text-rose-600">{odemeAlmayan}</p>
        </div>
      </div>

      <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {satirlar.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">Kayıtlı hoca yok.</p>
        )}
        {satirlar.map(({ ogretmen, odemeler, toplam }) => (
          <div key={ogretmen.id} className="flex flex-col gap-3 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{ogretmen.adSoyad}</p>
                <p className="text-xs text-slate-500">{ogretmen.brans || "Branş yok"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {odemeler.length > 0 ? (
                  <Badge renk="yesil">{tl(toplam)}</Badge>
                ) : (
                  <Badge renk="sari">Ödenmedi</Badge>
                )}
                <button
                  onClick={() => odemeAc(ogretmen.id)}
                  className={`${secondaryBtn} px-3 py-1.5 text-xs`}
                >
                  <Plus className="h-3.5 w-3.5" /> Ödeme
                </button>
              </div>
            </div>
            {odemeler.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {odemeler.map((odeme) => (
                  <li
                    key={odeme.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <div>
                      <span className="font-medium text-slate-800">{tl(odeme.tutar)}</span>
                      <span className="ml-2 text-xs text-slate-500">{odeme.odemeTarihi}</span>
                      {odeme.not && (
                        <span className="ml-2 text-xs text-slate-500">· {odeme.not}</span>
                      )}
                    </div>
                    <button
                      onClick={() => sil(odeme.id)}
                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                      title="Ödemeyi sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {acikOgretmenId && (
        <Modal
          title={`${acikOgretmen?.adSoyad ?? "Hoca"} · ${ayEtiketi(seciliAy)}`}
          onClose={() => setAcikOgretmenId(null)}
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tutar (₺)">
                <input
                  type="number"
                  min={1}
                  className={inputCls}
                  value={form.tutar}
                  onChange={(e) => setForm({ ...form, tutar: Number(e.target.value) })}
                  autoFocus
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
                placeholder="Örn. Ekim maaşı"
                value={form.not}
                onChange={(e) => setForm({ ...form, not: e.target.value })}
              />
            </Field>
            <div className="mt-2 flex justify-end gap-2">
              <button onClick={() => setAcikOgretmenId(null)} className={secondaryBtn}>
                Vazgeç
              </button>
              <button onClick={odemeKaydet} disabled={form.tutar <= 0} className={primaryBtn}>
                Kaydet
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

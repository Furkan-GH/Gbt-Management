"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useAppData } from "@/lib/store";
import type { Ogrenci } from "@/lib/types";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { Field, inputCls, primaryBtn, secondaryBtn, selectCls } from "@/components/form";

type FormDegeri = Omit<Ogrenci, "id" | "kayitTarihi">;

const BOS_FORM: FormDegeri = {
  adSoyad: "",
  telefon: "",
  veliTelefon: "",
  dogumTarihi: "",
  sinifId: null,
  aidatTutari: 1200,
  durum: "aktif",
};

export default function OgrencilerSayfasi() {
  const {
    ogrenciler,
    siniflar,
    ogrenciEkle,
    ogrenciGuncelle,
    ogrenciSil,
    ogrenciSinifDegistir,
  } = useAppData();

  const [arama, setArama] = useState("");
  const [sinifFiltre, setSinifFiltre] = useState("hepsi");
  const [durumFiltre, setDurumFiltre] = useState("hepsi");
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenenId, setDuzenlenenId] = useState<string | null>(null);
  const [form, setForm] = useState<FormDegeri>(BOS_FORM);

  const filtrelenmis = useMemo(() => {
    return ogrenciler.filter((o) => {
      const aramaUyumu = o.adSoyad.toLowerCase().includes(arama.toLowerCase());
      const sinifUyumu = sinifFiltre === "hepsi" || o.sinifId === sinifFiltre;
      const durumUyumu = durumFiltre === "hepsi" || o.durum === durumFiltre;
      return aramaUyumu && sinifUyumu && durumUyumu;
    });
  }, [ogrenciler, arama, sinifFiltre, durumFiltre]);

  function yeniEkleAc() {
    setDuzenlenenId(null);
    setForm(BOS_FORM);
    setModalAcik(true);
  }

  function duzenleAc(ogrenci: Ogrenci) {
    setDuzenlenenId(ogrenci.id);
    setForm({
      adSoyad: ogrenci.adSoyad,
      telefon: ogrenci.telefon,
      veliTelefon: ogrenci.veliTelefon,
      dogumTarihi: ogrenci.dogumTarihi,
      sinifId: ogrenci.sinifId,
      aidatTutari: ogrenci.aidatTutari,
      durum: ogrenci.durum,
    });
    setModalAcik(true);
  }

  function kaydet() {
    if (!form.adSoyad.trim()) return;
    if (duzenlenenId) {
      ogrenciGuncelle(duzenlenenId, form);
    } else {
      ogrenciEkle(form);
    }
    setModalAcik(false);
  }

  function sil(ogrenci: Ogrenci) {
    if (confirm(`${ogrenci.adSoyad} ve tüm aidat ödemesi kayıtları silinsin mi?`)) {
      ogrenciSil(ogrenci.id);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Öğrenciler</h1>
          <p className="text-sm text-slate-500">{filtrelenmis.length} öğrenci</p>
        </div>
        <button onClick={yeniEkleAc} className={primaryBtn}>
          <Plus className="h-4 w-4" /> Öğrenci Ekle
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Öğrenci ara..."
            className={`${inputCls} pl-9`}
          />
        </div>
        <select
          value={sinifFiltre}
          onChange={(e) => setSinifFiltre(e.target.value)}
          className={`${selectCls} sm:w-48`}
        >
          <option value="hepsi">Tüm Sınıflar</option>
          {siniflar.map((s) => (
            <option key={s.id} value={s.id}>
              {s.ad}
            </option>
          ))}
        </select>
        <select
          value={durumFiltre}
          onChange={(e) => setDurumFiltre(e.target.value)}
          className={`${selectCls} sm:w-36`}
        >
          <option value="hepsi">Tüm Durumlar</option>
          <option value="aktif">Aktif</option>
          <option value="pasif">Pasif</option>
        </select>
      </div>

      <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filtrelenmis.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">
            Sonuç bulunamadı.
          </p>
        )}
        {filtrelenmis.map((ogrenci) => (
          <div
            key={ogrenci.id}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                {ogrenci.adSoyad
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {ogrenci.adSoyad}
                </p>
                <p className="text-xs text-slate-500">{ogrenci.telefon}</p>
              </div>
              <Badge renk={ogrenci.durum === "aktif" ? "yesil" : "gri"}>
                {ogrenci.durum === "aktif" ? "Aktif" : "Pasif"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <select
                value={ogrenci.sinifId ?? ""}
                onChange={(e) =>
                  ogrenciSinifDegistir(ogrenci.id, e.target.value || null)
                }
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500"
                title="Sınıf değiştir"
              >
                <option value="">Sınıfsız</option>
                {siniflar.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ad}
                  </option>
                ))}
              </select>
              <span className="text-xs font-medium text-slate-600">
                {ogrenci.aidatTutari.toLocaleString("tr-TR")} ₺/ay
              </span>
              <button
                onClick={() => duzenleAc(ogrenci)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                title="Düzenle"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => sil(ogrenci)}
                className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                title="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalAcik && (
        <Modal
          title={duzenlenenId ? "Öğrenciyi Düzenle" : "Öğrenci Ekle"}
          onClose={() => setModalAcik(false)}
        >
          <div className="flex flex-col gap-4">
            <Field label="Ad Soyad">
              <input
                className={inputCls}
                value={form.adSoyad}
                onChange={(e) => setForm({ ...form, adSoyad: e.target.value })}
                autoFocus
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Öğrenci Telefonu">
                <input
                  className={inputCls}
                  value={form.telefon}
                  onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                />
              </Field>
              <Field label="Veli Telefonu">
                <input
                  className={inputCls}
                  value={form.veliTelefon}
                  onChange={(e) =>
                    setForm({ ...form, veliTelefon: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Doğum Tarihi">
                <input
                  type="date"
                  className={inputCls}
                  value={form.dogumTarihi}
                  onChange={(e) =>
                    setForm({ ...form, dogumTarihi: e.target.value })
                  }
                />
              </Field>
              <Field label="Aylık Aidat (₺)">
                <input
                  type="number"
                  className={inputCls}
                  value={form.aidatTutari}
                  onChange={(e) =>
                    setForm({ ...form, aidatTutari: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Sınıf">
                <select
                  className={selectCls}
                  value={form.sinifId ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, sinifId: e.target.value || null })
                  }
                >
                  <option value="">Sınıfsız</option>
                  {siniflar.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.ad}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Durum">
                <select
                  className={selectCls}
                  value={form.durum}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      durum: e.target.value as "aktif" | "pasif",
                    })
                  }
                >
                  <option value="aktif">Aktif</option>
                  <option value="pasif">Pasif</option>
                </select>
              </Field>
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => setModalAcik(false)}
                className={secondaryBtn}
              >
                Vazgeç
              </button>
              <button onClick={kaydet} className={primaryBtn}>
                Kaydet
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

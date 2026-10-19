"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAppData } from "@/lib/store";
import type { Ogretmen } from "@/lib/types";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { Field, inputCls, primaryBtn, secondaryBtn, selectCls } from "@/components/form";

type FormDegeri = Omit<Ogretmen, "id">;

const BOS_FORM: FormDegeri = {
  adSoyad: "",
  telefon: "",
  brans: "",
  durum: "aktif",
};

export default function OgretmenlerSayfasi() {
  const { ogretmenler, siniflar, ogretmenEkle, ogretmenGuncelle, ogretmenSil } =
    useAppData();

  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenenId, setDuzenlenenId] = useState<string | null>(null);
  const [form, setForm] = useState<FormDegeri>(BOS_FORM);

  function yeniEkleAc() {
    setDuzenlenenId(null);
    setForm(BOS_FORM);
    setModalAcik(true);
  }

  function duzenleAc(ogretmen: Ogretmen) {
    setDuzenlenenId(ogretmen.id);
    setForm({
      adSoyad: ogretmen.adSoyad,
      telefon: ogretmen.telefon,
      brans: ogretmen.brans,
      durum: ogretmen.durum,
    });
    setModalAcik(true);
  }

  function kaydet() {
    if (!form.adSoyad.trim()) return;
    if (duzenlenenId) {
      ogretmenGuncelle(duzenlenenId, form);
    } else {
      ogretmenEkle(form);
    }
    setModalAcik(false);
  }

  function sil(ogretmen: Ogretmen) {
    if (confirm(`${ogretmen.adSoyad} ve tüm maaş ödemesi kayıtları silinsin mi?`)) {
      ogretmenSil(ogretmen.id);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Öğretmenler</h1>
          <p className="text-sm text-slate-500">{ogretmenler.length} öğretmen</p>
        </div>
        <button onClick={yeniEkleAc} className={primaryBtn}>
          <Plus className="h-4 w-4" /> Öğretmen Ekle
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ogretmenler.map((ogretmen) => {
          const siniflari = siniflar.filter((s) => s.ogretmenId === ogretmen.id);
          return (
            <div
              key={ogretmen.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                    {ogretmen.adSoyad
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {ogretmen.adSoyad}
                    </p>
                    <p className="text-xs text-slate-500">{ogretmen.telefon}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => duzenleAc(ogretmen)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                    title="Düzenle"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => sil(ogretmen)}
                    className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge renk="mavi">{ogretmen.brans}</Badge>
                <Badge renk={ogretmen.durum === "aktif" ? "yesil" : "gri"}>
                  {ogretmen.durum === "aktif" ? "Aktif" : "Pasif"}
                </Badge>
              </div>

              <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                {siniflari.length === 0 ? (
                  "Henüz sınıfı yok"
                ) : (
                  <span>
                    Sınıfları:{" "}
                    <span className="font-medium text-slate-700">
                      {siniflari.map((s) => s.ad).join(", ")}
                    </span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalAcik && (
        <Modal
          title={duzenlenenId ? "Öğretmeni Düzenle" : "Öğretmen Ekle"}
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
            <Field label="Telefon">
              <input
                className={inputCls}
                value={form.telefon}
                onChange={(e) => setForm({ ...form, telefon: e.target.value })}
              />
            </Field>
            <Field label="Branş">
              <input
                className={inputCls}
                placeholder="Örn. Artistik Cimnastik"
                value={form.brans}
                onChange={(e) => setForm({ ...form, brans: e.target.value })}
              />
            </Field>
            <Field label="Durum">
              <select
                className={selectCls}
                value={form.durum}
                onChange={(e) =>
                  setForm({ ...form, durum: e.target.value as "aktif" | "pasif" })
                }
              >
                <option value="aktif">Aktif</option>
                <option value="pasif">Pasif</option>
              </select>
            </Field>

            <div className="mt-2 flex justify-end gap-2">
              <button onClick={() => setModalAcik(false)} className={secondaryBtn}>
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

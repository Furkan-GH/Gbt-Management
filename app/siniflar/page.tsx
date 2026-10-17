"use client";

import { useState } from "react";
import { Plus, Trash2, Users, X } from "lucide-react";
import { useAppData } from "@/lib/store";
import type { Gun, Sinif } from "@/lib/types";
import { GUNLER } from "@/lib/types";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { Field, inputCls, primaryBtn, secondaryBtn, selectCls } from "@/components/form";

type FormDegeri = Omit<Sinif, "id" | "saatler">;

const BOS_FORM: FormDegeri = {
  ad: "",
  brans: "",
  ogretmenId: null,
  kapasite: 10,
};

export default function SiniflarSayfasi() {
  const {
    siniflar,
    ogretmenler,
    ogrenciler,
    sinifEkle,
    sinifGuncelle,
    sinifSil,
    dersSaatiEkle,
    dersSaatiSil,
    ogrenciSinifDegistir,
  } = useAppData();

  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState<FormDegeri>(BOS_FORM);
  const [saatFormuAcikId, setSaatFormuAcikId] = useState<string | null>(null);
  const [yeniSaat, setYeniSaat] = useState<{ gun: Gun; baslangic: string; bitis: string }>(
    { gun: "Pazartesi", baslangic: "17:00", bitis: "18:00" }
  );
  const [rosterSinifId, setRosterSinifId] = useState<string | null>(null);

  const rosterSinif = siniflar.find((s) => s.id === rosterSinifId) ?? null;
  const rosterOgrenciler = rosterSinif
    ? ogrenciler.filter((o) => o.sinifId === rosterSinif.id)
    : [];

  function ogretmenAdi(ogretmenId: string | null) {
    return ogretmenler.find((o) => o.id === ogretmenId)?.adSoyad ?? null;
  }

  function yeniEkleAc() {
    setForm(BOS_FORM);
    setModalAcik(true);
  }

  function kaydet() {
    if (!form.ad.trim()) return;
    sinifEkle(form);
    setModalAcik(false);
  }

  function sil(sinif: Sinif) {
    const ogrenciSayisi = ogrenciler.filter((o) => o.sinifId === sinif.id).length;
    const uyari =
      ogrenciSayisi > 0
        ? `${sinif.ad} sınıfında ${ogrenciSayisi} öğrenci var. Silinince öğrenciler sınıfsız kalır. Devam edilsin mi?`
        : `${sinif.ad} silinsin mi?`;
    if (confirm(uyari)) {
      sinifSil(sinif.id);
    }
  }

  function saatEkle(sinifId: string) {
    dersSaatiEkle(sinifId, yeniSaat);
    setSaatFormuAcikId(null);
    setYeniSaat({ gun: "Pazartesi", baslangic: "17:00", bitis: "18:00" });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Sınıflar</h1>
          <p className="text-sm text-slate-500">{siniflar.length} sınıf</p>
        </div>
        <button onClick={yeniEkleAc} className={primaryBtn}>
          <Plus className="h-4 w-4" /> Sınıf Ekle
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {siniflar.map((sinif) => {
          const ogrenciSayisi = ogrenciler.filter((o) => o.sinifId === sinif.id).length;
          const doluluk = Math.min(100, (ogrenciSayisi / sinif.kapasite) * 100);
          return (
            <div
              key={sinif.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{sinif.ad}</p>
                  <Badge renk="mavi">{sinif.brans}</Badge>
                </div>
                <button
                  onClick={() => sil(sinif)}
                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                  title="Sınıfı sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Öğretmen
                </label>
                <select
                  className={selectCls}
                  value={sinif.ogretmenId ?? ""}
                  onChange={(e) =>
                    sinifGuncelle(sinif.id, { ogretmenId: e.target.value || null })
                  }
                >
                  <option value="">Atanmadı</option>
                  {ogretmenler.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.adSoyad}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Doluluk: {ogrenciSayisi}/{sinif.kapasite}
                  </span>
                  <input
                    type="number"
                    value={sinif.kapasite}
                    onChange={(e) =>
                      sinifGuncelle(sinif.id, { kapasite: Number(e.target.value) })
                    }
                    className="w-16 rounded border border-slate-300 px-1.5 py-0.5 text-right text-xs"
                  />
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      doluluk >= 100 ? "bg-rose-500" : "bg-indigo-500"
                    }`}
                    style={{ width: `${doluluk}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <button
                    onClick={() => setRosterSinifId(sinif.id)}
                    className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600"
                  >
                    <Users className="h-3 w-3" /> Ders Saatleri · {ogrenciSayisi} öğrenci
                  </button>
                  <button
                    onClick={() =>
                      setSaatFormuAcikId(
                        saatFormuAcikId === sinif.id ? null : sinif.id
                      )
                    }
                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Saat Ekle
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sinif.saatler.length === 0 && (
                    <span className="text-xs text-slate-400">
                      Henüz saat eklenmedi
                    </span>
                  )}
                  {sinif.saatler.map((saat) => (
                    <div
                      key={saat.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setRosterSinifId(sinif.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setRosterSinifId(sinif.id);
                      }}
                      title="Bu saatteki öğrencileri gör"
                      className="flex cursor-pointer items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
                    >
                      {saat.gun} {saat.baslangic}-{saat.bitis}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dersSaatiSil(sinif.id, saat.id);
                        }}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {saatFormuAcikId === sinif.id && (
                  <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg bg-slate-50 p-3">
                    <select
                      className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                      value={yeniSaat.gun}
                      onChange={(e) =>
                        setYeniSaat({ ...yeniSaat, gun: e.target.value as Gun })
                      }
                    >
                      {GUNLER.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <input
                      type="time"
                      className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                      value={yeniSaat.baslangic}
                      onChange={(e) =>
                        setYeniSaat({ ...yeniSaat, baslangic: e.target.value })
                      }
                    />
                    <input
                      type="time"
                      className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                      value={yeniSaat.bitis}
                      onChange={(e) =>
                        setYeniSaat({ ...yeniSaat, bitis: e.target.value })
                      }
                    />
                    <button
                      onClick={() => saatEkle(sinif.id)}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                      Ekle
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalAcik && (
        <Modal title="Sınıf Ekle" onClose={() => setModalAcik(false)}>
          <div className="flex flex-col gap-4">
            <Field label="Sınıf Adı">
              <input
                className={inputCls}
                value={form.ad}
                onChange={(e) => setForm({ ...form, ad: e.target.value })}
                autoFocus
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
            <div className="grid grid-cols-2 gap-3">
              <Field label="Öğretmen">
                <select
                  className={selectCls}
                  value={form.ogretmenId ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, ogretmenId: e.target.value || null })
                  }
                >
                  <option value="">Atanmadı</option>
                  {ogretmenler.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.adSoyad}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Kapasite">
                <input
                  type="number"
                  className={inputCls}
                  value={form.kapasite}
                  onChange={(e) =>
                    setForm({ ...form, kapasite: Number(e.target.value) })
                  }
                />
              </Field>
            </div>

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

      {rosterSinif && (
        <Modal
          title={`${rosterSinif.ad} — Öğrenciler`}
          onClose={() => setRosterSinifId(null)}
        >
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-500">
              {ogretmenAdi(rosterSinif.ogretmenId) ?? "Öğretmen atanmadı"} ·{" "}
              {rosterOgrenciler.length}/{rosterSinif.kapasite} öğrenci
            </p>

            {rosterOgrenciler.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">
                Bu sınıfta henüz öğrenci yok.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-slate-100">
                {rosterOgrenciler.map((ogrenci) => (
                  <div
                    key={ogrenci.id}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {ogrenci.adSoyad}
                      </p>
                      <p className="text-xs text-slate-500">{ogrenci.telefon}</p>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-500">
                      Sınıfa aktar:
                      <select
                        value={ogrenci.sinifId ?? ""}
                        onChange={(e) =>
                          ogrenciSinifDegistir(ogrenci.id, e.target.value || null)
                        }
                        className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500"
                      >
                        <option value="">Sınıfsız</option>
                        {siniflar.map((s) => {
                          const hoca = ogretmenAdi(s.ogretmenId);
                          return (
                            <option key={s.id} value={s.id}>
                              {s.ad}
                              {hoca ? ` — ${hoca}` : ""}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

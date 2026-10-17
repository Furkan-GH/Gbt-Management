"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  DersSaati,
  Odeme,
  OdemeDurumu,
  Ogrenci,
  Ogretmen,
  Sinif,
} from "./types";
import {
  initialOdemeleriUret,
  seedOgrenciler,
  seedOgretmenler,
  seedSiniflar,
} from "./seed-data";

type AppData = {
  ogretmenler: Ogretmen[];
  siniflar: Sinif[];
  ogrenciler: Ogrenci[];
  odemeler: Odeme[];
};

type AppDataContextValue = AppData & {
  // Öğretmen
  ogretmenEkle: (veri: Omit<Ogretmen, "id">) => void;
  ogretmenGuncelle: (id: string, veri: Partial<Omit<Ogretmen, "id">>) => void;
  ogretmenSil: (id: string) => void;
  // Sınıf
  sinifEkle: (veri: Omit<Sinif, "id" | "saatler">) => void;
  sinifGuncelle: (id: string, veri: Partial<Omit<Sinif, "id" | "saatler">>) => void;
  sinifSil: (id: string) => void;
  dersSaatiEkle: (sinifId: string, saat: Omit<DersSaati, "id">) => void;
  dersSaatiSil: (sinifId: string, saatId: string) => void;
  // Öğrenci
  ogrenciEkle: (veri: Omit<Ogrenci, "id" | "kayitTarihi">) => void;
  ogrenciGuncelle: (id: string, veri: Partial<Omit<Ogrenci, "id">>) => void;
  ogrenciSil: (id: string) => void;
  ogrenciSinifDegistir: (ogrenciId: string, yeniSinifId: string | null) => void;
  // Aidat
  odemeDurumuDegistir: (odemeId: string, durum: OdemeDurumu) => void;
  resetData: () => void;
};

const STORAGE_KEY = "gbt-management-data-v1";

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function olustur(): AppData {
  return {
    ogretmenler: seedOgretmenler,
    siniflar: seedSiniflar,
    ogrenciler: seedOgrenciler,
    odemeler: initialOdemeleriUret(seedOgrenciler),
  };
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => olustur());
  const yuklendi = useRef(false);

  useEffect(() => {
    try {
      const ham = window.localStorage.getItem(STORAGE_KEY);
      if (ham) {
        // localStorage sadece tarayıcıda okunabiliyor, bu yüzden seed veriyle
        // SSR uyumsuzluğu yaşamamak için gerçek veriyi mount sonrası yüklüyoruz.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData(JSON.parse(ham) as AppData);
      }
    } catch {
      // bozuk veri varsa seed veriyle devam et
    } finally {
      yuklendi.current = true;
    }
  }, []);

  useEffect(() => {
    if (!yuklendi.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage kullanılamıyorsa sessizce yoksay
    }
  }, [data]);

  const value = useMemo<AppDataContextValue>(() => {
    return {
      ...data,

      ogretmenEkle: (veri) =>
        setData((d) => ({
          ...d,
          ogretmenler: [...d.ogretmenler, { ...veri, id: uuid() }],
        })),

      ogretmenGuncelle: (id, veri) =>
        setData((d) => ({
          ...d,
          ogretmenler: d.ogretmenler.map((o) =>
            o.id === id ? { ...o, ...veri } : o
          ),
        })),

      ogretmenSil: (id) =>
        setData((d) => ({
          ...d,
          ogretmenler: d.ogretmenler.filter((o) => o.id !== id),
          siniflar: d.siniflar.map((s) =>
            s.ogretmenId === id ? { ...s, ogretmenId: null } : s
          ),
        })),

      sinifEkle: (veri) =>
        setData((d) => ({
          ...d,
          siniflar: [...d.siniflar, { ...veri, id: uuid(), saatler: [] }],
        })),

      sinifGuncelle: (id, veri) =>
        setData((d) => ({
          ...d,
          siniflar: d.siniflar.map((s) => (s.id === id ? { ...s, ...veri } : s)),
        })),

      sinifSil: (id) =>
        setData((d) => ({
          ...d,
          siniflar: d.siniflar.filter((s) => s.id !== id),
          ogrenciler: d.ogrenciler.map((o) =>
            o.sinifId === id ? { ...o, sinifId: null } : o
          ),
        })),

      dersSaatiEkle: (sinifId, saat) =>
        setData((d) => ({
          ...d,
          siniflar: d.siniflar.map((s) =>
            s.id === sinifId
              ? { ...s, saatler: [...s.saatler, { ...saat, id: uuid() }] }
              : s
          ),
        })),

      dersSaatiSil: (sinifId, saatId) =>
        setData((d) => ({
          ...d,
          siniflar: d.siniflar.map((s) =>
            s.id === sinifId
              ? { ...s, saatler: s.saatler.filter((sa) => sa.id !== saatId) }
              : s
          ),
        })),

      ogrenciEkle: (veri) =>
        setData((d) => {
          const yeniOgrenci: Ogrenci = {
            ...veri,
            id: uuid(),
            kayitTarihi: new Date().toISOString().slice(0, 10),
          };
          const simdi = new Date();
          const ay = `${simdi.getFullYear()}-${String(
            simdi.getMonth() + 1
          ).padStart(2, "0")}`;
          return {
            ...d,
            ogrenciler: [...d.ogrenciler, yeniOgrenci],
            odemeler: [
              ...d.odemeler,
              {
                id: uuid(),
                ogrenciId: yeniOgrenci.id,
                ay,
                tutar: yeniOgrenci.aidatTutari,
                durum: "ödenmedi",
                odemeTarihi: null,
              },
            ],
          };
        }),

      ogrenciGuncelle: (id, veri) =>
        setData((d) => ({
          ...d,
          ogrenciler: d.ogrenciler.map((o) =>
            o.id === id ? { ...o, ...veri } : o
          ),
        })),

      ogrenciSil: (id) =>
        setData((d) => ({
          ...d,
          ogrenciler: d.ogrenciler.filter((o) => o.id !== id),
          odemeler: d.odemeler.filter((o) => o.ogrenciId !== id),
        })),

      ogrenciSinifDegistir: (ogrenciId, yeniSinifId) =>
        setData((d) => ({
          ...d,
          ogrenciler: d.ogrenciler.map((o) =>
            o.id === ogrenciId ? { ...o, sinifId: yeniSinifId } : o
          ),
        })),

      odemeDurumuDegistir: (odemeId, durum) =>
        setData((d) => ({
          ...d,
          odemeler: d.odemeler.map((o) =>
            o.id === odemeId
              ? {
                  ...o,
                  durum,
                  odemeTarihi:
                    durum === "ödendi"
                      ? new Date().toISOString().slice(0, 10)
                      : null,
                }
              : o
          ),
        })),

      resetData: () => setData(olustur()),
    };
  }, [data]);

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData, AppDataProvider içinde kullanılmalı");
  }
  return ctx;
}

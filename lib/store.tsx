"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/utils/supabase/client";
import type {
  AidatOdemesi,
  DersSaati,
  Gun,
  Ogrenci,
  Ogretmen,
  PersonelOdemesi,
  Sinif,
} from "./types";

type AppData = {
  ogretmenler: Ogretmen[];
  siniflar: Sinif[];
  ogrenciler: Ogrenci[];
  aidatOdemeleri: AidatOdemesi[];
  personelOdemeleri: PersonelOdemesi[];
};

type AppDataContextValue = AppData & {
  yukleniyor: boolean;
  hata: string | null;
  hatayiKapat: () => void;
  yenile: () => Promise<void>;
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
  aidatOdemesiEkle: (veri: Omit<AidatOdemesi, "id">) => void;
  aidatOdemesiSil: (id: string) => void;
  // Personel ödemeleri
  personelOdemesiEkle: (veri: Omit<PersonelOdemesi, "id">) => void;
  personelOdemesiSil: (id: string) => void;
};

const BOS_VERI: AppData = {
  ogretmenler: [],
  siniflar: [],
  ogrenciler: [],
  aidatOdemeleri: [],
  personelOdemeleri: [],
};

// ---- Supabase satırları <-> uygulama tipleri ----

type StaffRow = {
  id: string;
  full_name: string;
  phone: string | null;
  branch: string | null;
  is_active: boolean;
};

type ClassRow = {
  id: string;
  name: string;
  branch: string | null;
  teacher_id: string | null;
  capacity: number;
  class_schedules: { id: string; day: Gun; start_time: string; end_time: string }[];
};

type StudentRow = {
  id: string;
  full_name: string;
  phone: string | null;
  parent_phone: string | null;
  birth_date: string | null;
  class_id: string | null;
  monthly_fee: number;
  is_active: boolean;
  created_at: string;
};

type PaymentRow = {
  id: string;
  amount: number;
  period: string;
  paid_at: string;
  note: string | null;
};

const ogretmenSatiri = (r: StaffRow): Ogretmen => ({
  id: r.id,
  adSoyad: r.full_name,
  telefon: r.phone ?? "",
  brans: r.branch ?? "",
  durum: r.is_active ? "aktif" : "pasif",
});

const sinifSatiri = (r: ClassRow): Sinif => ({
  id: r.id,
  ad: r.name,
  brans: r.branch ?? "",
  ogretmenId: r.teacher_id,
  kapasite: r.capacity,
  saatler: r.class_schedules.map((s) => ({
    id: s.id,
    gun: s.day,
    // Postgres "time" alanı "17:00:00" döndürür
    baslangic: s.start_time.slice(0, 5),
    bitis: s.end_time.slice(0, 5),
  })),
});

const ogrenciSatiri = (r: StudentRow): Ogrenci => ({
  id: r.id,
  adSoyad: r.full_name,
  telefon: r.phone ?? "",
  veliTelefon: r.parent_phone ?? "",
  dogumTarihi: r.birth_date ?? "",
  sinifId: r.class_id,
  aidatTutari: Number(r.monthly_fee),
  durum: r.is_active ? "aktif" : "pasif",
  kayitTarihi: r.created_at.slice(0, 10),
});

const aidatSatiri = (r: PaymentRow & { student_id: string }): AidatOdemesi => ({
  id: r.id,
  ogrenciId: r.student_id,
  ay: r.period,
  tutar: Number(r.amount),
  odemeTarihi: r.paid_at,
  not: r.note,
});

const personelOdemeSatiri = (r: PaymentRow & { staff_id: string }): PersonelOdemesi => ({
  id: r.id,
  ogretmenId: r.staff_id,
  ay: r.period,
  tutar: Number(r.amount),
  odemeTarihi: r.paid_at,
  not: r.note,
});

function ogretmenKolonlari(v: Partial<Omit<Ogretmen, "id">>) {
  const k: Record<string, unknown> = {};
  if (v.adSoyad !== undefined) k.full_name = v.adSoyad;
  if (v.telefon !== undefined) k.phone = v.telefon;
  if (v.brans !== undefined) k.branch = v.brans;
  if (v.durum !== undefined) k.is_active = v.durum === "aktif";
  return k;
}

function sinifKolonlari(v: Partial<Omit<Sinif, "id" | "saatler">>) {
  const k: Record<string, unknown> = {};
  if (v.ad !== undefined) k.name = v.ad;
  if (v.brans !== undefined) k.branch = v.brans;
  if (v.ogretmenId !== undefined) k.teacher_id = v.ogretmenId;
  if (v.kapasite !== undefined) k.capacity = v.kapasite;
  return k;
}

function ogrenciKolonlari(v: Partial<Omit<Ogrenci, "id" | "kayitTarihi">>) {
  const k: Record<string, unknown> = {};
  if (v.adSoyad !== undefined) k.full_name = v.adSoyad;
  if (v.telefon !== undefined) k.phone = v.telefon;
  if (v.veliTelefon !== undefined) k.parent_phone = v.veliTelefon;
  if (v.dogumTarihi !== undefined) k.birth_date = v.dogumTarihi || null;
  if (v.sinifId !== undefined) k.class_id = v.sinifId;
  if (v.aidatTutari !== undefined) k.monthly_fee = v.aidatTutari;
  if (v.durum !== undefined) k.is_active = v.durum === "aktif";
  return k;
}

function odemeKolonlari(v: { tutar: number; ay: string; odemeTarihi: string; not: string | null }) {
  return { amount: v.tutar, period: v.ay, paid_at: v.odemeTarihi, note: v.not || null };
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [data, setData] = useState<AppData>(BOS_VERI);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);

  const yenile = useCallback(async () => {
    const [staff, classes, students, fees, staffPays] = await Promise.all([
      supabase.from("staff").select("id, full_name, phone, branch, is_active").order("full_name"),
      supabase
        .from("classes")
        .select("id, name, branch, teacher_id, capacity, class_schedules(id, day, start_time, end_time)")
        .order("name"),
      supabase
        .from("students")
        .select("id, full_name, phone, parent_phone, birth_date, class_id, monthly_fee, is_active, created_at")
        .order("full_name"),
      supabase.from("fee_payments").select("id, student_id, amount, period, paid_at, note").order("paid_at"),
      supabase.from("staff_payments").select("id, staff_id, amount, period, paid_at, note").order("paid_at"),
    ]);

    const ilkHata = [staff, classes, students, fees, staffPays].find((r) => r.error)?.error;
    if (ilkHata) {
      setHata(`Veriler yüklenemedi: ${ilkHata.message}`);
      setYukleniyor(false);
      return;
    }

    setData({
      ogretmenler: (staff.data as StaffRow[]).map(ogretmenSatiri),
      siniflar: (classes.data as ClassRow[]).map(sinifSatiri),
      ogrenciler: (students.data as StudentRow[]).map(ogrenciSatiri),
      aidatOdemeleri: (fees.data as (PaymentRow & { student_id: string })[]).map(aidatSatiri),
      personelOdemeleri: (staffPays.data as (PaymentRow & { staff_id: string })[]).map(
        personelOdemeSatiri
      ),
    });
    setYukleniyor(false);
  }, [supabase]);

  useEffect(() => {
    // İlk yükleme; setState çağrıları await sonrasında, effect gövdesinde değil.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void yenile();
  }, [yenile]);

  // Ekranı hemen günceller, ardından adımları sırayla veritabanına yazar. Bir adım
  // başarısız olursa hatayı gösterir ve ekranı veritabanındaki gerçek duruma döndürür.
  const uygula = useCallback(
    (yerel: (d: AppData) => AppData, adimlar: (() => PromiseLike<{ error: { message: string } | null }>)[]) => {
      setData(yerel);
      void (async () => {
        for (const adim of adimlar) {
          const { error } = await adim();
          if (error) {
            setHata(`Kaydedilemedi: ${error.message}`);
            await yenile();
            return;
          }
        }
      })();
    },
    [yenile]
  );

  const value = useMemo<AppDataContextValue>(() => {
    return {
      ...data,
      yukleniyor,
      hata,
      hatayiKapat: () => setHata(null),
      yenile,

      ogretmenEkle: (veri) => {
        const id = crypto.randomUUID();
        uygula(
          (d) => ({ ...d, ogretmenler: [...d.ogretmenler, { ...veri, id }] }),
          [() => supabase.from("staff").insert({ id, ...ogretmenKolonlari(veri) })]
        );
      },

      ogretmenGuncelle: (id, veri) =>
        uygula(
          (d) => ({
            ...d,
            ogretmenler: d.ogretmenler.map((o) => (o.id === id ? { ...o, ...veri } : o)),
          }),
          [() => supabase.from("staff").update(ogretmenKolonlari(veri)).eq("id", id)]
        ),

      // Sınıflardaki öğretmen bağlantısını veritabanı (on delete set null) temizler.
      ogretmenSil: (id) =>
        uygula(
          (d) => ({
            ...d,
            ogretmenler: d.ogretmenler.filter((o) => o.id !== id),
            siniflar: d.siniflar.map((s) => (s.ogretmenId === id ? { ...s, ogretmenId: null } : s)),
            personelOdemeleri: d.personelOdemeleri.filter((o) => o.ogretmenId !== id),
          }),
          [
            () => supabase.from("staff_payments").delete().eq("staff_id", id),
            () => supabase.from("staff").delete().eq("id", id)
          ]
        ),

      sinifEkle: (veri) => {
        const id = crypto.randomUUID();
        uygula(
          (d) => ({ ...d, siniflar: [...d.siniflar, { ...veri, id, saatler: [] }] }),
          [() => supabase.from("classes").insert({ id, ...sinifKolonlari(veri) })]
        );
      },

      sinifGuncelle: (id, veri) =>
        uygula(
          (d) => ({
            ...d,
            siniflar: d.siniflar.map((s) => (s.id === id ? { ...s, ...veri } : s)),
          }),
          [() => supabase.from("classes").update(sinifKolonlari(veri)).eq("id", id)]
        ),

      // Ders saatleri (cascade) ve öğrencilerin sınıf bağlantısı (set null) veritabanında temizlenir.
      sinifSil: (id) =>
        uygula(
          (d) => ({
            ...d,
            siniflar: d.siniflar.filter((s) => s.id !== id),
            ogrenciler: d.ogrenciler.map((o) => (o.sinifId === id ? { ...o, sinifId: null } : o)),
          }),
          [() => supabase.from("classes").delete().eq("id", id)]
        ),

      dersSaatiEkle: (sinifId, saat) => {
        const id = crypto.randomUUID();
        uygula(
          (d) => ({
            ...d,
            siniflar: d.siniflar.map((s) =>
              s.id === sinifId ? { ...s, saatler: [...s.saatler, { ...saat, id }] } : s
            ),
          }),
          [() =>
            supabase.from("class_schedules").insert({
              id,
              class_id: sinifId,
              day: saat.gun,
              start_time: saat.baslangic,
              end_time: saat.bitis,
            })
          ]
        );
      },

      dersSaatiSil: (sinifId, saatId) =>
        uygula(
          (d) => ({
            ...d,
            siniflar: d.siniflar.map((s) =>
              s.id === sinifId ? { ...s, saatler: s.saatler.filter((sa) => sa.id !== saatId) } : s
            ),
          }),
          [() => supabase.from("class_schedules").delete().eq("id", saatId)]
        ),

      ogrenciEkle: (veri) => {
        const id = crypto.randomUUID();
        const yeni: Ogrenci = { ...veri, id, kayitTarihi: new Date().toISOString().slice(0, 10) };
        uygula(
          (d) => ({ ...d, ogrenciler: [...d.ogrenciler, yeni] }),
          [() => supabase.from("students").insert({ id, ...ogrenciKolonlari(veri) })]
        );
      },

      ogrenciGuncelle: (id, veri) =>
        uygula(
          (d) => ({
            ...d,
            ogrenciler: d.ogrenciler.map((o) => (o.id === id ? { ...o, ...veri } : o)),
          }),
          [() => supabase.from("students").update(ogrenciKolonlari(veri)).eq("id", id)]
        ),

      ogrenciSil: (id) =>
        uygula(
          (d) => ({
            ...d,
            ogrenciler: d.ogrenciler.filter((o) => o.id !== id),
            aidatOdemeleri: d.aidatOdemeleri.filter((o) => o.ogrenciId !== id),
          }),
          [
            () => supabase.from("fee_payments").delete().eq("student_id", id),
            () => supabase.from("students").delete().eq("id", id)
          ]
        ),

      ogrenciSinifDegistir: (ogrenciId, yeniSinifId) =>
        uygula(
          (d) => ({
            ...d,
            ogrenciler: d.ogrenciler.map((o) =>
              o.id === ogrenciId ? { ...o, sinifId: yeniSinifId } : o
            ),
          }),
          [() =>
            supabase.from("students").update({ class_id: yeniSinifId }).eq("id", ogrenciId)
          ]
        ),

      aidatOdemesiEkle: (veri) => {
        const id = crypto.randomUUID();
        uygula(
          (d) => ({ ...d, aidatOdemeleri: [...d.aidatOdemeleri, { ...veri, id }] }),
          [() =>
            supabase
              .from("fee_payments")
              .insert({ id, student_id: veri.ogrenciId, ...odemeKolonlari(veri) })
          ]
        );
      },

      aidatOdemesiSil: (id) =>
        uygula(
          (d) => ({ ...d, aidatOdemeleri: d.aidatOdemeleri.filter((o) => o.id !== id) }),
          [() => supabase.from("fee_payments").delete().eq("id", id)]
        ),

      personelOdemesiEkle: (veri) => {
        const id = crypto.randomUUID();
        uygula(
          (d) => ({ ...d, personelOdemeleri: [...d.personelOdemeleri, { ...veri, id }] }),
          [() =>
            supabase
              .from("staff_payments")
              .insert({ id, staff_id: veri.ogretmenId, ...odemeKolonlari(veri) })
          ]
        );
      },

      personelOdemesiSil: (id) =>
        uygula(
          (d) => ({ ...d, personelOdemeleri: d.personelOdemeleri.filter((o) => o.id !== id) }),
          [() => supabase.from("staff_payments").delete().eq("id", id)]
        ),
    };
  }, [data, yukleniyor, hata, yenile, uygula, supabase]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData, AppDataProvider içinde kullanılmalı");
  }
  return ctx;
}

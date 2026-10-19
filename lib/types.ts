export type Gun =
  | "Pazartesi"
  | "Salı"
  | "Çarşamba"
  | "Perşembe"
  | "Cuma"
  | "Cumartesi"
  | "Pazar";

export const GUNLER: Gun[] = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

export type DersSaati = {
  id: string;
  gun: Gun;
  baslangic: string; // "17:00"
  bitis: string; // "18:00"
};

export type Ogretmen = {
  id: string;
  adSoyad: string;
  telefon: string;
  brans: string;
  durum: "aktif" | "pasif";
};

export type Sinif = {
  id: string;
  ad: string;
  brans: string;
  ogretmenId: string | null;
  kapasite: number;
  saatler: DersSaati[];
};

export type Ogrenci = {
  id: string;
  adSoyad: string;
  telefon: string;
  veliTelefon: string;
  dogumTarihi: string; // yyyy-mm-dd
  sinifId: string | null;
  aidatTutari: number;
  durum: "aktif" | "pasif";
  kayitTarihi: string; // yyyy-mm-dd
};

// Supabase'deki fee_payments satırı. Bir ay için birden fazla (kısmi) ödeme olabilir.
export type AidatOdemesi = {
  id: string;
  ogrenciId: string;
  ay: string; // "2026-10"
  tutar: number;
  odemeTarihi: string; // yyyy-mm-dd
  not: string | null;
};

// Supabase'deki staff_payments satırı.
export type PersonelOdemesi = {
  id: string;
  ogretmenId: string;
  ay: string; // "2026-10"
  tutar: number;
  odemeTarihi: string; // yyyy-mm-dd
  not: string | null;
};

export type AidatDurumu = "ödendi" | "kısmi" | "ödenmedi" | "gecikmiş";

// Bir öğrencinin bir aydaki aidat özeti; ödemelerden hesaplanır, veritabanında tutulmaz.
export type AylikAidat = {
  ogrenciId: string;
  ay: string;
  beklenen: number;
  odenen: number;
  kalan: number;
  durum: AidatDurumu;
  odemeler: AidatOdemesi[];
};

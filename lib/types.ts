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

export type OdemeDurumu = "ödendi" | "ödenmedi" | "gecikmiş";

export type Odeme = {
  id: string;
  ogrenciId: string;
  ay: string; // "2026-10"
  tutar: number;
  durum: OdemeDurumu;
  odemeTarihi: string | null; // yyyy-mm-dd
};

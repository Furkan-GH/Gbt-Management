import type { AidatDurumu, AidatOdemesi, AylikAidat, Ogrenci } from "./types";

export const AY_ADLARI = [
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

export function ayAnahtari(d: Date = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function ayEtiketi(ay: string) {
  const [yil, ayNo] = ay.split("-").map(Number);
  return `${AY_ADLARI[ayNo - 1]} ${yil}`;
}

export function bugun() {
  const d = new Date();
  return `${ayAnahtari(d)}-${String(d.getDate()).padStart(2, "0")}`;
}

function sonrakiAy(ay: string) {
  const [yil, ayNo] = ay.split("-").map(Number);
  return ayAnahtari(new Date(yil, ayNo, 1));
}

// İlk kaydedilen ödemenin ayından bu aya kadar olan aylar (en az bu ay).
export function aidatAylari(odemeler: { ay: string }[]): string[] {
  const buAy = ayAnahtari();
  let ay = odemeler.reduce((min, o) => (o.ay < min ? o.ay : min), buAy);
  const aylar: string[] = [];
  while (ay <= buAy) {
    aylar.push(ay);
    ay = sonrakiAy(ay);
  }
  return aylar;
}

// Bir ay için her öğrencinin aidat durumunu ödemelerden hesaplar. Ay listesine
// o ay ödeme yapan öğrenciler ile kayıt ayı o aya kadar olan aktif öğrenciler girer.
export function aylikAidatlar(
  ogrenciler: Ogrenci[],
  odemeler: AidatOdemesi[],
  ay: string
): AylikAidat[] {
  const buAy = ayAnahtari();
  const sonuc: AylikAidat[] = [];

  for (const ogrenci of ogrenciler) {
    const ogrenciOdemeleri = odemeler.filter(
      (o) => o.ogrenciId === ogrenci.id && o.ay === ay
    );
    const kayitliMi =
      ogrenci.durum === "aktif" && ogrenci.kayitTarihi.slice(0, 7) <= ay;
    if (!kayitliMi && ogrenciOdemeleri.length === 0) continue;

    const odenen = ogrenciOdemeleri.reduce((t, o) => t + o.tutar, 0);
    const beklenen = ogrenci.aidatTutari;
    let durum: AidatDurumu;
    if (odenen >= beklenen) durum = "ödendi";
    else if (odenen > 0) durum = "kısmi";
    else if (ay < buAy) durum = "gecikmiş";
    else durum = "ödenmedi";

    sonuc.push({
      ogrenciId: ogrenci.id,
      ay,
      beklenen,
      odenen,
      kalan: Math.max(0, beklenen - odenen),
      durum,
      odemeler: ogrenciOdemeleri,
    });
  }

  return sonuc;
}

export const DURUM_ETIKETI: Record<AidatDurumu, string> = {
  ödendi: "Ödendi",
  kısmi: "Kısmi",
  ödenmedi: "Ödenmedi",
  gecikmiş: "Gecikmiş",
};

export const DURUM_RENGI = {
  ödendi: "yesil",
  kısmi: "mavi",
  ödenmedi: "sari",
  gecikmiş: "kirmizi",
} as const satisfies Record<AidatDurumu, string>;

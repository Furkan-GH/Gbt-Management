import type { Odeme, Ogrenci, Ogretmen, Sinif } from "./types";

export const seedOgretmenler: Ogretmen[] = [
  {
    id: "t1",
    adSoyad: "Elif Yıldız",
    telefon: "0532 111 22 33",
    brans: "Artistik Cimnastik",
    durum: "aktif",
  },
  {
    id: "t2",
    adSoyad: "Mert Kaya",
    telefon: "0533 222 33 44",
    brans: "Ritmik Cimnastik",
    durum: "aktif",
  },
  {
    id: "t3",
    adSoyad: "Deniz Arslan",
    telefon: "0534 333 44 55",
    brans: "Akrobatik Cimnastik",
    durum: "aktif",
  },
];

export const seedSiniflar: Sinif[] = [
  {
    id: "c1",
    ad: "Minikler A",
    brans: "Artistik Cimnastik",
    ogretmenId: "t1",
    kapasite: 12,
    saatler: [
      { id: "s1", gun: "Pazartesi", baslangic: "17:00", bitis: "18:00" },
      { id: "s2", gun: "Çarşamba", baslangic: "17:00", bitis: "18:00" },
    ],
  },
  {
    id: "c2",
    ad: "Yıldızlar B",
    brans: "Artistik Cimnastik",
    ogretmenId: "t1",
    kapasite: 10,
    saatler: [{ id: "s3", gun: "Salı", baslangic: "18:00", bitis: "19:30" }],
  },
  {
    id: "c3",
    ad: "Ritmik Başlangıç",
    brans: "Ritmik Cimnastik",
    ogretmenId: "t2",
    kapasite: 14,
    saatler: [
      { id: "s4", gun: "Pazartesi", baslangic: "19:00", bitis: "20:00" },
      { id: "s5", gun: "Perşembe", baslangic: "19:00", bitis: "20:00" },
    ],
  },
  {
    id: "c4",
    ad: "Akrobatik İleri",
    brans: "Akrobatik Cimnastik",
    ogretmenId: "t3",
    kapasite: 8,
    saatler: [{ id: "s6", gun: "Cumartesi", baslangic: "11:00", bitis: "12:30" }],
  },
  {
    id: "c5",
    ad: "Yetişkin Grubu",
    brans: "Artistik Cimnastik",
    ogretmenId: null,
    kapasite: 15,
    saatler: [{ id: "s7", gun: "Pazar", baslangic: "10:00", bitis: "11:00" }],
  },
];

export const seedOgrenciler: Ogrenci[] = [
  { id: "p1", adSoyad: "Ayşe Demir", telefon: "0501 111 11 11", veliTelefon: "0532 111 11 11", dogumTarihi: "2016-03-12", sinifId: "c1", aidatTutari: 1200, durum: "aktif", kayitTarihi: "2025-09-01" },
  { id: "p2", adSoyad: "Mehmet Can Öz", telefon: "0501 222 22 22", veliTelefon: "0532 222 22 22", dogumTarihi: "2015-07-22", sinifId: "c1", aidatTutari: 1200, durum: "aktif", kayitTarihi: "2025-09-05" },
  { id: "p3", adSoyad: "Zeynep Kurt", telefon: "0501 333 33 33", veliTelefon: "0532 333 33 33", dogumTarihi: "2014-01-30", sinifId: "c2", aidatTutari: 1350, durum: "aktif", kayitTarihi: "2025-10-01" },
  { id: "p4", adSoyad: "Ali Veli Şahin", telefon: "0501 444 44 44", veliTelefon: "0532 444 44 44", dogumTarihi: "2013-11-11", sinifId: "c2", aidatTutari: 1350, durum: "aktif", kayitTarihi: "2025-09-20" },
  { id: "p5", adSoyad: "Elif Naz Aydın", telefon: "0501 555 55 55", veliTelefon: "0532 555 55 55", dogumTarihi: "2016-05-02", sinifId: "c3", aidatTutari: 1400, durum: "aktif", kayitTarihi: "2025-11-01" },
  { id: "p6", adSoyad: "Buse Yılmaz", telefon: "0501 666 66 66", veliTelefon: "0532 666 66 66", dogumTarihi: "2015-09-09", sinifId: "c3", aidatTutari: 1400, durum: "aktif", kayitTarihi: "2025-09-15" },
  { id: "p7", adSoyad: "Kerem Aksoy", telefon: "0501 777 77 77", veliTelefon: "0532 777 77 77", dogumTarihi: "2012-02-18", sinifId: "c4", aidatTutari: 1500, durum: "aktif", kayitTarihi: "2025-08-01" },
  { id: "p8", adSoyad: "Defne Çelik", telefon: "0501 888 88 88", veliTelefon: "0532 888 88 88", dogumTarihi: "2013-06-25", sinifId: "c4", aidatTutari: 1500, durum: "aktif", kayitTarihi: "2025-08-10" },
  { id: "p9", adSoyad: "Arda Polat", telefon: "0501 999 99 99", veliTelefon: "0532 999 99 99", dogumTarihi: "2016-12-03", sinifId: "c1", aidatTutari: 1200, durum: "aktif", kayitTarihi: "2026-01-12" },
  { id: "p10", adSoyad: "Ece Güneş", telefon: "0501 101 01 01", veliTelefon: "0532 101 01 01", dogumTarihi: "2014-04-17", sinifId: "c2", aidatTutari: 1350, durum: "pasif", kayitTarihi: "2025-07-01" },
  { id: "p11", adSoyad: "Sena Doğan", telefon: "0501 121 21 21", veliTelefon: "0532 121 21 21", dogumTarihi: "2017-08-08", sinifId: "c5", aidatTutari: 1100, durum: "aktif", kayitTarihi: "2026-02-01" },
  { id: "p12", adSoyad: "Burak Erdem", telefon: "0501 131 31 31", veliTelefon: "0532 131 31 31", dogumTarihi: "2017-10-29", sinifId: "c5", aidatTutari: 1100, durum: "aktif", kayitTarihi: "2026-02-15" },
  { id: "p13", adSoyad: "Mira Aksu", telefon: "0501 141 41 41", veliTelefon: "0532 141 41 41", dogumTarihi: "2015-01-05", sinifId: null, aidatTutari: 1200, durum: "aktif", kayitTarihi: "2026-03-01" },
];

function ayAnahtari(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function initialOdemeleriUret(ogrenciler: Ogrenci[]): Odeme[] {
  const odemeler: Odeme[] = [];
  const now = new Date();
  const aySayisi = 3;

  for (const ogrenci of ogrenciler) {
    for (let i = aySayisi - 1; i >= 0; i--) {
      const tarih = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ay = ayAnahtari(tarih);
      const buAy = i === 0;

      let durum: Odeme["durum"];
      let odemeTarihi: string | null;

      if (buAy) {
        const rastgele = hashSecim(ogrenci.id + ay);
        durum = rastgele < 0.5 ? "ödendi" : "ödenmedi";
        odemeTarihi = durum === "ödendi" ? `${ay}-05` : null;
      } else {
        const rastgele = hashSecim(ogrenci.id + ay);
        durum = rastgele < 0.85 ? "ödendi" : "gecikmiş";
        odemeTarihi = durum === "ödendi" ? `${ay}-07` : null;
      }

      odemeler.push({
        id: `pay-${ogrenci.id}-${ay}`,
        ogrenciId: ogrenci.id,
        ay,
        tutar: ogrenci.aidatTutari,
        durum,
        odemeTarihi,
      });
    }
  }

  return odemeler;
}

// Basit deterministik "rastgele" üretici — seed verisi her yüklemede aynı kalsın diye.
function hashSecim(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 100) / 100;
}

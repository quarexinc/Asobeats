export type Beat = {
  id: string;
  title: string;
  description: string;
  price: number; // TL
  bpm?: number;
  musicalKey?: string;
  genre?: string;
  tags: string[];
  coverUrl?: string;
  previewUrl?: string; // 15 sn demo (herkese açık)
  fileUrl: string; // tam MP3 (sadece satın alan görür)
  fileName?: string;
  durationSec?: number;
  peaks?: number[]; // dalga formu (0-1 arası)
  exclusive: boolean; // tek satış: satılınca kapanır
  sold: boolean;
  published: boolean;
  featured: boolean;
  salesCount: number;
  createdAt: number;
  updatedAt: number;
};

/** Ziyaretçiye gönderilen güvenli görünüm (tam dosya linki yok) */
export type PublicBeat = Omit<Beat, "fileUrl" | "fileName">;

export type OrderStatus = "pending" | "paid" | "cancelled";

export type Order = {
  code: string; // gizli sipariş kodu (indirme linki)
  beatId: string;
  beatTitle: string;
  coverUrl?: string;
  price: number;
  buyerName: string;
  buyerEmail: string;
  note?: string;
  status: OrderStatus;
  fileUrl: string; // teslim edilecek dosya (sunucu tarafında kalır)
  fileName?: string;
  createdAt: number;
  paidAt?: number;
  downloads: number;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: number;
};

export type FaqItem = { q: string; a: string };

export type Settings = {
  paymentMode: "instant" | "manual";
  bankInfo: string;
  heroText: string;
  aboutTitle: string;
  aboutText: string;
  aboutImage: string;
  contactEmail: string;
  instagram: string;
  youtube: string;
  spotify: string;
  whatsapp: string;
  faq: FaqItem[];
};

export const DEFAULT_SETTINGS: Settings = {
  paymentMode: "instant",
  bankInfo:
    "Alıcı: Aso Beats\nIBAN: TR00 0000 0000 0000 0000 0000 00\nAçıklamaya sipariş kodunu yazmayı unutma.",
  heroText:
    "Trap, drill ve R&B için stüdyoda üretilmiş beatler. 15 saniyelik demoyu dinle, beğendiğini al, dosyan anında elinde.",
  aboutTitle: "Sesin arkasındaki isim",
  aboutText:
    "Ben Aso. Yıllardır kendi stüdyomda trap, drill ve R&B beatleri üretiyorum. Her beat; miks ve master'ı tamamlanmış, kayda hazır şekilde teslim edilir.\n\nAmacım, sanatçıların kendi seslerini bulabilecekleri, karakteri olan altyapılar sunmak. Özel bir proje ya da sana özel bir beat için bana her zaman ulaşabilirsin.",
  aboutImage: "",
  contactEmail: "iletisim@asobeats.com",
  instagram: "",
  youtube: "",
  spotify: "",
  whatsapp: "",
  faq: [
    {
      q: "Beati satın aldıktan sonra dosyayı nasıl alırım?",
      a: "Ödemen onaylandığı anda sipariş sayfanda indirme butonu açılır. Sipariş linkini kaydet; dosyayı oradan istediğin zaman tekrar indirebilirsin.",
    },
    {
      q: "Demolar neden 15 saniye?",
      a: "Demolar beatin karakterini tanıman için hazırlanmış kısa kesitlerdir. Tam sürüm, satın alımdan sonra yüksek kaliteli MP3 olarak teslim edilir.",
    },
    {
      q: "Beati şarkımda ticari olarak kullanabilir miyim?",
      a: "Evet. Satın aldığın beati kendi şarkında kullanabilir, dijital platformlarda yayınlayabilirsin. Yapımcı kısmına “Prod. by Aso Beats” yazman yeterli.",
    },
    {
      q: "Tek satış (exclusive) ne demek?",
      a: "Tek satış olarak işaretlenen beatler yalnızca bir kişiye satılır. Satıldıktan sonra mağazadan kaldırılır ve başka kimse satın alamaz.",
    },
    {
      q: "Sana özel beat yaptırabilir miyim?",
      a: "Elbette. Bana Ulaş sayfasındaki formdan referans şarkılarını ve fikrini yaz, en kısa sürede dönüş yapayım.",
    },
  ],
};

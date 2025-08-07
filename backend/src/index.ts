import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { nanoid } from "nanoid";
import { createClient } from "redis";
import validator from "validator";
import compression from "compression";
import morgan from "morgan";
import "dotenv/config";

// --- Veri Modelleri (TypeScript Arayüzleri) ---
// Uygulamamızda kullanacağımız veri yapılarının nasıl görüneceğini burada tanımlıyoruz.

// Frontend'den gelecek olan isteğin yapısını tanımlar.
interface ShortenRequest {
  longUrl: string;
  alias?: string; // '?' işareti bu alanın opsiyonel olduğunu belirtir.
  expiresIn?: number; // Saniye cinsinden linkin geçerlilik süresi
}

// Redis'te saklayacağımız verinin yapısını tanımlar.
interface UrlRecord {
  longUrl: string;
  createdAt: string;
  clickCount: string; // Redis'te tüm değerler string olarak saklanır.
  expiresAt?: string;
}

// Kendi özel hata yapımızı tanımlıyoruz.
interface AppError extends Error {
  statusCode: number;
}

// --- Redis İstemcisi Kurulumu ---
// Redis veritabanına bağlanmak ve iletişim kurmak için istemciyi (client) hazırlıyoruz.

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Bağlantı sırasında oluşabilecek hataları yakalamak için olay dinleyicileri (event listeners) ekliyoruz.
redisClient.on("error", (err) =>
  console.error("❌ Redis İstemci Hatası:", err)
);
redisClient.on("ready", () => console.log("✅ Redis bağlantısı hazır"));

// --- Express Uygulaması Kurulumu ---

const app = express(); // Yeni bir Express uygulaması oluşturuyoruz.
const PORT = process.env.PORT || 8080; // Sunucunun çalışacağı portu .env dosyasından alıyoruz.
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`; // Kısaltılmış linklerin temel URL'i.

// --- Middleware Zinciri ---
// Middleware'ler, gelen her isteğe sırasıyla uygulanan ara katman fonksiyonlarıdır.

app.use(helmet()); // Güvenlik başlıklarını ekler.
app.use(compression()); // Yanıtları sıkıştırır.
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" })); // Frontend'den gelen isteklere izin verir.
app.use(express.json({ limit: "10kb" })); // Gelen JSON verilerini ayrıştırır ve boyutunu sınırlar.
app.use(morgan("dev")); // İstekleri terminale loglar.

// API rotalarına özel hız limitleyici.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakikalık zaman dilimi
  max: 100, // Bu süre içinde her IP en fazla 100 istek atabilir.
  message: {
    message:
      "Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter); // Bu limitleyiciyi sadece /api/ ile başlayan yollara uygula.

// --- Yardımcı Fonksiyonlar ---

// Standart bir hata objesi oluşturan fonksiyon.
const createAppError = (message: string, statusCode: number): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
};

// --- API Rotaları (Endpoints) ---
// Uygulamanın dış dünya ile iletişim kuracağı ana noktalar.

// YENİ BİR KISA LİNK OLUŞTURMA
app.post(
  "/api/shorten",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { longUrl, alias, expiresIn }: ShortenRequest = req.body;

      // Gelen veriyi doğrulama
      if (!longUrl || !validator.isURL(longUrl)) {
        throw createAppError(
          "Lütfen geçerli bir URL girin (http:// veya https:// ile başlamalı)",
          400
        );
      }
      if (alias && !/^[a-zA-Z0-9_-]{3,20}$/.test(alias)) {
        throw createAppError(
          "Özel isim 3-20 karakter arası olmalı ve sadece harf, rakam, - veya _ içermelidir",
          400
        );
      }

      let shortCode: string;
      const keyPrefix = "url:"; // Redis'te anahtarları gruplamak için bir ön ek.

      if (alias) {
        // Eğer özel isim varsa, veritabanında kullanılıp kullanılmadığını kontrol et.
        const exists = await redisClient.exists(`${keyPrefix}${alias}`);
        if (exists) {
          throw createAppError("Bu özel isim zaten kullanılıyor", 409);
        }
        shortCode = alias;
      } else {
        // Özel isim yoksa, benzersiz bir kısa kod üret.
        let retries = 5;
        do {
          shortCode = nanoid(7);
          retries--;
        } while (
          (await redisClient.exists(`${keyPrefix}${shortCode}`)) &&
          retries > 0
        );

        if (await redisClient.exists(`${keyPrefix}${shortCode}`)) {
          throw createAppError(
            "Benzersiz kod üretilemedi, lütfen tekrar deneyin",
            500
          );
        }
      }

      // Veritabanına kaydedilecek olan objeyi oluştur.
      const urlRecord: UrlRecord = {
        longUrl,
        createdAt: new Date().toISOString(),
        clickCount: "0",
        ...(expiresIn && {
          expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
        }),
      };

      const key = `${keyPrefix}${shortCode}`;
      // Redis'in Hash yapısını kullanarak objeyi kaydet.
      await redisClient.hSet(key, { ...urlRecord });

      // Eğer geçerlilik süresi belirtilmişse, Redis'e bu anahtarın ne zaman silineceğini söyle.
      if (expiresIn) {
        await redisClient.expire(key, expiresIn);
      }

      const shortUrl = `${BASE_URL}/${shortCode}`;

      // Başarılı cevabı frontend'e gönder.
      res.status(201).json({ shortUrl });
    } catch (error) {
      next(error); // Oluşan herhangi bir hatayı merkezi hata yöneticisine gönder.
    }
  }
);

// KISA LİNKİ YÖNLENDİRME
app.get(
  "/:shortCode",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { shortCode } = req.params;
      const key = `url:${shortCode}`;

      // Redis'ten bu kısa koda ait tüm veriyi getir.
      const urlData = await redisClient.hGetAll(key);

      // Eğer veri bulunamazsa, 404 hatası fırlat.
      if (!urlData || !urlData.longUrl) {
        throw createAppError(
          "Bu link bulunamadı veya süresi dolmuş olabilir",
          404
        );
      }

      // Tıklanma sayacını 1 artır. `catch` ile olası hataların yönlendirmeyi engellemesini önlüyoruz.
      redisClient.hIncrBy(key, "clickCount", 1).catch(console.error);

      // Kullanıcıyı asıl URL'e kalıcı olarak (301) yönlendir.
      res.redirect(301, urlData.longUrl);
    } catch (error) {
      next(error);
    }
  }
);

// --- Hata Yönetimi Middleware'leri ---

// Hiçbir rota ile eşleşmeyen istekler için 404 hatası oluşturur.
app.use((req, res, next) => {
  const error = createAppError("Bu endpoint bulunamadı", 404);
  next(error);
});

// Tüm hataları yakalayan ve standart bir formatta cevap dönen merkezi yönetici.
const globalErrorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.statusCode
    ? error.message
    : "Sunucuda bir hata oluştu.";

  console.error(`🔥 [${statusCode}] - ${error.message}`); // Hataları sunucu loglarına yazdır.

  res.status(statusCode).json({ message });
};
app.use(globalErrorHandler);

// --- Sunucuyu Başlatma ---

const startServer = async () => {
  try {
    // Önce veritabanına bağlanmayı dene.
    await redisClient.connect();
    // Bağlantı başarılıysa, web sunucusunu dinlemeye başla.
    app.listen(PORT, () => {
      console.log(`🚀 Sunucu ${BASE_URL} adresinde başlatıldı`);
    });
  } catch (error) {
    console.error("❌ Sunucu başlatılamadı:", error);
    process.exit(1); // Hata durumunda uygulamayı sonlandır.
  }
};

startServer(); // Sunucuyu başlatma fonksiyonunu çağır.

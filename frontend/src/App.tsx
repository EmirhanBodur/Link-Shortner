import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { LinkHistoryItem as LinkHistoryItemType } from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";

import { ThemeToggle } from "./components/ThemeToggle";
import { Form } from "./components/Form";
import { ResultCard } from "./components/ResultCard";
import { HistoryItem } from "./components/HistoryItem";
import { EmptyState } from "./components/EmptyState";
import { Footer } from "./components/Footer";

// Vite ortam değişkenini alıyoruz. Değişken tanımlı değilse, localhost'u varsayılan olarak kullanır.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function App() {
  const [history, setHistory] = useLocalStorage<LinkHistoryItemType[]>(
    "linkHistory",
    []
  );

  const [longUrl, setLongUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccessUrl, setCopySuccessUrl] = useState<string>("");

  const handleCopy = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopySuccessUrl(url);
        setTimeout(() => setCopySuccessUrl(""), 2000);
      })
      .catch((err) => {
        console.error("Kopyalama hatası: ", err);
      });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      new URL(longUrl);
    } catch {
      setError("Lütfen geçerli bir URL girin.");
      return;
    }
    if (customAlias && !/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
      setError("Özel isim sadece harf, rakam, - ve _ içerebilir.");
      return;
    }

    setIsLoading(true);

    try {
      // DÜZELTME: API adresi artık dinamik olarak ortam değişkeninden geliyor.
      const response = await fetch(`${API_URL}/api/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ longUrl, alias: customAlias }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Bir hata oluştu.");
      }

      const newShortUrl = data.shortUrl;
      setResult(newShortUrl);

      const newHistoryItem = {
        longUrl,
        shortUrl: newShortUrl,
        date: new Date().toISOString(),
      };
      const updatedHistory = [
        newHistoryItem,
        ...history.filter((item) => item.shortUrl !== newShortUrl),
      ].slice(0, 10);
      setHistory(updatedHistory);

      setLongUrl("");
      setCustomAlias("");
    } catch (err) {
      let errorMessage = "Bir şeyler ters gitti.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-10 transition-colors">
          <div className="flex justify-between items-start mb-8">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                Link Kısaltıcı
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Modern, hızlı ve güvenli.
              </p>
            </div>
            <ThemeToggle />
          </div>
          <Form
            longUrl={longUrl}
            setLongUrl={setLongUrl}
            customAlias={customAlias}
            setCustomAlias={setCustomAlias}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
          />
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm"
              >
                <p>{error}</p>
              </motion.div>
            )}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ResultCard
                  shortUrl={result}
                  onCopy={handleCopy}
                  copySuccessUrl={copySuccessUrl}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full mt-8">
          <AnimatePresence mode="wait">
            {history.length > 0 ? (
              <motion.div
                key="history-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex justify-between items-center mb-4 px-2 sm:px-0">
                  <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
                    Geçmiş
                  </h2>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Temizle
                  </button>
                </div>
                <motion.div layout className="space-y-3">
                  <AnimatePresence>
                    {history.map((item) => (
                      <motion.div
                        key={item.shortUrl}
                        layout
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                      >
                        <HistoryItem
                          item={item}
                          onCopy={handleCopy}
                          copySuccessUrl={copySuccessUrl}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}

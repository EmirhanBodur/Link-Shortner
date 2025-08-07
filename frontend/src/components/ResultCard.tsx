import { QRCodeCanvas } from "qrcode.react";
import { Copy, Check } from "lucide-react";
import { ShareButtons } from "./ShareButtons";

type ResultCardProps = {
  shortUrl: string;
  onCopy: (url: string) => void;
  copySuccessUrl: string;
};

export const ResultCard = ({
  shortUrl,
  onCopy,
  copySuccessUrl,
}: ResultCardProps) => {
  const isCopied = shortUrl === copySuccessUrl;

  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg">
        <div className="flex-grow min-w-0">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Kısaltılmış linkiniz:
          </p>

          <div className="flex items-center gap-2">
            <a
              href={shortUrl}
              onClick={(e) => {
                e.preventDefault();
                onCopy(shortUrl);
              }}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-grow min-w-0 text-blue-600 dark:text-blue-400 font-medium truncate hover:underline cursor-pointer"
              title="Kopyalamak için tıkla"
            >
              {shortUrl}
            </a>
            <button
              onClick={() => onCopy(shortUrl)}
              className={`font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-sm flex-shrink-0 flex items-center gap-1.5 ${
                isCopied
                  ? "bg-green-500 text-white"
                  : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500"
              }`}
            >
              {isCopied ? (
                <>
                  <Check size={16} /> Kopyalandı
                </>
              ) : (
                <>
                  <Copy size={14} /> Kopyala
                </>
              )}
            </button>
          </div>
          <ShareButtons url={shortUrl} />
        </div>
        <div className="flex-shrink-0 p-2 bg-white rounded-md mt-4 md:mt-0">
          <QRCodeCanvas
            value={shortUrl}
            size={100}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"H"}
          />
        </div>
      </div>
    </div>
  );
};

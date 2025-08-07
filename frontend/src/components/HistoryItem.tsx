import { Copy, Check } from "lucide-react";
import type { LinkHistoryItem as LinkHistoryItemType } from "../types";

type HistoryItemProps = {
  item: LinkHistoryItemType;
  onCopy: (url: string) => void;
  copySuccessUrl: string;
};

export const HistoryItem = ({
  item,
  onCopy,
  copySuccessUrl,
}: HistoryItemProps) => {
  const isCopied = item.shortUrl === copySuccessUrl;

  return (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 hover:shadow-md hover:scale-[1.02] transition-all duration-200">
      <div className="truncate">
        <a
          href={item.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-600 dark:text-blue-400 truncate hover:underline"
        >
          {item.shortUrl.replace("https://", "")}
        </a>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
          {item.longUrl}
        </p>
      </div>
      <button
        onClick={() => onCopy(item.shortUrl)}
        className={`p-2 rounded-md text-xs flex-shrink-0 transition-colors ${
          isCopied
            ? "bg-green-500 text-white"
            : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500"
        }`}
        aria-label={isCopied ? "Kopyalandı" : "Kopyala"}
      >
        {isCopied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
};

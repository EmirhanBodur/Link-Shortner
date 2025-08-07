import type { FormEvent } from "react";
import { Loader2, Wand2 } from "lucide-react";

type FormProps = {
  longUrl: string;
  setLongUrl: (value: string) => void;
  customAlias: string;
  setCustomAlias: (value: string) => void;
  isLoading: boolean;
  handleSubmit: (e: FormEvent) => void;
};

export const Form = ({
  longUrl,
  setLongUrl,
  customAlias,
  setCustomAlias,
  isLoading,
  handleSubmit,
}: FormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="url"
        value={longUrl}
        onChange={(e) => setLongUrl(e.target.value)}
        placeholder="https://uzun-linkinizi-buraya-yapistirin.com/"
        required
        className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
      />
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 dark:text-slate-400 sm:text-sm">
          kurumsal.link/
        </span>
        <input
          type="text"
          value={customAlias}
          onChange={(e) => setCustomAlias(e.target.value)}
          placeholder="ozel-isminiz (opsiyonel)"
          className="w-full pl-36 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-[48px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 transition-all flex items-center justify-center gap-2 disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/50"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            <Wand2 size={18} /> <span>Kısalt</span>
          </>
        )}
      </button>
    </form>
  );
};

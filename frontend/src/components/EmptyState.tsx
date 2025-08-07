import { Link2 } from "lucide-react";

export const EmptyState = () => (
  <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
    <div className="mx-auto h-12 w-12 text-slate-400">
      <Link2 size={48} />
    </div>
    <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
      Geçmişiniz boş
    </h3>
    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
      İlk linkinizi kısaltarak başlayın.
    </p>
  </div>
);

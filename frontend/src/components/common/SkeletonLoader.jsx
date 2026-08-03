import React from "react";

export function SkeletonStatCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="h-8 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
    </div>
  );
}

export function SkeletonProductCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
      </div>
      <div className="h-12 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800" />
      <div className="flex gap-2 pt-1">
        <div className="h-12 flex-1 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-12 flex-1 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTableRow({ cols = 5 }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx} className="px-5 py-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
        </td>
      ))}
    </tr>
  );
}

export default function SkeletonLoader({ type = "stats", count = 4 }) {
  if (type === "stats") {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
    );
  }

  if (type === "products" || type === "cards") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonProductCard key={i} />
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-center animate-pulse">
      <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md mx-auto" />
    </div>
  );
}

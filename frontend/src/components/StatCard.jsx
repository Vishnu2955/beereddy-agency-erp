import { FaArrowUp, FaArrowDown, FaExclamationCircle } from "react-icons/fa";

export default function StatCard({
  title,
  value,
  icon,
  trend = "+12.4%",
  trendUp = true,
  color = "from-blue-600 to-indigo-700",
  subtitle = "Updated live",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`dynamic-card-3d rounded-3xl p-6 border border-slate-200/80 shadow-md group ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      
      {/* Background Gradient Decorative Touch */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${color}`} />

      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </h3>

          <div className="flex items-center gap-2 pt-1">
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
              trendUp 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" 
                : "bg-amber-50 text-amber-700 border border-amber-200/60"
            }`}>
              {trendUp ? <FaArrowUp className="text-[9px]" /> : <FaExclamationCircle className="text-[9px]" />}
              {trend}
            </span>

            <span className="text-[11px] text-slate-400 font-medium truncate">
              {subtitle}
            </span>
          </div>
        </div>

        {/* Icon Backdrop Box */}
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${color} text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
export default function StatCard({
  title,
  value,
  icon,
  color = "bg-blue-600",
}) {
  return (
    <div
      className={`${color} rounded-2xl p-6 shadow-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <div className="text-5xl opacity-80">
          {icon}
        </div>
      </div>
    </div>
  );
}
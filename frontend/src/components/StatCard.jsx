import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  icon,
  color,
}) {
  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        y: -5,
      }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl shadow-lg p-6 text-white ${color}`}
    >
      <div className="flex justify-between items-center">

        <div>

          <p className="text-sm opacity-90">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>

        </div>

        <div className="text-5xl opacity-70">
          {icon}
        </div>

      </div>
    </motion.div>
  );
}
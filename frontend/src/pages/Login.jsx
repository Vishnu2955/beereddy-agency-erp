import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaUser,
  FaLock,
  FaArrowRight,
  FaCheckCircle,
  FaBoxes,
  FaWarehouse,
  FaTruck,
  FaLayerGroup,
} from "react-icons/fa";
import api from "../services/api";
import { saveAuth } from "../utils/auth";
import { errorToast, successToast } from "../utils/toast";

function Login() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post("/auth/login", {
        login,
        password,
      });

      saveAuth(res.data.token, res.data.user);
      successToast("Signed in successfully!");
      navigate("/dashboard");
    } catch (err) {
      errorToast(err.response?.data?.message || "Invalid credentials. Please check and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated V Bond Inspired Background Floating Particles */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse pointer-events-none" />

      <div className="w-full max-w-5xl glass-panel bg-slate-900/90 border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Brand Experience & Illustrations (7 Cols) */}
        <div className="lg:col-span-7 p-8 lg:p-12 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800/80 text-white flex flex-col justify-between space-y-8 relative overflow-hidden">
          {/* Top Logo & Branding */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-2xl shadow-xl shadow-blue-500/30">
                <FaShieldAlt />
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-blue-400 uppercase block">Distributor Management ERP</span>
                <h1 className="text-xl font-black tracking-tight text-white">
                  BEEREDDY AGENCY
                </h1>
              </div>
            </div>

            {/* Headline Banner */}
            <div className="mt-10 space-y-3">
              <span className="bg-blue-600/30 text-blue-300 text-[11px] font-bold px-3.5 py-1.5 rounded-full border border-blue-500/30 inline-block">
                A Trusted V Bond Distributor
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                WELCOME TO <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  "BEEREDDY AGENCY"
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Dealer Management ERP • Secure • Reliable • Professional
              </p>
            </div>
          </div>

          {/* Logistics & Tile Adhesives Illustrations Feature Cards */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3 hover:bg-slate-800 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-lg shrink-0">
                <FaLayerGroup />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Tile Adhesives</h4>
                <p className="text-[10px] text-slate-400">V Bond Premium Series</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3 hover:bg-slate-800 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-lg shrink-0">
                <FaWarehouse />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Warehousing</h4>
                <p className="text-[10px] text-slate-400">Live Inventory Audit</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3 hover:bg-slate-800 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-lg shrink-0">
                <FaTruck />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Distribution</h4>
                <p className="text-[10px] text-slate-400">Fast Retailer Dispatch</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3 hover:bg-slate-800 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center text-lg shrink-0">
                <FaBoxes />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Stock Logistics</h4>
                <p className="text-[10px] text-slate-400">Real-Time Stock Alerts</p>
              </div>
            </div>
          </div>

          {/* Footer Highlights */}
          <div className="space-y-2 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex flex-wrap justify-between">
            <span className="flex items-center gap-1.5"><FaCheckCircle className="text-emerald-400" /> 100% Tax Invoices</span>
            <span className="flex items-center gap-1.5"><FaCheckCircle className="text-emerald-400" /> Instant GST Invoicing</span>
            <span className="flex items-center gap-1.5"><FaCheckCircle className="text-emerald-400" /> 24/7 Retailer Orders</span>
          </div>
        </div>

        {/* Right Side: Login Card (5 Cols) */}
        <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center bg-slate-900/95">
          <div className="mb-6">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">Portal Login</h3>
            <p className="text-xs text-slate-400 mt-1">Sign in with your registered mobile or email</p>
          </div>

          <form onSubmit={loginUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Mobile Number or Email
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-3.5 text-slate-500 text-sm" />
                <input
                  type="text"
                  placeholder="Enter mobile or email..."
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600 font-medium"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold transition"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-3.5 text-slate-500 text-sm" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600 font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-slate-300 font-medium cursor-pointer">
                Remember Me on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Sign In to ERP</span>
                  <FaArrowRight className="text-xs" />
                </>
              )}
            </button>

            <div className="text-center pt-6 border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                New Retailer / Dealer?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-blue-400 hover:text-blue-300 font-bold transition underline"
                >
                  Register Dealer Account
                </button>
              </p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Login;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaUser, FaLock, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import api from "../services/api";
import { saveAuth } from "../utils/auth";
import { errorToast, successToast } from "../utils/toast";

function Login() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Background Glow Touches */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2 relative z-10">
        
        {/* Left Side: Brand Experience */}
        <div className="p-8 lg:p-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800/80 text-white flex flex-col justify-between space-y-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
                <FaShieldAlt />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                  BEEREDDY
                </h1>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">V Bond Distributor Agency</p>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Enterprise Management & B2B Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Streamlined order processing, inventory tracking, tax invoices, and real-time payment settlement for distributors and retailers.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <FaCheckCircle className="text-emerald-400 flex-shrink-0" />
              <span>Real-Time Order Tracking & Invoice Downloads</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <FaCheckCircle className="text-emerald-400 flex-shrink-0" />
              <span>Instant UPI & Online Gateway Settlement</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <FaCheckCircle className="text-emerald-400 flex-shrink-0" />
              <span>3D Product Interactive Models Catalog</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center bg-slate-900">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white tracking-tight">Sign In to Account</h3>
            <p className="text-xs text-slate-400 mt-1">Enter your registered email/phone and password</p>
          </div>

          <form onSubmit={loginUser} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Email or Mobile Number
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-3.5 text-slate-500 text-sm" />
                <input
                  type="text"
                  placeholder="name@example.com or 9876543210"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600 font-medium"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <FaArrowRight className="text-xs" />
                </>
              )}
            </button>

            <div className="text-center pt-6 border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                Are you a new retailer?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-blue-400 hover:text-blue-300 font-bold transition underline"
                >
                  Register Partner Account
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
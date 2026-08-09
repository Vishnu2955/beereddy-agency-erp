import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaUser,
  FaLock,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaDownload,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { successToast, errorToast } from "../utils/toast";
import { usePwa } from "../context/PwaContext";

function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { isInstallable, promptInstall } = usePwa();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      console.log("Submitting login request for:", login);
      const res = await api.post("/auth/login", {
        login,
        password,
      });

      console.log("Login API Response:", res.data);

      if (res.data && res.data.success) {
        const { token, user } = res.data;
        authLogin(token, user);
        successToast("Signed in successfully!");
        navigate("/dashboard", { replace: true });
      } else {
        errorToast(res.data?.message || "Login failed. Please check credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Invalid credentials. Please check and try again.";
      errorToast(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-950 via-amber-950 to-orange-950 relative overflow-hidden font-sans">
      {/* Legend Glass Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/30 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/25 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Main 3D Card Stage */}
      <div className="auth-stage-custom relative z-10">
        <div className="auth-card-custom shadow-2xl">
          <div className="card-inner-custom">
            
            {/* Left Panel: 3D Walking Character Scene */}
            <div className="animation-panel-custom flex flex-col justify-between">
              
              {/* Top Branding Banner */}
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-2xl shadow-lg border border-white/30">
                      <FaShieldAlt />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold tracking-widest text-white/90 uppercase block">Distributor ERP</span>
                      <h1 className="text-xl font-black tracking-tight text-white">
                        BEEREDDY AGENCY
                      </h1>
                    </div>
                  </div>

                  <button
                    onClick={isInstallable ? promptInstall : () => {}}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all active:scale-95 border border-emerald-300/40 shrink-0 cursor-pointer"
                  >
                    <FaDownload className="text-xs" /> <span>Install App</span>
                  </button>
                </div>

                <div className="mt-8 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/80">Welcome Back</p>
                  <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                    Move Forward With Confidence.
                  </h2>
                  <p className="text-xs text-white/90 font-medium max-w-sm leading-relaxed">
                    V Bond Tile Adhesives • Live Stock Logistics • Instant GST Billing
                  </p>
                </div>
              </div>

              {/* Interactive 3D Character Dragging Card Scene */}
              <div className="scene-custom min-h-[240px]">
                <div className="ground-custom" />
                <div className="pull-rope" />
                
                {/* 3D Floating V-Bond Product Cubes */}
                <div className="floating-cube-3d cube-1">
                  <span>V-BOND</span>
                  <span className="text-[6px] opacity-80">ADHESIVE</span>
                </div>

                <div className="floating-cube-3d cube-2">
                  <span>TILE</span>
                  <span className="text-[6px] opacity-80">PRO</span>
                </div>

                {/* 3D Character Multi-Layer Structure */}
                <div className="character-wrapper-custom">
                  <div className="character-custom">
                    <div className="shadow-custom" />
                    
                    <div className="torso-custom">
                      <div className="character-shirt" />
                      <div className="character-tie" />
                      <div className="character-belt">
                        <div className="character-buckle" />
                      </div>
                    </div>

                    <div className="head-custom">
                      <div className="character-hair" />
                      <div className="character-eyes">
                        <div className="eye" />
                        <div className="eye" />
                      </div>
                      <div className="character-smile" />
                    </div>

                    <div className="arm-custom left" />
                    <div className="arm-custom right" />
                    
                    <div className="legs-custom">
                      <div className="leg-custom left">
                        <div className="character-shoe" />
                      </div>
                      <div className="leg-custom right">
                        <div className="character-shoe" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="briefcase-custom" />
              </div>

              {/* Bottom Feature Badges */}
              <div className="relative z-10 pt-4 border-t border-white/20 flex flex-wrap gap-4 text-[11px] font-bold text-white/90">
                <span className="flex items-center gap-1.5"><FaCheckCircle className="text-white" /> 100% Tax Invoices</span>
                <span className="flex items-center gap-1.5"><FaCheckCircle className="text-white" /> Live Inventory</span>
                <span className="flex items-center gap-1.5"><FaCheckCircle className="text-white" /> 24/7 Orders</span>
              </div>

            </div>

            {/* Right Panel: Sleek Form Controls (Dragged from Right to Center) */}
            <div className="form-panel-custom">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">Official Portal</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Portal Login</h3>
                <p className="text-xs text-slate-500 mt-1">Sign in with your registered mobile number or email</p>
              </div>

              <form onSubmit={loginUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Mobile Number or Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-amber-500">
                      <FaUser className="text-sm" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter mobile or email..."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-slate-400 font-semibold"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-[11px] text-amber-600 hover:text-amber-700 font-bold transition cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-amber-500">
                      <FaLock className="text-sm" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl pl-11 pr-11 py-3.5 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-slate-400 font-semibold"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-xs text-slate-600 font-semibold cursor-pointer">
                    Remember Me on this device
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs py-4 rounded-2xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 mt-3 cursor-pointer active:scale-98 shimmer-btn"
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

                <div className="text-center pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">
                    New Retailer / Dealer?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/register")}
                      className="text-amber-600 hover:text-amber-700 font-bold transition underline cursor-pointer"
                    >
                      Register Dealer Account
                    </button>
                  </p>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
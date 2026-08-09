import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaArrowRight, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";
import VbondTruck3D from "../components/common/VbondTruck3D";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const { email, otp } = location.state || {};

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!password || !confirmPassword) {
      return errorToast("Please fill in both password fields.");
    }

    if (password !== confirmPassword) {
      return errorToast("Passwords do not match. Please re-enter.");
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/reset-password", {
        email,
        otp,
        password,
      });

      if (res.data?.success !== false) {
        localStorage.clear();
        sessionStorage.clear();
        successToast("🔒 Password changed successfully! You have been logged out from all active devices for security reasons. Please sign in with your new password.");
        navigate("/", { replace: true });
      } else {
        errorToast(res.data?.message || "Reset failed. Please try again.");
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-950 via-amber-950 to-orange-950 relative overflow-hidden font-sans">
      {/* Legend Glass Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/30 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/25 rounded-full blur-[140px] animate-pulse pointer-events-none" />

      {/* Main 3D Stage Card */}
      <div className="auth-stage-custom relative z-10">
        <div className="auth-card-custom shadow-2xl">
          <div className="card-inner-custom">
            
            {/* Left Panel: 3D Character Password Reset Scene */}
            <div className="animation-panel-custom flex flex-col justify-between">
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-2xl shadow-lg border border-white/30">
                    <FaShieldAlt />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-white/90 uppercase block">Security Credential</span>
                    <h1 className="text-xl font-black tracking-tight text-white">
                      BEEREDDY AGENCY
                    </h1>
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/80">New Password</p>
                  <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                    Set New Account Password.
                  </h2>
                  <p className="text-xs text-white/90 font-medium max-w-sm leading-relaxed">
                    Choose a strong password to secure your ERP portal account.
                  </p>
                </div>
              </div>

              {/* 3D Animated V-BOND Logistics Moving Truck Scene */}
              <div className="py-2">
                <VbondTruck3D bannerText="V-BOND" subText="SECURE CREDENTIALS" />
              </div>

              <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-white/90">
                <span>🔒 Protected Credentials Update</span>
              </div>
            </div>

            {/* Right Panel: Glassmorphic Form Controls */}
            <div className="form-panel-custom">
              <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Create New Password</h3>
                <p className="text-xs text-slate-500 mt-1">Please enter and confirm your new account password</p>
              </div>

              <form onSubmit={resetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    New Password
                  </label>
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-amber-500">
                      <FaLock className="text-sm" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl pl-11 pr-11 py-3.5 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-slate-400 font-semibold"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs py-4 rounded-2xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 mt-4 cursor-pointer active:scale-98 shimmer-btn"
                >
                  {loading ? (
                    <span>Saving New Password...</span>
                  ) : (
                    <>
                      <FaCheckCircle className="text-xs" />
                      <span>Save New Password & Sign In</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
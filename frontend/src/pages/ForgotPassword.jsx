import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaEnvelope, FaArrowRight, FaArrowLeft, FaKey } from "react-icons/fa";
import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";
import VbondTruck3D from "../components/common/VbondTruck3D";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      return errorToast("Please enter your registered email address.");
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/send-otp", { email });

      if (res.data?.success !== false) {
        successToast("OTP code sent successfully to your email!");
        navigate("/verify-otp", { state: { email } });
      } else {
        errorToast(res.data?.message || "Failed to send OTP code.");
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to send OTP. Please check email address.");
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
            
            {/* Left Panel: 3D Character Security Scene */}
            <div className="animation-panel-custom flex flex-col justify-between">
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-2xl shadow-lg border border-white/30">
                    <FaKey />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-white/90 uppercase block">Account Security</span>
                    <h1 className="text-xl font-black tracking-tight text-white">
                      BEEREDDY AGENCY
                    </h1>
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/80">Password Recovery</p>
                  <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                    Reset Access In Seconds.
                  </h2>
                  <p className="text-xs text-white/90 font-medium max-w-sm leading-relaxed">
                    We will send a 6-digit security OTP to verify your registered email address.
                  </p>
                </div>
              </div>

              {/* 3D Animated V-BOND Logistics Moving Truck Scene */}
              <div className="py-2">
                <VbondTruck3D bannerText="V-BOND" subText="SECURE ACCESS" />
              </div>

              <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-white/90">
                <span>🔒 256-Bit Encrypted OTP Verification</span>
              </div>
            </div>

            {/* Right Panel: Glassmorphic Form Controls */}
            <div className="form-panel-custom">
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-700 transition cursor-pointer mb-4"
                >
                  <FaArrowLeft /> Back to Login
                </button>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Forgot Password</h3>
                <p className="text-xs text-slate-500 mt-1">Enter your registered email address to receive an OTP code</p>
              </div>

              <form onSubmit={sendOTP} className="space-y-4" autoComplete="off">
                <input type="text" name="prevent_autofill_user" className="hidden" tabIndex="-1" autoComplete="off" />
                <input type="password" name="prevent_autofill_pass" className="hidden" tabIndex="-1" autoComplete="new-password" />

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-amber-500">
                      <FaEnvelope className="text-sm" />
                    </div>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-slate-400 font-semibold"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
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
                    <span>Sending Security Code...</span>
                  ) : (
                    <>
                      <span>Send OTP Code</span>
                      <FaArrowRight className="text-xs" />
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
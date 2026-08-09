import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaShieldAlt, FaKey, FaArrowRight, FaArrowLeft, FaSyncAlt } from "react-icons/fa";
import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";
import VbondTruck3D from "../components/common/VbondTruck3D";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const verifyOTP = async (e) => {
    if (e) e.preventDefault();
    if (!otp) {
      return errorToast("Please enter the 6-digit OTP code.");
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      if (res.data?.success !== false) {
        successToast("OTP verified successfully!");
        navigate("/reset-password", {
          state: { email, otp },
        });
      } else {
        errorToast(res.data?.message || "Invalid OTP code.");
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "OTP Verification Failed. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      return errorToast("Email address missing. Please request OTP again.");
    }

    try {
      setResending(true);
      await api.post("/auth/send-otp", { email });
      successToast("A new OTP code has been sent to your email!");
      setTimer(60);
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
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
            
            {/* Left Panel: 3D Character OTP Scene */}
            <div className="animation-panel-custom flex flex-col justify-between">
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-2xl shadow-lg border border-white/30">
                    <FaShieldAlt />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-white/90 uppercase block">OTP Verification</span>
                    <h1 className="text-xl font-black tracking-tight text-white">
                      BEEREDDY AGENCY
                    </h1>
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/80">Security Check</p>
                  <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                    Verify Security OTP Code.
                  </h2>
                  <p className="text-xs text-white/90 font-medium max-w-sm leading-relaxed">
                    Check your inbox at <span className="font-bold underline">{email || "registered email"}</span>
                  </p>
                </div>
              </div>

              {/* 3D Animated V-BOND Logistics Moving Truck Scene */}
              <div className="py-2">
                <VbondTruck3D bannerText="V-BOND" subText="OTP VERIFICATION" />
              </div>

              <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-white/90">
                <span>🔒 Single-Use Verification Code</span>
              </div>
            </div>

            {/* Right Panel: Glassmorphic Form Controls */}
            <div className="form-panel-custom">
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-700 transition cursor-pointer mb-4"
                >
                  <FaArrowLeft /> Change Email
                </button>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Verify Security Code</h3>
                <p className="text-xs text-slate-500 mt-1">Enter the 6-digit code sent to your email address</p>
              </div>

              <form onSubmit={verifyOTP} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    6-Digit Security OTP
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="• • • • • •"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xl tracking-widest text-center rounded-2xl py-4 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-black"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs py-4 rounded-2xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 mt-3 cursor-pointer active:scale-98 shimmer-btn"
                >
                  {loading ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <span>Verify Code & Continue</span>
                      <FaArrowRight className="text-xs" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  {timer > 0 ? (
                    <p className="text-xs text-slate-500 font-semibold">
                      Resend OTP code in <span className="text-amber-600 font-black">{timer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resending}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 hover:text-amber-700 transition cursor-pointer"
                    >
                      <FaSyncAlt className={resending ? "animate-spin" : ""} /> Resend OTP Code
                    </button>
                  )}
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
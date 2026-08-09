import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaShieldAlt, FaKey, FaArrowRight, FaArrowLeft, FaSyncAlt, FaCheckCircle } from "react-icons/fa";
import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";
import VbondTruck3D from "../components/common/VbondTruck3D";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef([]);

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

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = (index, value) => {
    const char = value.slice(-1);
    if (!/^\d*$/.test(char)) return; // Digits only

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto focus next box
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newDigits = pastedData.split("");
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
    }
  };

  const fullOtp = digits.join("");

  const verifyOTP = async (e) => {
    if (e) e.preventDefault();
    if (fullOtp.length !== 6) {
      return errorToast("Please enter the complete 6-digit OTP code.");
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/verify-otp", {
        email,
        otp: fullOtp,
      });

      if (res.data?.success !== false) {
        successToast("✅ Security OTP verified successfully!");
        navigate("/reset-password", {
          state: { email, otp: fullOtp },
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
      successToast("✅ A new 6-digit OTP code has been sent to your email!");
      setTimer(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-950 via-amber-950 to-orange-950 relative overflow-hidden font-sans">
      {/* Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/30 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/25 rounded-full blur-[140px] animate-pulse pointer-events-none" />

      {/* Main 3D Stage Card */}
      <div className="auth-stage-custom relative z-10 w-full max-w-4xl">
        <div className="auth-card-custom shadow-2xl overflow-hidden rounded-3xl border border-white/20">
          <div className="card-inner-custom grid lg:grid-cols-2">
            
            {/* Left Panel: 3D Animated Logistics Scene */}
            <div className="animation-panel-custom p-8 flex flex-col justify-between bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white relative">
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-2xl shadow-lg border border-white/30">
                    <FaShieldAlt />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-white/90 uppercase block">OTP Verification V2</span>
                    <h1 className="text-xl font-black tracking-tight text-white">
                      BEEREDDY AGENCY
                    </h1>
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white bg-white/20 px-3 py-1 rounded-full border border-white/30">
                    Security Authentication
                  </span>
                  <h2 className="text-3xl font-black text-white leading-tight">
                    Verify Your 6-Digit PIN.
                  </h2>
                  <p className="text-xs text-white/90 font-medium max-w-sm leading-relaxed">
                    Check your email inbox at <span className="font-bold underline">{email || "registered account"}</span>
                  </p>
                </div>
              </div>

              {/* 3D Animated V-BOND Logistics Moving Truck Scene */}
              <div className="py-4">
                <VbondTruck3D bannerText="V-BOND" subText="OTP VERIFICATION" />
              </div>

              <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-white/90">
                <span>🔒 Single-Use Encrypted Code</span>
                <span>V2 UI Format</span>
              </div>
            </div>

            {/* Right Panel: V2 6-Digit PIN Form Controls */}
            <div className="form-panel-custom p-8 bg-white dark:bg-slate-900 flex flex-col justify-center space-y-6">
              <div>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-700 transition cursor-pointer mb-4"
                >
                  <FaArrowLeft /> Change Email
                </button>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Enter Verification PIN</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please enter the 6-digit code sent to your inbox</p>
              </div>

              <form onSubmit={verifyOTP} className="space-y-6">
                
                {/* 6 Individual V2 PIN Input Boxes */}
                <div className="flex justify-between items-center gap-2" onPaste={handlePaste}>
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`w-11 h-14 text-center text-xl font-black rounded-2xl border transition-all duration-200 outline-none ${
                        digit
                          ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-600 shadow-md shadow-amber-500/20 scale-105"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || fullOtp.length !== 6}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs py-4 rounded-2xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 cursor-pointer active:scale-98"
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
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
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
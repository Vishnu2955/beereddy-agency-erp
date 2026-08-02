import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

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

  const verifyOTP = async () => {
    if (!otp) {
      return alert("Enter OTP");
    }

    try {
      setLoading(true);

      await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      alert("OTP Verified Successfully!");

      navigate("/reset-password", {
        state: {
          email,
          otp,
        },
      });

    } catch (err) {
      alert(err.response?.data?.message || "OTP Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      return alert("Email address missing. Please request OTP again.");
    }

    try {
      setResending(true);
      await api.post("/auth/send-otp", { email });
      alert("A new OTP has been sent to your email!");
      setTimer(60); // Reset 60s timer
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-[400px]">

        <h1 className="text-2xl font-bold mb-2 text-center text-blue-700">
          Verify OTP
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter the OTP sent to <span className="font-semibold text-gray-700">{email || "your email"}</span>
        </p>

        <input
          type="text"
          placeholder="Enter 6 Digit OTP"
          className="border w-full p-3 rounded-lg mb-4 text-center text-xl tracking-widest outline-none focus:ring-2 focus:ring-blue-500"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
        />

        <button
          onClick={verifyOTP}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white w-full p-3 rounded-lg font-semibold transition mb-4 shadow"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center border-t pt-4">
          <p className="text-xs text-gray-500 mb-2">
            Didn't receive the OTP?
          </p>

          <button
            onClick={handleResendOtp}
            disabled={timer > 0 || resending}
            className={`w-full py-2 rounded-lg font-medium text-sm transition border ${
              timer > 0 || resending
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
            }`}
          >
            {resending
              ? "Resending..."
              : timer > 0
              ? `Resend OTP in ${timer}s`
              : "Resend OTP"}
          </button>
        </div>

      </div>
    </div>
  );
}
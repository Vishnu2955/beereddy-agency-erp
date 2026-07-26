import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

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

      alert("OTP Verified");

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

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-xl w-[400px]">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Verify OTP
        </h1>

        <input
          type="text"
          placeholder="Enter 6 Digit OTP"
          className="border w-full p-3 rounded mb-4"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          onClick={verifyOTP}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white w-full p-3 rounded"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

      </div>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const sendOTP = async () => {
    if (!email) {
      return alert("Please enter your email.");
    }

    try {
      setLoading(true);

      await api.post("/auth/send-otp", {
        email,
      });

      alert("OTP sent successfully.");

      navigate("/verify-otp", {
        state: { email },
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-xl w-[400px]">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Forgot Password
        </h1>

        <input
          type="email"
          placeholder="Registered Email"
          className="border w-full p-3 rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={sendOTP}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full p-3 rounded"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>

      </div>
    </div>
  );
}
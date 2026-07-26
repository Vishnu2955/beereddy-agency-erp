import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const { email, otp } = location.state || {};

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const resetPassword = async () => {
    if (!password || !confirmPassword) {
      return alert("Fill all fields");
    }

    if (password !== confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        email,
        otp,
        password,
      });

      alert("Password Changed Successfully");

      navigate("/");

    } catch (err) {
      alert(err.response?.data?.message || "Reset Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-xl w-[400px]">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Reset Password
        </h1>

        <input
          type="password"
          placeholder="New Password"
          className="border w-full p-3 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="border w-full p-3 rounded mb-4"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={resetPassword}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full p-3 rounded"
        >
          {loading ? "Saving..." : "Change Password"}
        </button>

      </div>
    </div>
  );
}
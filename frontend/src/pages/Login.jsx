import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveAuth } from "../utils/auth";

function Login() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        login,
        password,
      });

      console.log("========== LOGIN RESPONSE ==========");
      console.log(res.data);

      console.log("Token from API:");
      console.log(res.data.token);

      console.log("User from API:");
      console.log(res.data.user);

      saveAuth(res.data.token, res.data.user);

      console.log("========== AFTER SAVING ==========");

      console.log("Stored Token:");
      console.log(localStorage.getItem("token"));

      console.log("Stored User:");
      console.log(localStorage.getItem("user"));

      navigate("/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR");
      console.error(err);

      alert(
        err.response?.data?.message || "Login Failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={loginUser}
        className="bg-white p-8 rounded-xl shadow-lg w-[400px]"
      >
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Beereddy ERP
        </h1>

        <input
          type="text"
          placeholder="Email or Phone"
          className="border w-full p-3 rounded mb-4 outline-none focus:ring-2 focus:ring-blue-500"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border w-full p-3 rounded mb-6 outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
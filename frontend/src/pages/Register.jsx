import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaStore, FaPhone, FaEnvelope, FaMapMarkerAlt, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaArrowLeft, FaCheckCircle, FaUserCheck } from "react-icons/fa";
import api from "../services/api";
import { saveAuth } from "../utils/auth";
import { successToast, errorToast } from "../utils/toast";
import VbondTruck3D from "../components/common/VbondTruck3D";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    shopName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return errorToast("Passwords do not match!");
    }

    if (formData.password.length < 4) {
      return errorToast("Password must be at least 4 characters long.");
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        fullName: formData.fullName,
        shopName: formData.shopName || formData.fullName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        role: "retailer",
      });

      if (res.data.success !== false) {
        successToast("Dealer account registered successfully! Logging you in...");
        
        // Auto-login after registration
        const loginRes = await api.post("/auth/login", {
          login: formData.email || formData.phone,
          password: formData.password,
        });

        if (loginRes.data.success !== false) {
          saveAuth(loginRes.data.token, loginRes.data.user);
          navigate("/products");
        } else {
          navigate("/");
        }
      } else {
        errorToast(res.data?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      errorToast(err.response?.data?.message || "Registration failed. Please try again.");
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
      <div className="auth-stage-custom relative z-10 w-full max-w-5xl">
        <div className="auth-card-custom shadow-2xl">
          <div className="card-inner-custom">
            
            {/* Left Panel: 3D Character Onboarding Scene */}
            <div className="animation-panel-custom flex flex-col justify-between p-6 sm:p-8">
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-2xl shadow-lg border border-white/30">
                    <FaUserCheck />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-white/90 uppercase block">B2B Retailer Partner</span>
                    <h1 className="text-xl font-black tracking-tight text-white">
                      BEEREDDY AGENCY
                    </h1>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/80">Authorized Onboarding</p>
                  <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                    Join Our Retailer Network.
                  </h2>
                  <p className="text-xs text-white/90 font-medium max-w-sm leading-relaxed">
                    Get direct factory pricing, live inventory updates, and instant B2B GST billing on V-Bond Tile Adhesives.
                  </p>
                </div>
              </div>

              {/* 3D Animated V-BOND Logistics Moving Truck Scene */}
              <div className="py-2">
                <VbondTruck3D bannerText="V-BOND" subText="B2B LOGISTICS TRUCK" />
              </div>

              <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-white/90">
                <span className="flex items-center gap-1.5"><FaCheckCircle className="text-amber-400" /> Direct Factory Pricing</span>
                <span className="flex items-center gap-1.5"><FaCheckCircle className="text-amber-400" /> Instant GST Invoicing</span>
              </div>
            </div>

            {/* Right Panel: Glassmorphic Form Controls */}
            <div className="form-panel-custom p-6 sm:p-8">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Register Retailer Account</h3>
                  <p className="text-xs text-slate-500 mt-1">Fill in your business details to get started</p>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition cursor-pointer"
                >
                  <FaArrowLeft /> Sign In
                </Link>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5" autoComplete="off">
                {/* Hidden dummy fields to trick browser password manager autofill */}
                <input type="text" name="prevent_autofill_user" className="hidden" tabIndex="-1" autoComplete="off" />
                <input type="password" name="prevent_autofill_pass" className="hidden" tabIndex="-1" autoComplete="new-password" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3.5 text-amber-500">
                        <FaUser className="text-xs" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        autoComplete="off"
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl pl-10 pr-3 py-3 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Shop / Business Name
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3.5 text-amber-500">
                        <FaStore className="text-xs" />
                      </div>
                      <input
                        type="text"
                        name="shopName"
                        placeholder="e.g. Beereddy Store"
                        value={formData.shopName}
                        onChange={handleChange}
                        autoComplete="off"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl pl-10 pr-3 py-3 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3.5 text-amber-500">
                        <FaPhone className="text-xs" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                        autoComplete="off"
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl pl-10 pr-3 py-3 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3.5 text-amber-500">
                        <FaEnvelope className="text-xs" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="dealer@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="off"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl pl-10 pr-3 py-3 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Business Address / City
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3.5 text-amber-500">
                      <FaMapMarkerAlt className="text-xs" />
                    </div>
                    <input
                      type="text"
                      name="address"
                      placeholder="City, State, Pincode"
                      value={formData.address}
                      onChange={handleChange}
                      autoComplete="off"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl pl-10 pr-3 py-3 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3.5 text-amber-500">
                        <FaLock className="text-xs" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl pl-10 pr-10 py-3 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3.5 text-amber-500">
                        <FaLock className="text-xs" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl pl-10 pr-10 py-3 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs py-4 rounded-2xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 mt-4 cursor-pointer active:scale-98 shimmer-btn"
                >
                  {loading ? (
                    <span>Registering Retailer Account...</span>
                  ) : (
                    <>
                      <span>Create Retailer Account</span>
                      <FaArrowRight className="text-xs" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-5 pt-3 border-t border-slate-200/80">
                <p className="text-xs text-slate-500 font-semibold">
                  Already a registered partner?{" "}
                  <Link to="/" className="text-amber-600 hover:text-amber-700 font-extrabold transition">
                    Sign In to Portal
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

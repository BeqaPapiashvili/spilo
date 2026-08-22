"use client";

import { useState } from "react";
import { X, Check, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function AuthModal() {
  const { isAuthModalOpen, toggleAuthModal, setUser, addToast } = useStore();

  // Mode: "login" | "register"
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Custom Inline Validation & API Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setErrors({});
    setIsLoading(false);
  };

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!loginEmail.trim()) {
      newErrors.loginEmail = "გთხოვთ მიუთითოთ ელფოსტის მისამართი";
    } else if (!loginEmail.includes("@")) {
      newErrors.loginEmail = "გთხოვთ მიუთითოთ სწორი ელფოსტის ფორმატი";
    }

    if (!loginPassword.trim()) {
      newErrors.loginPassword = "გთხოვთ მიუთითოთ პაროლი";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrors({ general: data.error || "ავტორიზაციის შეცდომა" });
        setIsLoading(false);
        return;
      }

      setUser(data.user);
      if (data.adminSession && data.adminToken) {
        useStore.getState().setAdminSession(data.adminSession, data.adminToken);
      }
      addToast({
        title: "მოგესალმებით!",
        message: `გამარჯობა, ${data.user.name}`,
        type: "success",
      });
      toggleAuthModal(false);
    } catch (err: any) {
      setErrors({ general: "სერვერთან დაკავშირების შეცდომა" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!regName.trim()) {
      newErrors.regName = "გთხოვთ მიუთითოთ სახელი და გვარი";
    }

    if (!regEmail.trim()) {
      newErrors.regEmail = "გთხოვთ მიუთითოთ ელფოსტა";
    } else if (!regEmail.includes("@")) {
      newErrors.regEmail = "გთხოვთ მიუთითოთ სწორი ელფოსტის ფორმატი";
    }

    if (!regPassword) {
      newErrors.regPassword = "გთხოვთ მიუთითოთ პაროლი";
    } else if (regPassword.length < 6) {
      newErrors.regPassword = "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს";
    }

    if (!regConfirmPassword) {
      newErrors.regConfirmPassword = "გთხოვთ დაადასტუროთ პაროლი";
    } else if (regPassword !== regConfirmPassword) {
      newErrors.regConfirmPassword = "პაროლები ერთმანეთს არ ემთხვევა";
    }

    if (!agreeTerms) {
      newErrors.terms = "გთხოვთ დაეთანხმოთ წესებსა და პირობებს";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrors({ general: data.error || "რეგისტრაციის შეცდომა" });
        setIsLoading(false);
        return;
      }

      setUser(data.user);
      addToast({
        title: "რეგისტრაცია წარმატებით დასრულდა!",
        message: `მოგესალმებით Spilo.ge-ზე, ${data.user.name}`,
        type: "success",
      });
      toggleAuthModal(false);
    } catch (err: any) {
      setErrors({ general: "სერვერთან დაკავშირების შეცდომა" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => toggleAuthModal(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-[28px] max-w-[440px] w-full p-7 md:p-8 shadow-2xl relative z-10 space-y-6 overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Close Button */}
              <button
                onClick={() => toggleAuthModal(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer z-20"
                title="დახურვა"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Mode Header Tabs ("ავტორიზაცია" / "რეგისტრაცია") */}
              <div className="border-b border-gray-200/80 relative flex items-center justify-between">
                <button
                  onClick={() => switchMode("login")}
                  className={`flex-1 pb-3 text-center text-base md:text-lg transition-colors cursor-pointer relative ${mode === "login" ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
                    }`}
                >
                  <span>ავტორიზაცია</span>
                  {mode === "login" && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                    />
                  )}
                </button>

                <button
                  onClick={() => switchMode("register")}
                  className={`flex-1 pb-3 text-center text-base md:text-lg transition-colors cursor-pointer relative ${mode === "register" ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
                    }`}
                >
                  <span>რეგისტრაცია</span>
                  {mode === "register" && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                    />
                  )}
                </button>
              </div>

              {/* Form Content */}
              <div className="pt-4">
                {errors.general && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.general}</span>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {mode === "login" ? (
                    <motion.form
                      key="login-animated-form"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.15, ease: "easeInOut" }}
                      onSubmit={handleLoginSubmit}
                      className="space-y-4"
                    >
                      {/* Email Field */}
                      <div className="space-y-1">
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex flex-col justify-center focus-within:ring-2 focus-within:ring-blue-600/30 transition-all">
                          <label className="text-[11px] text-gray-500 block">
                            ელფოსტა
                          </label>
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => {
                              setLoginEmail(e.target.value);
                              if (errors.loginEmail) setErrors((prev) => ({ ...prev, loginEmail: "" }));
                            }}
                            placeholder="example@gmail.com"
                            className="bg-transparent text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none w-full mt-0.5"
                            autoFocus
                          />
                        </div>
                        {errors.loginEmail && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.loginEmail}</span>
                          </div>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="space-y-1">
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex items-center justify-between focus-within:ring-2 focus-within:ring-blue-600/30 transition-all">
                          <div className="flex-1">
                            <label className="text-[11px] text-gray-500 block">
                              პაროლი
                            </label>
                            <input
                              type={showLoginPassword ? "text" : "password"}
                              value={loginPassword}
                              onChange={(e) => {
                                setLoginPassword(e.target.value);
                                if (errors.loginPassword) setErrors((prev) => ({ ...prev, loginPassword: "" }));
                              }}
                              placeholder="••••••••••"
                              className="bg-transparent text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none w-full mt-0.5"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                          >
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.loginPassword && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.loginPassword}</span>
                          </div>
                        )}
                      </div>

                      {/* Remember Me & Forgot Password Row */}
                      <div className="flex items-center justify-between pt-0.5 text-xs">
                        <div
                          onClick={() => setRememberMe(!rememberMe)}
                          className="flex items-center gap-2.5 cursor-pointer select-none group"
                        >
                          <motion.div
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            className={`w-5 h-5 rounded-[7px] flex items-center justify-center shrink-0 transition-all duration-200 shadow-2xs ${rememberMe
                              ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/30 border border-blue-600"
                              : "bg-[#F1F3F6] border border-gray-300/80 group-hover:border-blue-400 group-hover:bg-blue-50/50"
                              }`}
                          >
                            <AnimatePresence>
                              {rememberMe && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                          <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                            დამახსოვრება
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => alert("პაროლის აღდგენის ინსტრუქცია გაიგზავნება ელფოსტაზე")}
                          className="text-gray-900 hover:underline cursor-pointer"
                        >
                          დაგავიწყდა პაროლი?
                        </button>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl text-sm md:text-base cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>მიმდინარეობს...</span>
                          </>
                        ) : (
                          <span>შესვლა</span>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register-animated-form"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15, ease: "easeInOut" }}
                      onSubmit={handleRegisterSubmit}
                      className="space-y-3.5"
                    >
                      {/* Name Field */}
                      <div className="space-y-1">
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex flex-col justify-center focus-within:ring-2 focus-within:ring-blue-600/30 transition-all">
                          <label className="text-[11px] text-gray-500 block">
                            სახელი და გვარი
                          </label>
                          <input
                            type="text"
                            value={regName}
                            onChange={(e) => {
                              setRegName(e.target.value);
                              if (errors.regName) setErrors((prev) => ({ ...prev, regName: "" }));
                            }}
                            placeholder="გიორგი გიორგაძე"
                            className="bg-transparent text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none w-full mt-0.5"
                            autoFocus
                          />
                        </div>
                        {errors.regName && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.regName}</span>
                          </div>
                        )}
                      </div>

                      {/* Email Field */}
                      <div className="space-y-1">
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex flex-col justify-center focus-within:ring-2 focus-within:ring-blue-600/30 transition-all">
                          <label className="text-[11px] text-gray-500 block">
                            ელფოსტა
                          </label>
                          <input
                            type="email"
                            value={regEmail}
                            onChange={(e) => {
                              setRegEmail(e.target.value);
                              if (errors.regEmail) setErrors((prev) => ({ ...prev, regEmail: "" }));
                            }}
                            placeholder="example@gmail.com"
                            className="bg-transparent text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none w-full mt-0.5"
                          />
                        </div>
                        {errors.regEmail && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.regEmail}</span>
                          </div>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="space-y-1">
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex items-center justify-between focus-within:ring-2 focus-within:ring-blue-600/30 transition-all">
                          <div className="flex-1">
                            <label className="text-[11px] text-gray-500 block">
                              პაროლი
                            </label>
                            <input
                              type={showRegPassword ? "text" : "password"}
                              value={regPassword}
                              onChange={(e) => {
                                setRegPassword(e.target.value);
                                if (errors.regPassword) setErrors((prev) => ({ ...prev, regPassword: "" }));
                              }}
                              placeholder="მინიმუმ 6 სიმბოლო"
                              className="bg-transparent text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none w-full mt-0.5"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                          >
                            {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.regPassword && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.regPassword}</span>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password Field */}
                      <div className="space-y-1">
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex items-center justify-between focus-within:ring-2 focus-within:ring-blue-600/30 transition-all">
                          <div className="flex-1">
                            <label className="text-[11px] text-gray-500 block">
                              პაროლის განმეორება
                            </label>
                            <input
                              type={showRegConfirmPassword ? "text" : "password"}
                              value={regConfirmPassword}
                              onChange={(e) => {
                                setRegConfirmPassword(e.target.value);
                                if (errors.regConfirmPassword) setErrors((prev) => ({ ...prev, regConfirmPassword: "" }));
                              }}
                              placeholder="განმეორებით შეიყვანეთ პაროლი"
                              className="bg-transparent text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none w-full mt-0.5"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                          >
                            {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.regConfirmPassword && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.regConfirmPassword}</span>
                          </div>
                        )}
                      </div>

                      {/* Terms Checkbox */}
                      <div className="space-y-1 pt-1">
                        <div
                          onClick={() => {
                            setAgreeTerms(!agreeTerms);
                            if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
                          }}
                          className="flex items-start gap-2.5 cursor-pointer select-none group"
                        >
                          <motion.div
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            className={`w-5 h-5 rounded-[7px] flex items-center justify-center shrink-0 transition-all duration-200 mt-0.5 shadow-2xs ${agreeTerms
                              ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/30 border border-blue-600"
                              : errors.terms
                                ? "bg-red-50 border-2 border-red-500"
                                : "bg-[#F1F3F6] border border-gray-300/80 group-hover:border-blue-400 group-hover:bg-blue-50/50"
                              }`}
                          >
                            <AnimatePresence>
                              {agreeTerms && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                          <span className="text-xs text-blue-600 leading-snug">
                            წავიკითხე და ვეთანხმები <span className="underline">წესებს, პირობებს და პერსონალურ მონაცემთა დაცვის პოლიტიკას</span>
                          </span>
                        </div>
                        {errors.terms && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.terms}</span>
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl text-sm md:text-base cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>მიმდინარეობს...</span>
                          </>
                        ) : (
                          <span>რეგისტრაცია</span>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Social Auth Section */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <p className="text-center text-xs text-gray-900">
                ან გაიარე ავტორიზაცია სხვა მეთოდით
              </p>

              <button
                type="button"
                onClick={() => {
                  setUser({
                    name: "Google მომხმარებელი",
                    email: "user@gmail.com",
                    phone: "",
                  });
                  addToast({
                    title: "მოგესალმებით!",
                    message: "ავტორიზაცია გაიარეთ Google-ით",
                    type: "success",
                  });
                  toggleAuthModal(false);
                }}
                className="w-full bg-[#F1F3F6] hover:bg-gray-200/80 rounded-2xl py-3 flex items-center justify-center transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState } from "react";
import { X, Check, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import OtpInput from "@/components/ui/OtpInput";

export default function AuthModal() {
  const { isAuthModalOpen, toggleAuthModal, setUser, addToast } = useStore();

  // Mode: "login" | "register" | "forgot" | "reset"
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">("login");
  const [isLoading, setIsLoading] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [subscribeOffers, setSubscribeOffers] = useState(true);

  // Forgot / Reset Password State
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Custom Inline Validation & API Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const switchMode = (newMode: "login" | "register" | "forgot" | "reset") => {
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

    const cleanPhoneDigits = regPhone.replace(/\D/g, "");
    if (!cleanPhoneDigits) {
      newErrors.regPhone = "გთხოვთ მიუთითოთ მობილურის ნომერი";
    } else if (cleanPhoneDigits.length !== 9 || !cleanPhoneDigits.startsWith("5")) {
      newErrors.regPhone = "ნომერი უნდა შედგებოდეს 9 ციფრისგან (მაგ: 599 12 34 56)";
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
      newErrors.terms = "რეგისტრაციისთვის დაეთანხმეთ წესებსა და პირობებს";
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
          name: regName.trim(),
          email: regEmail.trim(),
          phone: cleanPhoneDigits,
          password: regPassword,
          agreeTerms,
          subscribeOffers,
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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!forgotEmail.trim()) {
      newErrors.forgotEmail = "გთხოვთ მიუთითოთ ელფოსტა";
    } else if (!forgotEmail.includes("@")) {
      newErrors.forgotEmail = "გთხოვთ მიუთითოთ სწორი ელფოსტის ფორმატი";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrors({ general: data.error || "მოთხოვნის გაგზავნა ვერ მოხერხდა" });
        setIsLoading(false);
        return;
      }

      if (data.devCode) {
        setResetCode(data.devCode);
      }

      addToast({
        title: data.devCode ? "სატესტო კოდი მზადაა" : "კოდი გაგზავნილია",
        message: data.message || "აღდგენის კოდი გაიგზავნა მითითებულ ელფოსტაზე",
        type: "info",
      });
      switchMode("reset");
    } catch (err: any) {
      setErrors({ general: "სერვერთან დაკავშირების შეცდომა" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const cleanCode = resetCode.replace(/\D/g, "");
    if (!cleanCode) {
      newErrors.resetCode = "გთხოვთ მიუთითოთ 6-ნიშნა კოდი";
    } else if (cleanCode.length !== 6) {
      newErrors.resetCode = "კოდი უნდა შედგებოდეს 6 ციფრისგან";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "გთხოვთ მიუთითოთ ახალი პაროლი";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს";
    }

    if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = "პაროლები ერთმანეთს არ ემთხვევა";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: resetCode.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrors({ general: data.error || "პაროლის შეცვლა ვერ მოხერხდა" });
        setIsLoading(false);
        return;
      }

      addToast({
        title: "პაროლი შეიცვალა!",
        message: "გთხოვთ გაიაროთ ავტორიზაცია ახალი პაროლით",
        type: "success",
      });
      setLoginEmail(forgotEmail.trim());
      setLoginPassword("");
      switchMode("login");
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
                type="button"
                onClick={() => toggleAuthModal(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FF5238] hover:bg-[#EA3A20] text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer z-20"
                title="დახურვა"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Mode Header Tabs ("ავტორიზაცია" / "რეგისტრაცია" or Back Arrow) */}
              {mode === "login" || mode === "register" ? (
                <div className="border-b border-gray-200/80 relative flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className={`flex-1 pb-3 text-center text-base md:text-lg transition-colors cursor-pointer relative ${
                      mode === "login" ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <span>ავტორიზაცია</span>
                    {mode === "login" && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF5238] rounded-full"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className={`flex-1 pb-3 text-center text-base md:text-lg transition-colors cursor-pointer relative ${
                      mode === "register" ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <span>რეგისტრაცია</span>
                    {mode === "register" && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF5238] rounded-full"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                      />
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 border-b border-gray-200/80 pb-3">
                  <button
                    type="button"
                    onClick={() => switchMode(mode === "reset" ? "forgot" : "login")}
                    className="p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <span className="text-base md:text-lg text-gray-900">
                    {mode === "forgot" ? "პაროლის აღდგენა" : "ახალი პაროლის დაყენება"}
                  </span>
                </div>
              )}

              {/* Form Content */}
              <div className="pt-4">
                {errors.general && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.general}</span>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {mode === "login" && (
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
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex flex-col justify-center focus-within:ring-2 focus-within:ring-[#FF5238]/25 transition-all">
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
                            autoComplete="email"
                            className="bg-transparent text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none w-full mt-0.5"
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
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex items-center justify-between focus-within:ring-2 focus-within:ring-[#FF5238]/25 transition-all">
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
                              placeholder="••••••••"
                              autoComplete="current-password"
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
                            className={`w-5 h-5 rounded-[7px] flex items-center justify-center shrink-0 transition-all duration-200 shadow-2xs ${
                              rememberMe
                                ? "bg-[#FF5238] text-white shadow-[#FF5238]/30 border border-[#FF5238]"
                                : "bg-[#F1F3F6] border border-gray-300/80 group-hover:border-[#FF5238] group-hover:bg-[#FFF5F2]"
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
                          onClick={() => {
                            setForgotEmail(loginEmail);
                            switchMode("forgot");
                          }}
                          className="text-[#FF5238] hover:underline cursor-pointer"
                        >
                          დაგავიწყდა პაროლი?
                        </button>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-[#FF5238] hover:bg-[#EA3A20] disabled:bg-[#FED7CC] text-white rounded-2xl text-sm md:text-base cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2"
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
                  )}

                  {mode === "register" && (
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
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex flex-col justify-center focus-within:ring-2 focus-within:ring-[#FF5238]/25 transition-all">
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
                            placeholder="გიორგი მაისურაძე"
                            autoComplete="name"
                            className="bg-transparent text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none w-full mt-0.5"
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
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex flex-col justify-center focus-within:ring-2 focus-within:ring-[#FF5238]/25 transition-all">
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
                            autoComplete="email"
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

                      {/* Phone Field */}
                      <div className="space-y-1">
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex flex-col justify-center focus-within:ring-2 focus-within:ring-[#FF5238]/25 transition-all">
                          <label className="text-[11px] text-gray-500 block">
                            მობილურის ნომერი
                          </label>
                          <input
                            type="tel"
                            value={regPhone}
                            onChange={(e) => {
                              setRegPhone(e.target.value);
                              if (errors.regPhone) setErrors((prev) => ({ ...prev, regPhone: "" }));
                            }}
                            placeholder="599 12 34 56"
                            autoComplete="tel"
                            className="bg-transparent text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none w-full mt-0.5"
                          />
                        </div>
                        {errors.regPhone && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.regPhone}</span>
                          </div>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="space-y-1">
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex items-center justify-between focus-within:ring-2 focus-within:ring-[#FF5238]/25 transition-all">
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
                              autoComplete="new-password"
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
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex items-center justify-between focus-within:ring-2 focus-within:ring-[#FF5238]/25 transition-all">
                          <div className="flex-1">
                            <label className="text-[11px] text-gray-500 block">
                              გაიმეორეთ პაროლი
                            </label>
                            <input
                              type={showRegConfirmPassword ? "text" : "password"}
                              value={regConfirmPassword}
                              onChange={(e) => {
                                setRegConfirmPassword(e.target.value);
                                if (errors.regConfirmPassword) setErrors((prev) => ({ ...prev, regConfirmPassword: "" }));
                              }}
                              placeholder="განმეორებით შეიყვანეთ პაროლი"
                              autoComplete="new-password"
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

                      {/* Terms & Conditions Checkbox */}
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
                            className={`w-5 h-5 rounded-[7px] flex items-center justify-center shrink-0 transition-all duration-200 mt-0.5 shadow-2xs ${
                              agreeTerms
                                ? "bg-[#FF5238] text-white shadow-[#FF5238]/30 border border-[#FF5238]"
                                : errors.terms
                                ? "bg-red-50 border-2 border-red-500"
                                : "bg-[#F1F3F6] border border-gray-300/80 group-hover:border-[#FF5238] group-hover:bg-[#FFF5F2]"
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
                          <span className="text-xs text-gray-700 leading-snug">
                            ვეთანხმები{" "}
                            <span className="text-[#FF5238] hover:underline">წესებს, პირობებს</span> და{" "}
                            <span className="text-[#FF5238] hover:underline">კონფიდენციალურობის პოლიტიკას</span>
                          </span>
                        </div>
                        {errors.terms && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.terms}</span>
                          </div>
                        )}
                      </div>

                      {/* Offers & Discounts Checkbox */}
                      <div
                        onClick={() => setSubscribeOffers(!subscribeOffers)}
                        className="flex items-start gap-2.5 cursor-pointer select-none group pt-0.5"
                      >
                        <motion.div
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          className={`w-5 h-5 rounded-[7px] flex items-center justify-center shrink-0 transition-all duration-200 mt-0.5 shadow-2xs ${
                            subscribeOffers
                              ? "bg-[#FF5238] text-white shadow-[#FF5238]/30 border border-[#FF5238]"
                              : "bg-[#F1F3F6] border border-gray-300/80 group-hover:border-[#FF5238] group-hover:bg-[#FFF5F2]"
                          }`}
                        >
                          <AnimatePresence>
                            {subscribeOffers && (
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
                        <span className="text-xs text-gray-500 leading-snug">
                          მსურს მივიღო ინფორმაცია სპეციალური ფასდაკლებებისა და სიახლეების შესახებ (SMS / Email)
                        </span>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-[#FF5238] hover:bg-[#EA3A20] disabled:bg-[#FED7CC] text-white rounded-2xl text-sm md:text-base cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
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

                  {mode === "forgot" && (
                    <motion.form
                      key="forgot-animated-form"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15, ease: "easeInOut" }}
                      onSubmit={handleForgotPasswordSubmit}
                      className="space-y-4"
                    >
                      <p className="text-xs text-gray-500 leading-relaxed">
                        შეიყვანეთ თქვენს ანგარიშზე რეგისტრირებული ელფოსტა და გამოგიგზავნით ერთჯერად 6-ნიშნა კოდს.
                      </p>

                      <div className="space-y-1">
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex flex-col justify-center focus-within:ring-2 focus-within:ring-[#FF5238]/25 transition-all">
                          <label className="text-[11px] text-gray-500 block">
                            ელფოსტა
                          </label>
                          <input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => {
                              setForgotEmail(e.target.value);
                              if (errors.forgotEmail) setErrors((prev) => ({ ...prev, forgotEmail: "" }));
                            }}
                            placeholder="example@gmail.com"
                            className="bg-transparent text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none w-full mt-0.5"
                            autoFocus
                          />
                        </div>
                        {errors.forgotEmail && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.forgotEmail}</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-[#FF5238] hover:bg-[#EA3A20] disabled:bg-[#FED7CC] text-white rounded-2xl text-sm md:text-base cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>იგზავნება...</span>
                          </>
                        ) : (
                          <span>კოდის გაგზავნა</span>
                        )}
                      </button>
                    </motion.form>
                  )}

                  {mode === "reset" && (
                    <motion.form
                      key="reset-animated-form"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15, ease: "easeInOut" }}
                      onSubmit={handleResetPasswordSubmit}
                      autoComplete="off"
                      className="space-y-4"
                    >
                      <p className="text-xs text-gray-500 leading-relaxed">
                        შეიყვანეთ <span className="text-[#FF5238]">{forgotEmail}</span>-ზე მიღებული 6-ნიშნა კოდი და ახალი პაროლი.
                      </p>

                      {/* Code Field */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] text-gray-500 block">
                            6-ნიშნა აღდგენის კოდი
                          </label>
                          {resetCode.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setResetCode("")}
                              className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              გასუფთავება
                            </button>
                          )}
                        </div>

                        <OtpInput
                          length={6}
                          value={resetCode}
                          onChange={(val) => {
                            setResetCode(val);
                            if (errors.resetCode) setErrors((prev) => ({ ...prev, resetCode: "" }));
                          }}
                          hasError={Boolean(errors.resetCode)}
                          disabled={isLoading}
                        />

                        {errors.resetCode && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.resetCode}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-0.5">
                          <button
                            type="button"
                            onClick={handleForgotPasswordSubmit}
                            disabled={isLoading}
                            className="text-xs text-[#FF5238] hover:underline cursor-pointer disabled:text-gray-400 flex items-center gap-1"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>კოდის თავიდან გაგზავნა</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => switchMode("forgot")}
                            className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                          >
                            მეილის შეცვლა
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="space-y-1">
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex items-center justify-between focus-within:ring-2 focus-within:ring-[#FF5238]/25 transition-all">
                          <div className="flex-1">
                            <label className="text-[11px] text-gray-500 block">
                              ახალი პაროლი
                            </label>
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => {
                                setNewPassword(e.target.value);
                                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: "" }));
                              }}
                              placeholder="მინიმუმ 6 სიმბოლო"
                              autoComplete="new-password"
                              className="bg-transparent text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none w-full mt-0.5"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.newPassword}</span>
                          </div>
                        )}
                      </div>

                      {/* Confirm New Password */}
                      <div className="space-y-1">
                        <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex items-center justify-between focus-within:ring-2 focus-within:ring-[#FF5238]/25 transition-all">
                          <div className="flex-1">
                            <label className="text-[11px] text-gray-500 block">
                              გაიმეორეთ ახალი პაროლი
                            </label>
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={confirmNewPassword}
                              onChange={(e) => {
                                setConfirmNewPassword(e.target.value);
                                if (errors.confirmNewPassword) setErrors((prev) => ({ ...prev, confirmNewPassword: "" }));
                              }}
                              placeholder="განმეორებით შეიყვანეთ პაროლი"
                              autoComplete="new-password"
                              className="bg-transparent text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none w-full mt-0.5"
                            />
                          </div>
                        </div>
                        {errors.confirmNewPassword && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.confirmNewPassword}</span>
                          </div>
                        )}
                      </div>

                      {/* Submit Reset */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-[#FF5238] hover:bg-[#EA3A20] disabled:bg-[#FED7CC] text-white rounded-2xl text-sm md:text-base cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>მიმდინარეობს...</span>
                          </>
                        ) : (
                          <span>პაროლის განახლება</span>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

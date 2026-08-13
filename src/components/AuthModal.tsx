"use client";

import { useState, useEffect } from "react";
import { X, Check, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function AuthModal() {
  const { isAuthModalOpen, toggleAuthModal, setUser } = useStore();

  // Mode: "login" | "register"
  const [mode, setMode] = useState<"login" | "register">("login");

  // Login Method: "phone" | "email"
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");

  // Phone Verification Steps: 1 = Enter Phone, 2 = Enter SMS Code
  const [phoneStep, setPhoneStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Email Login Form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form
  const [regPhone, setRegPhone] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Inline Custom Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  // Clear errors when switching modes or methods
  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setErrors({});
  };

  const switchLoginMethod = (newMethod: "phone" | "email") => {
    setLoginMethod(newMethod);
    setPhoneStep(1);
    setErrors({});
  };

  if (!isAuthModalOpen) return null;

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!phone.trim()) {
      newErrors.phone = "გთხოვთ მიუთითოთ ტელეფონის ნომერი";
    } else if (phone.trim().length < 8) {
      newErrors.phone = "ნომერი უნდა შეიცავდეს მინიმუმ 9 ციფრს";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setPhoneStep(2);
    setTimer(60);
    setIsTimerActive(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join("");
    if (code.length < 4) {
      setErrors({ otp: "გთხოვთ შეიყვანოთ სრული 4-ნიშნა SMS კოდი" });
      return;
    }

    setErrors({});
    setUser({
      name: "მომხმარებელი",
      phone: phone,
      email: `${phone}@spilo.ge`,
    });
    toggleAuthModal(false);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
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
    setUser({
      name: loginEmail.split("@")[0],
      email: loginEmail,
      phone: "+995 599 00 00 00",
    });
    toggleAuthModal(false);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!regPhone.trim()) {
      newErrors.regPhone = "გთხოვთ მიუთითოთ ტელეფონის ნომერი ან ელფოსტა";
    }

    if (!agreeTerms) {
      newErrors.terms = "გთხოვთ დაეთანხმოთ წესებსა და პირობებს";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setUser({
      name: "ახალი მომხმარებელი",
      email: regPhone.includes("@") ? regPhone : `${regPhone}@spilo.ge`,
      phone: regPhone,
    });
    toggleAuthModal(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    if (errors.otp) setErrors({});

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-zoommer-${index + 1}`);
      nextInput?.focus();
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

          {/* Zoommer / Spilo Auth Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-[28px] max-w-[440px] w-full p-7 md:p-8 shadow-2xl relative z-10 space-y-6 overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Top-Right Circle Close Button */}
              <button
                onClick={() => toggleAuthModal(false)}
                className="absolute -top-3 -right-3 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer z-20"
                title="დახურვა"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top Mode Header Tabs ("ავტორიზაცია" / "რეგისტრაცია") with Sliding Underline */}
              <div className="border-b border-gray-200/80 relative flex items-center justify-between">
                <button
                  onClick={() => switchMode("login")}
                  className={`flex-1 pb-3 text-center text-base md:text-lg transition-colors cursor-pointer relative ${
                    mode === "login" ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
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
                  className={`flex-1 pb-3 text-center text-base md:text-lg transition-colors cursor-pointer relative ${
                    mode === "register" ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
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

              {/* Smooth Animated Form Body */}
              <div className="pt-4">
                <AnimatePresence mode="wait">
                  {mode === "login" ? (
                    <motion.div
                      key="login-animated-view"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      transition={{ duration: 0.15, ease: "easeInOut" }}
                      className="space-y-5"
                    >
                      {/* Sub-Method Animated Pills ("ნომრით ავტორიზაცია" / "მეილით ავტორიზაცია") */}
                      <div className="grid grid-cols-2 gap-2.5 relative">
                        <button
                          onClick={() => switchLoginMethod("phone")}
                          className={`py-2.5 px-2.5 rounded-full text-xs sm:text-sm text-center whitespace-nowrap transition-colors relative z-10 cursor-pointer ${
                            loginMethod === "phone" ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          <span>ნომრით ავტორიზაცია</span>
                          {loginMethod === "phone" && (
                            <motion.div
                              layoutId="activeSubPill"
                              className="absolute inset-0 bg-blue-50 border border-blue-600 rounded-full -z-10"
                              transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                            />
                          )}
                        </button>

                        <button
                          onClick={() => switchLoginMethod("email")}
                          className={`py-2.5 px-2.5 rounded-full text-xs sm:text-sm text-center whitespace-nowrap transition-colors relative z-10 cursor-pointer ${
                            loginMethod === "email" ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          <span>მეილით ავტორიზაცია</span>
                          {loginMethod === "email" && (
                            <motion.div
                              layoutId="activeSubPill"
                              className="absolute inset-0 bg-blue-50 border border-blue-600 rounded-full -z-10"
                              transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                            />
                          )}
                        </button>
                      </div>

                      {/* Smooth Crossfade for Sub-Methods (Phone vs Email) */}
                      <div className="pt-2">
                        <AnimatePresence mode="wait">
                          {loginMethod === "phone" ? (
                            <motion.div
                              key="phone-method-view"
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 6 }}
                              transition={{ duration: 0.15, ease: "easeInOut" }}
                            >
                              {phoneStep === 1 ? (
                                <form onSubmit={handleSendSms} className="space-y-4">
                                  <div className="space-y-1">
                                    <div className="flex items-stretch gap-3 h-14">
                                      <div className="bg-[#F1F3F6] rounded-2xl px-4 flex items-center justify-center gap-2 text-xs md:text-sm text-gray-800 shrink-0 h-full">
                                        <span className="text-base">🇬🇪</span>
                                        <span>+995</span>
                                      </div>

                                      <div className="flex-1 bg-[#F1F3F6] rounded-2xl px-4 flex flex-col justify-center h-full">
                                        <input
                                          type="tel"
                                          value={phone}
                                          onChange={(e) => {
                                            setPhone(e.target.value);
                                            if (errors.phone) setErrors({});
                                          }}
                                          placeholder="ტელეფონის ნომერი"
                                          className="bg-transparent text-xs md:text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none w-full"
                                          autoFocus
                                        />
                                      </div>
                                    </div>

                                    {/* Inline Custom Error Text */}
                                    {errors.phone && (
                                      <div className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5 animate-in fade-in">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{errors.phone}</span>
                                      </div>
                                    )}
                                  </div>

                                  <button
                                    type="submit"
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm md:text-base cursor-pointer transition-colors shadow-xs"
                                  >
                                    კოდის გაგზავნა
                                  </button>
                                </form>
                              ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                  <div className="text-center space-y-1">
                                    <p className="text-xs md:text-sm text-gray-600">
                                      შეიყვანეთ SMS კოდი ნომერზე: <span className="text-gray-900">+995 {phone}</span>
                                    </p>
                                  </div>

                                  {/* 4 OTP Digit Boxes */}
                                  <div className="space-y-1">
                                    <div className="flex justify-center gap-3">
                                      {otpCode.map((digit, idx) => (
                                        <input
                                          key={idx}
                                          id={`otp-zoommer-${idx}`}
                                          type="text"
                                          maxLength={1}
                                          value={digit}
                                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                                          className="w-12 h-12 text-center text-lg bg-[#F1F3F6] rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                        />
                                      ))}
                                    </div>

                                    {errors.otp && (
                                      <div className="flex items-center justify-center gap-1.5 text-xs text-red-500 pt-1">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{errors.otp}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>
                                      {isTimerActive ? `ხელახლა გაგზავნა: 00:${timer < 10 ? `0${timer}` : timer}` : "კოდი არ მოგივიდათ?"}
                                    </span>
                                    {!isTimerActive && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setTimer(60);
                                          setIsTimerActive(true);
                                        }}
                                        className="text-blue-600 hover:underline cursor-pointer"
                                      >
                                        თავიდან გაგზავნა
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex gap-2.5">
                                    <button
                                      type="button"
                                      onClick={() => setPhoneStep(1)}
                                      className="px-4 py-3.5 bg-[#F1F3F6] hover:bg-gray-200 text-gray-700 rounded-2xl text-xs cursor-pointer transition-colors"
                                    >
                                      უკან
                                    </button>
                                    <button
                                      type="submit"
                                      className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm md:text-base cursor-pointer transition-colors shadow-xs"
                                    >
                                      ავტორიზაცია
                                    </button>
                                  </div>
                                </form>
                              )}
                            </motion.div>
                          ) : (
                            <motion.form
                              key="email-method-view"
                              initial={{ opacity: 0, x: 6 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -6 }}
                              transition={{ duration: 0.15, ease: "easeInOut" }}
                              onSubmit={handleEmailLogin}
                              className="space-y-3.5"
                            >
                              {/* Email Input */}
                              <div className="space-y-1">
                                <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex flex-col justify-center">
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

                              {/* Password Input */}
                              <div className="space-y-1">
                                <div className="bg-[#F1F3F6] rounded-2xl px-4 py-2.5 flex items-center justify-between">
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

                              <div className="text-right">
                                <button
                                  type="button"
                                  onClick={() => alert("პაროლის აღდგენის ინსტრუქცია გაიგზავნება ელ-ფოსტაზე")}
                                  className="text-xs text-gray-900 hover:underline cursor-pointer"
                                >
                                  დაგავიწყდა პაროლი?
                                </button>
                              </div>

                              <button
                                type="submit"
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm md:text-base cursor-pointer transition-colors shadow-xs"
                              >
                                შესვლა
                              </button>
                            </motion.form>
                          )}
                        </AnimatePresence>
                      </div>

                    </motion.div>
                  ) : (
                    <motion.form
                      key="register-animated-view"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                      onSubmit={handleRegister}
                      className="space-y-4 pt-1"
                    >
                      {/* Register Phone/Email Input */}
                      <div className="space-y-1">
                        <div className="flex items-stretch gap-3 h-14">
                          <div className="bg-[#F1F3F6] rounded-2xl px-4 flex items-center justify-center gap-2 text-xs md:text-sm text-gray-800 shrink-0 h-full">
                            <span className="text-base">🇬🇪</span>
                            <span>+995</span>
                          </div>

                          <div className="flex-1 bg-[#F1F3F6] rounded-2xl px-4 flex flex-col justify-center h-full">
                            <label className="text-[11px] text-gray-500 block">
                              ტელეფონის ნომერი
                            </label>
                            <input
                              type="text"
                              value={regPhone}
                              onChange={(e) => {
                                setRegPhone(e.target.value);
                                if (errors.regPhone) setErrors((prev) => ({ ...prev, regPhone: "" }));
                              }}
                              placeholder="mail@gmail.com ან ნომერი"
                              className="bg-transparent text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none w-full mt-0.5"
                              autoFocus
                            />
                          </div>
                        </div>
                        {errors.regPhone && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.regPhone}</span>
                          </div>
                        )}
                      </div>

                      {/* Terms Checkbox */}
                      <div className="space-y-1">
                        <div
                          onClick={() => {
                            setAgreeTerms(!agreeTerms);
                            if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
                          }}
                          className="flex items-start gap-2.5 pt-1 cursor-pointer select-none"
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                              agreeTerms
                                ? "bg-blue-600 text-white"
                                : errors.terms
                                ? "bg-white border-2 border-red-500"
                                : "bg-white border-2 border-gray-300"
                            }`}
                          >
                            {agreeTerms && <Check className="w-3.5 h-3.5" />}
                          </div>
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

                      <button
                        type="submit"
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm md:text-base cursor-pointer transition-colors shadow-xs mt-2"
                      >
                        რეგისტრაცია
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Separator & Social Auth Section */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <p className="text-center text-xs text-gray-900">
                ან გაიარე ავტორიზაცია სხვა მეთოდით
              </p>

              <button
                onClick={() => {
                  setUser({
                    name: "Google მომხმარებელი",
                    email: "user@gmail.com",
                    phone: "+995 599 00 00 00",
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

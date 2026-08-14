"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAdminSession, addToast } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("გთხოვთ მიუთითოთ ადმინისტრატორის ელ-ფოსტა");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("გთხოვთ მიუთითოთ პაროლი");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "არასწორი ელ-ფოსტა ან პაროლი");
        setIsLoading(false);
        return;
      }

      setAdminSession(data.admin, data.token);

      addToast({
        title: "ავტორიზაცია წარმატებულია",
        message: `მოგესალმებით, ${data.admin.name}!`,
        type: "success",
      });

      router.push("/admin");
    } catch (err: any) {
      setErrorMsg("ავტორიზაციის შეცდომა. გთხოვთ სცადოთ მოგვიანებით.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl text-white tracking-tight pt-2">
            Spilo.ge Admin Portal
          </h1>
          <p className="text-xs text-slate-400">
            შეიყვანეთ ადმინისტრატორის მონაცემები სისტემაში შესასვლელად
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 text-xs text-red-400 text-center animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium block">
              ელ-ფოსტა / Username
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin ან admin@spilo.ge"
                className="w-full h-11 bg-slate-800/80 border border-slate-700 focus:border-blue-500 text-white rounded-xl pl-10 pr-4 text-xs md:text-sm placeholder-slate-500 outline-none transition-colors"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium block">
              პაროლი
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 bg-slate-800/80 border border-slate-700 focus:border-blue-500 text-white rounded-xl pl-10 pr-10 text-xs md:text-sm placeholder-slate-500 outline-none transition-colors"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-xs md:text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors pt-1"
          >
            {isLoading ? (
              <span>მოწმდება...</span>
            ) : (
              <>
                <span>ადმინპანელში შესვლა</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Tip */}
        <div className="pt-2 text-center border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500">
            საჩვენებელი მონაცემები: <code className="text-blue-400 bg-slate-800 px-1.5 py-0.5 rounded">admin@spilo.ge</code> / <code className="text-blue-400 bg-slate-800 px-1.5 py-0.5 rounded">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}

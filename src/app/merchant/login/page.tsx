"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Store } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function MerchantLoginPage() {
  const router = useRouter();
  const { setAdminSession, addToast } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "შესვლა ვერ მოხერხდა");
        return;
      }
      setAdminSession(json.merchant);
      addToast({ title: "შესვლა", message: `მოგესალმებით, ${json.merchant.name}`, type: "success" });
      router.push("/merchant");
    } catch {
      setError("ავტორიზაციის შეცდომა");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-3xl p-8 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF5F2] text-[#FF5238] mx-auto flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl text-gray-900">პარტნიორის დაფა</h1>
          <p className="text-sm text-gray-500">შედით თქვენი მაღაზიის ანგარიშით</p>
        </div>
        {error && <p className="text-sm text-[#FF5238] bg-[#FFF5F2] rounded-xl p-3">{error}</p>}
        <label className="block space-y-1.5">
          <span className="text-xs text-gray-600">ელფოსტა</span>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-10 pr-3 bg-[#F4F5F7] rounded-xl text-sm outline-none"
            />
          </div>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs text-gray-600">პაროლი</span>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-10 pr-10 bg-[#F4F5F7] rounded-xl text-sm outline-none"
            />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-xl text-sm disabled:opacity-60"
        >
          {loading ? "მოწმდება..." : "შესვლა"}
        </button>
      </form>
    </div>
  );
}

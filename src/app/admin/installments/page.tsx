"use client";

import React, { useState, useEffect } from "react";
import { 
  Banknote, 
  Check, 
  ShieldCheck, 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RefreshCw, 
  Loader2, 
  Sparkles,
  Percent,
  Calendar,
  Layers,
  X
} from "lucide-react";
import { useStore } from "@/store/useStore";

interface InstallmentBank {
  id: string;
  name: string;
  bankName: string;
  bankCode?: string;
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  availableMonths: number[];
  merchantCode: string;
}

export default function AdminInstallmentsPage() {
  const [banks, setBanks] = useState<InstallmentBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { addToast } = useStore();

  // Modal State for Adding/Editing a Bank
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<InstallmentBank | null>(null);
  const [formBankName, setFormBankName] = useState("");
  const [formName, setFormName] = useState("");
  const [formBankCode, setFormBankCode] = useState("");
  const [formMerchantCode, setFormMerchantCode] = useState("");
  const [formMinAmount, setFormMinAmount] = useState(50);
  const [formMaxAmount, setFormMaxAmount] = useState(15000);
  const [formInterestRate, setFormInterestRate] = useState(0);
  const [formMonths, setFormMonths] = useState("3, 6, 12, 18, 24");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/installments");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Map SQL records to UI model
        const mapped: InstallmentBank[] = data.data.map((item: any) => ({
          id: item.id,
          name: item.name || item.bankName,
          bankName: item.bankName,
          bankCode: item.bankCode,
          enabled: item.isActive !== undefined ? Boolean(item.isActive) : true,
          minAmount: Number(item.minAmount || 50),
          maxAmount: Number(item.maxAmount || 15000),
          interestRate: Number(item.ratePercent || 0),
          availableMonths: Array.isArray(item.availableMonths)
            ? item.availableMonths
            : [3, 6, 12, 18, 24],
          merchantCode: item.merchantCode || item.bankCode || "",
        }));
        setBanks(mapped);
      }
    } catch (err) {
      console.error("Error loading installment settings:", err);
      addToast({
        title: "შეცდომა",
        message: "განვადების პარამეტრების წამოღება ვერ მოხერხდა",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleToggle = (id: string) => {
    setBanks(banks.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)));
  };

  const handleOpenAdd = () => {
    setEditingBank(null);
    setFormBankName("");
    setFormName("");
    setFormBankCode("");
    setFormMerchantCode("");
    setFormMinAmount(50);
    setFormMaxAmount(15000);
    setFormInterestRate(0);
    setFormMonths("3, 6, 12, 18, 24");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bank: InstallmentBank) => {
    setEditingBank(bank);
    setFormBankName(bank.bankName);
    setFormName(bank.name);
    setFormBankCode(bank.bankCode || "");
    setFormMerchantCode(bank.merchantCode || "");
    setFormMinAmount(bank.minAmount);
    setFormMaxAmount(bank.maxAmount);
    setFormInterestRate(bank.interestRate);
    setFormMonths(bank.availableMonths.join(", "));
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBankName.trim()) return;

    setIsSubmitting(true);
    const monthsArray = formMonths
      .split(",")
      .map((m) => parseInt(m.trim(), 10))
      .filter((m) => !isNaN(m) && m > 0);

    try {
      const res = await fetch("/api/admin/installments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingBank ? editingBank.id : undefined,
          bankName: formBankName,
          name: formName || formBankName,
          bankCode: formBankCode || formMerchantCode || `BANK_${Date.now().toString().slice(-4)}`,
          merchantCode: formMerchantCode,
          minAmount: formMinAmount,
          maxAmount: formMaxAmount,
          ratePercent: formInterestRate,
          availableMonths: monthsArray.length > 0 ? monthsArray : [3, 6, 12],
          isActive: editingBank ? editingBank.enabled : true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast({
          title: editingBank ? "ბანკი განახლდა" : "ბანკი დაემატა",
          message: `${formBankName} წარმატებით შეინახა მონაცემთა ბაზაში`,
          type: "success",
        });
        setIsModalOpen(false);
        fetchBanks();
      } else {
        addToast({
          title: "შეცდომა",
          message: data.message || "შენახვა ვერ მოხერხდა",
          type: "error",
        });
      }
    } catch (err: any) {
      addToast({
        title: "შეცდომა",
        message: err.message || "სერვერთან კავშირის შეცდომა",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBank = async (id: string, name: string) => {
    if (!confirm(`ნამდვილად გსურთ "${name}"-ის წაშლა?`)) return;

    try {
      const res = await fetch(`/api/admin/installments?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        addToast({
          title: "წაიშალა",
          message: `ბანკი "${name}" წარმატებით წაიშალა`,
          type: "success",
        });
        setBanks((prev) => prev.filter((b) => b.id !== id));
      }
    } catch {
      addToast({
        title: "შეცდომა",
        message: "წაშლა ვერ მოხერხდა",
        type: "error",
      });
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/installments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          banks: banks.map((b) => ({
            id: b.id,
            bankName: b.bankName,
            name: b.name,
            merchantCode: b.merchantCode,
            minAmount: b.minAmount,
            maxAmount: b.maxAmount,
            ratePercent: b.interestRate,
            isActive: b.enabled,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        addToast({
          title: "პარამეტრები შენახულია",
          message: "ყველა ბანკის განვადების პარამეტრები წარმატებით შეინახა MySQL-ში",
          type: "success",
        });
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      addToast({
        title: "შეცდომა",
        message: "პარამეტრების შენახვა ვერ მოხერხდა",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            <Banknote className="w-3.5 h-3.5" />
            <span>ფინანსები & განვადებები</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
            ბანკის განვადებები ({banks.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            თიბისი, საქართველოს ბანკის, კრედოსა და Space-ის ონლაინ განვადებების პარამეტრები.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchBanks}
            disabled={loading}
            className="h-11 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>განახლება</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-11 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ახალი ბანკი</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saved ? "შენახულია SQL-ში!" : "ცვლილებების შენახვა"}</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <span>იტვირთება განვადების პარამეტრები MySQL ბაზიდან...</span>
        </div>
      ) : banks.length === 0 ? (
        <div className="py-20 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200/80 space-y-3">
          <Banknote className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-600">განვადების პარტნიორი ბანკები ვერ მოიძებნა</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs"
          >
            ბანკის დამატება
          </button>
        </div>
      ) : (
        /* Bank Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {banks.map((bank) => (
            <div 
              key={bank.id} 
              className={`bg-white rounded-3xl p-6 border transition-all space-y-4 ${
                bank.enabled ? "border-slate-200/80 shadow-xs" : "border-slate-200/50 bg-slate-50/50 opacity-75"
              }`}
            >
              
              {/* Card Top Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm text-slate-900">{bank.name}</h3>
                    <p className="text-xs text-slate-400">{bank.bankName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(bank)}
                    className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-slate-50 transition-colors"
                    title="რედაქტირება"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBank(bank.id, bank.name)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-50 transition-colors"
                    title="წაშლა"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <label className="relative inline-flex items-center cursor-pointer ml-1">
                    <input
                      type="checkbox"
                      checked={bank.enabled}
                      onChange={() => handleToggle(bank.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {/* Status and Available Months */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-mono">
                  {bank.interestRate}% ეფექტური
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  ვადები: {bank.availableMonths.join(", ")} თვე
                </span>
              </div>

              {/* Min / Max Amount Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 block">მინ. თანხა (₾)</label>
                  <input
                    type="number"
                    value={bank.minAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBanks(banks.map((x) => (x.id === bank.id ? { ...x, minAmount: val } : x)));
                    }}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 block">მაქს. თანხა (₾)</label>
                  <input
                    type="number"
                    value={bank.maxAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBanks(banks.map((x) => (x.id === bank.id ? { ...x, maxAmount: val } : x)));
                    }}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              {/* Merchant / Partner Code */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 block">ბანკის Merchant / Partner Code</label>
                <input
                  type="text"
                  value={bank.merchantCode}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBanks(banks.map((x) => (x.id === bank.id ? { ...x, merchantCode: val } : x)));
                  }}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                  placeholder="e.g. TBC_INST_9921"
                />
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Bank Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-slate-100 shadow-2xl z-10 space-y-6 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg text-slate-900">
                  {editingBank ? "ბანკის რედაქტირება" : "ახალი ბანკის დამატება"}
                </h3>
                <p className="text-xs text-slate-400">განვადების პროვაიდერის კონფიგურაცია</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-600 block">ბანკის ოფიციალური სახელი</label>
                <input
                  type="text"
                  value={formBankName}
                  onChange={(e) => setFormBankName(e.target.value)}
                  placeholder="მაგ: თიბისი ბანკი"
                  required
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block">ჩვენების სათაური (Storefront Title)</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="მაგ: TBC 0% ონლაინ განვადება"
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 block">Bank Identifier Code</label>
                  <input
                    type="text"
                    value={formBankCode}
                    onChange={(e) => setFormBankCode(e.target.value)}
                    placeholder="მაგ: TBC_ONLINE"
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 block">Merchant Code</label>
                  <input
                    type="text"
                    value={formMerchantCode}
                    onChange={(e) => setFormMerchantCode(e.target.value)}
                    placeholder="მაგ: TBC_INST_9921"
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 block">მინ. თანხა (₾)</label>
                  <input
                    type="number"
                    value={formMinAmount}
                    onChange={(e) => setFormMinAmount(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 block">მაქს. თანხა (₾)</label>
                  <input
                    type="number"
                    value={formMaxAmount}
                    onChange={(e) => setFormMaxAmount(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 block">საპროცენტო %</label>
                  <input
                    type="number"
                    value={formInterestRate}
                    onChange={(e) => setFormInterestRate(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block">ხელმისაწვდომი ვადები (თვეებში, მძიმით გამოყოფილი)</label>
                <input
                  type="text"
                  value={formMonths}
                  onChange={(e) => setFormMonths(e.target.value)}
                  placeholder="3, 6, 12, 18, 24, 36"
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingBank ? "განახლება" : "დამატება"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

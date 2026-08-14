"use client";

import React, { useState } from "react";
import { Banknote, Check, ShieldCheck, Building2, Percent, Clock } from "lucide-react";

interface InstallmentBank {
  id: string;
  name: string;
  bankName: string;
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  interestRate: number; // 0% 
  availableMonths: number[];
  merchantCode: string;
}

export default function AdminInstallmentsPage() {
  const [banks, setBanks] = useState<InstallmentBank[]>([
    {
      id: "tbc",
      name: "TBC 0% ონლაინ განვადება",
      bankName: "თიბისი ბანკი",
      enabled: true,
      minAmount: 100,
      maxAmount: 15000,
      interestRate: 0,
      availableMonths: [3, 6, 12, 18, 24, 36],
      merchantCode: "TBC_INST_9921",
    },
    {
      id: "bog",
      name: "საქართველოს ბანკის 0% განვადება",
      bankName: "საქართველოს ბანკი (BOG)",
      enabled: true,
      minAmount: 100,
      maxAmount: 15000,
      interestRate: 0,
      availableMonths: [3, 6, 12, 18, 24],
      merchantCode: "BOG_INST_4402",
    },
    {
      id: "credo",
      name: "Credo ონლაინ განვადება",
      bankName: "კრედო ბანკი",
      enabled: true,
      minAmount: 50,
      maxAmount: 10000,
      interestRate: 0,
      availableMonths: [3, 6, 12, 18],
      merchantCode: "CREDO_INST_1109",
    },
    {
      id: "space",
      name: "Space & Re|Bank (ტოპ|ქარდი)",
      bankName: "Space Bank",
      enabled: true,
      minAmount: 50,
      maxAmount: 8000,
      interestRate: 0,
      availableMonths: [3, 6, 12],
      merchantCode: "SPACE_TOP_CARD_882",
    },
  ]);

  const [saved, setSaved] = useState(false);

  const handleToggle = (id: string) => {
    setBanks(banks.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}>
            <Banknote size={13} /> ოპერაციები & განვადებები
          </div>
          <h1 className="adm-page-title">ბანკის განვადებები (Installments)</h1>
          <p className="adm-page-desc">თიბისი, საქართველოს ბანკის, კრედოსა და Space-ის განვადებების ვადები და ლიმიტები.</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className={saved ? "adm-btn-secondary" : "adm-btn-primary"}
        >
          {saved ? <><Check size={14} /> შენახულია!</> : <><Check size={14} /> პარამეტრების შენახვა</>}
        </button>
      </div>

      {/* Bank Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
        {banks.map((bank) => (
          <div key={bank.id} className="adm-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "0.85rem", color: "#0f172a" }}>{bank.name}</h3>
                  <p style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{bank.bankName}</p>
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={bank.enabled}
                  onChange={() => handleToggle(bank.id)}
                  style={{ width: "1.1rem", height: "1.1rem", accentColor: "#6366f1" }}
                />
              </label>
            </div>

            {/* Interest Rate & Months Badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "#f8fafc", borderRadius: "0.625rem", border: "1px solid #f1f5f9" }}>
              <span className="adm-badge adm-badge-green">0% ეფექტური</span>
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                ვადები: {bank.availableMonths.join(", ")} თვე
              </span>
            </div>

            {/* Min / Max Inputs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
              <div>
                <label className="adm-label" style={{ fontSize: "0.65rem" }}>მინ. თანხა (₾)</label>
                <input
                  type="number"
                  value={bank.minAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBanks(banks.map(x => x.id === bank.id ? { ...x, minAmount: val } : x));
                  }}
                  className="adm-input"
                  style={{ height: "2.25rem" }}
                />
              </div>
              <div>
                <label className="adm-label" style={{ fontSize: "0.65rem" }}>მაქს. თანხა (₾)</label>
                <input
                  type="number"
                  value={bank.maxAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBanks(banks.map(x => x.id === bank.id ? { ...x, maxAmount: val } : x));
                  }}
                  className="adm-input"
                  style={{ height: "2.25rem" }}
                />
              </div>
            </div>

            {/* Merchant Code */}
            <div>
              <label className="adm-label" style={{ fontSize: "0.65rem" }}>ბანკის Merchant / Partner Code</label>
              <input
                type="text"
                value={bank.merchantCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setBanks(banks.map(x => x.id === bank.id ? { ...x, merchantCode: val } : x));
                }}
                className="adm-input"
                style={{ fontSize: "0.72rem", fontFamily: "monospace", height: "2.25rem" }}
              />
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

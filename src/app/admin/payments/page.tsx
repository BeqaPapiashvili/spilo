"use client";

import React, { useState } from "react";
import { CreditCard, Check, ShieldCheck, Zap, Lock, Key, Server, Settings2 } from "lucide-react";

interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  logo: string;
  enabled: boolean;
  testMode: boolean;
  merchantId: string;
  secretKey: string;
  commission: number;
}

export default function AdminPaymentsPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([
    {
      id: "bog-ipay",
      name: "Bank of Georgia (iPay)",
      provider: "საქართველოს ბანკი",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Bank_of_Georgia_logo.svg",
      enabled: true,
      testMode: true,
      merchantId: "BOG_CLIENT_884920",
      secretKey: "sk_test_bog_9948271049281729",
      commission: 1.5,
    },
    {
      id: "tbc-checkout",
      name: "TBC Checkout",
      provider: "თიბისი ბანკი",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/TBC_Bank_logo.svg",
      enabled: true,
      testMode: true,
      merchantId: "TBC_MERCHANT_440192",
      secretKey: "sk_test_tbc_8819204918274019",
      commission: 1.5,
    },
    {
      id: "payze",
      name: "Payze Payments (Cards + Apple Pay)",
      provider: "Payze Gateway",
      logo: "https://payze.io/wp-content/uploads/2021/04/payze-logo.svg",
      enabled: true,
      testMode: true,
      merchantId: "PAYZE_API_KEY_1104",
      secretKey: "sk_test_payze_44910284729104",
      commission: 1.8,
    },
    {
      id: "cod",
      name: "ნაღდი ანგარიშსწორება კურიერთან (Cash on Delivery)",
      provider: "Spilo Logistics",
      logo: "",
      enabled: true,
      testMode: false,
      merchantId: "SPILO_COD_INTERNAL",
      secretKey: "none",
      commission: 0,
    },
  ]);

  const [saved, setSaved] = useState(false);

  const handleToggle = (id: string) => {
    setGateways(gateways.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)));
  };

  const handleToggleTest = (id: string) => {
    setGateways(gateways.map((g) => (g.id === id ? { ...g, testMode: !g.testMode } : g)));
  };

  const handleSaveAll = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}>
            <CreditCard size={13} /> ოპერაციები & ფინანსები
          </div>
          <h1 className="adm-page-title">გადახდის სისტემების კონფიგურაცია</h1>
          <p className="adm-page-desc">საბანკო შლიუზების (TBC, BOG, Payze), API გასაღებებისა და ტესტ რეჟიმების მართვა.</p>
        </div>
        <button
          type="button"
          onClick={handleSaveAll}
          className={saved ? "adm-btn-secondary" : "adm-btn-primary"}
        >
          {saved ? <><Check size={14} /> შენახულია!</> : <><Check size={14} /> პარამეტრების შენახვა</>}
        </button>
      </div>

      {/* Gateway Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
        {gateways.map((gw) => (
          <div key={gw.id} className="adm-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* Header / Toggle */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "0.85rem", color: "#0f172a" }}>{gw.name}</h3>
                  <p style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{gw.provider}</p>
                </div>
              </div>

              {/* Status toggle */}
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={gw.enabled}
                  onChange={() => handleToggle(gw.id)}
                  style={{ width: "1.1rem", height: "1.1rem", accentColor: "#6366f1" }}
                />
              </label>
            </div>

            {/* Test vs Live Mode badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "#f8fafc", borderRadius: "0.625rem", border: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>გარემო:</span>
              <button
                type="button"
                onClick={() => handleToggleTest(gw.id)}
                className={gw.testMode ? "adm-badge adm-badge-amber" : "adm-badge adm-badge-green"}
                style={{ cursor: "pointer", border: "none" }}
              >
                {gw.testMode ? "Sandbox (ტესტი)" : "Production (ცოცხალი)"}
              </button>
            </div>

            {/* API Config Inputs */}
            {gw.id !== "cod" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <div>
                  <label className="adm-label" style={{ fontSize: "0.65rem" }}>Merchant / Client ID</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      value={gw.merchantId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGateways(gateways.map(x => x.id === gw.id ? { ...x, merchantId: val } : x));
                      }}
                      className="adm-input"
                      style={{ fontSize: "0.72rem", fontFamily: "monospace", height: "2.25rem" }}
                    />
                    <Key size={12} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  </div>
                </div>

                <div>
                  <label className="adm-label" style={{ fontSize: "0.65rem" }}>Secret Key</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="password"
                      value={gw.secretKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGateways(gateways.map(x => x.id === gw.id ? { ...x, secretKey: val } : x));
                      }}
                      className="adm-input"
                      style={{ fontSize: "0.72rem", fontFamily: "monospace", height: "2.25rem" }}
                    />
                    <Lock size={12} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.72rem", color: "#64748b" }}>
                  <span>ტრანზაქციის საკომისიო:</span>
                  <span style={{ color: "#0f172a" }}>{gw.commission}%</span>
                </div>
              </div>
            )}

            {gw.id === "cod" && (
              <div style={{ padding: "0.75rem", background: "#f0fdf4", borderRadius: "0.75rem", border: "1px solid #bbf7d0", fontSize: "0.72rem", color: "#166534" }}>
                ✓ მომხმარებელს შეუძლია გადაიხადოს ნაღდი ფულით ან POS ტერმინალით შეკვეთის ჩაბარებისას.
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}

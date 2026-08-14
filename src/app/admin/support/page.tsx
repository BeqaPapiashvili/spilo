"use client";

import React, { useState, useEffect } from "react";
import { Headphones, Send, MessageSquare, Clock } from "lucide-react";
import { dataService, SupportTicket } from "@/services/dataService";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    setTickets(dataService.getSupportTickets());
    const unsub = dataService.subscribe(() => setTickets(dataService.getSupportTickets()));
    return () => unsub();
  }, []);

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketId || !replyText.trim()) return;
    dataService.addSupportReply(activeTicketId, replyText.trim());
    setReplyText("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem" }}>
        <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}><Headphones size={13} /> ოპერაციები</div>
        <h1 className="adm-page-title">მხარდაჭერის ჩათი (Live Support)</h1>
        <p className="adm-page-desc">მომხმარებელთა შეკითხვები, პრობლემები და პასუხების გაგზავნა.</p>
      </div>

      {/* Main Support Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.25rem", alignItems: "start" }}>

        {/* Ticket List */}
        <div className="adm-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: "0.8rem", color: "#0f172a" }}>ბილეთები ({tickets.length})</h3>
          </div>
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {tickets.map(t => (
              <button key={t.id} onClick={() => setActiveTicketId(t.id)}
                style={{
                  width: "100%", padding: "1rem 1.25rem", textAlign: "left",
                  borderBottom: "1px solid #f8fafc", cursor: "pointer",
                  background: activeTicketId === t.id ? "#f5f3ff" : "transparent",
                  borderLeft: activeTicketId === t.id ? "3px solid #6366f1" : "3px solid transparent",
                  transition: "all 0.15s", border: "none",
                  display: "flex", flexDirection: "column", gap: "0.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.78rem", color: "#0f172a" }}>{t.customerName}</span>
                  <span className={t.status === "OPEN" ? "adm-badge adm-badge-amber" : t.status === "RESOLVED" ? "adm-badge adm-badge-green" : "adm-badge adm-badge-blue"} style={{ fontSize: "0.55rem" }}>
                    {t.status}
                  </span>
                </div>
                <p style={{ fontSize: "0.7rem", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.topic}</p>
                <span style={{ fontSize: "0.65rem", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}>
                  <Clock size={10} /> {t.time}
                </span>
              </button>
            ))}
            {tickets.length === 0 && (
              <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "0.75rem" }}>ბილეთები არ არის</div>
            )}
          </div>
        </div>

        {/* Chat View */}
        {activeTicket ? (
          <div className="adm-card" style={{ display: "flex", flexDirection: "column", height: "70vh" }}>
            {/* Ticket Header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: "0.875rem", color: "#0f172a" }}>{activeTicket.topic}</h3>
                <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>კლიენტი: {activeTicket.customerName} · {activeTicket.customerEmail}</p>
              </div>
              <span className={activeTicket.status === "OPEN" ? "adm-badge adm-badge-amber" : activeTicket.status === "RESOLVED" ? "adm-badge adm-badge-green" : "adm-badge adm-badge-blue"}>
                {activeTicket.status}
              </span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {activeTicket.messages.map((msg, idx) => {
                const isAdmin = msg.sender === "admin";
                return (
                  <div key={idx} style={{ display: "flex", justifyContent: isAdmin ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "75%", padding: "0.75rem 1rem", borderRadius: isAdmin ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                      background: isAdmin ? "linear-gradient(135deg, #4f46e5, #6366f1)" : "#f8fafc",
                      border: isAdmin ? "none" : "1px solid #f1f5f9",
                      color: isAdmin ? "#fff" : "#0f172a",
                      fontSize: "0.8rem", lineHeight: 1.5,
                    }}>
                      <p>{msg.text}</p>
                      <span style={{ fontSize: "0.6rem", opacity: 0.7, display: "block", marginTop: "4px", textAlign: isAdmin ? "right" : "left" }}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input */}
            <form onSubmit={handleSendReply} style={{ padding: "1rem 1.25rem", borderTop: "1px solid #f1f5f9", display: "flex", gap: "0.625rem" }}>
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="პასუხის გაგზავნა..."
                className="adm-input"
                style={{ flex: 1 }}
              />
              <button type="submit" className="adm-btn-primary" style={{ flexShrink: 0 }}>
                <Send size={15} /> გაგზავნა
              </button>
            </form>
          </div>
        ) : (
          <div className="adm-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", gap: "0.75rem" }}>
            <MessageSquare size={36} style={{ color: "#e2e8f0" }} />
            <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>ბილეთი ასარჩევია</p>
            <p style={{ fontSize: "0.72rem", color: "#cbd5e1" }}>მარცხნიდან ბილეთი ასარჩევია პასუხის გასაგზავნად</p>
          </div>
        )}
      </div>
    </div>
  );
}

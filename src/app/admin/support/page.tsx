"use client";

import React, { useState, useEffect, useRef } from "react";
import { Headphones, Send, MessageSquare, Clock, CheckCircle2, XCircle, Trash2, Check, RefreshCw, X } from "lucide-react";
import { dataService, SupportTicket } from "@/services/dataService";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTickets(dataService.getSupportTickets());
    const unsub = dataService.subscribe(() => {
      setTickets(dataService.getSupportTickets());
    });
    return () => unsub();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tickets, activeTicketId]);

  const filteredTickets = tickets.filter((t) => {
    if (selectedFilter === "OPEN") return t.status === "OPEN";
    if (selectedFilter === "RESOLVED") return t.status === "RESOLVED" || t.status === "CLOSED";
    return true;
  });

  const activeTicket = tickets.find((t) => t.id === activeTicketId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketId || !replyText.trim()) return;

    dataService.addSupportReply(activeTicketId, replyText.trim());
    setReplyText("");
  };

  const handleCloseTicket = (ticketId: string) => {
    dataService.updateSupportTicketStatus(ticketId, "RESOLVED");
    if (selectedFilter === "OPEN") {
      const remainingOpen = tickets.filter(t => t.id !== ticketId && t.status === "OPEN");
      setActiveTicketId(remainingOpen[0]?.id || null);
    }
  };

  const handleReopenTicket = (ticketId: string) => {
    dataService.updateSupportTicketStatus(ticketId, "OPEN");
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (confirm("დარწმუნებული ხართ, რომ გსურთ ამ ჩათის წაშლა?")) {
      dataService.deleteSupportTicket(ticketId);
      if (activeTicketId === ticketId) {
        const remaining = tickets.filter(t => t.id !== ticketId);
        setActiveTicketId(remaining[0]?.id || null);
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}>
            <Headphones size={13} /> რეალურ დროში მხარდაჭერა
          </div>
          <h1 className="adm-page-title">მხარდაჭერის ჩათი (Live Support Desk)</h1>
          <p className="adm-page-desc">მომხმარებელთა შეკითხვები, პირდაპირი ჩატი (რეფრეშის გარეშე) და ჩათების დახურვა.</p>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: "flex", gap: "0.375rem" }}>
          <button
            type="button"
            onClick={() => setSelectedFilter("ALL")}
            className={selectedFilter === "ALL" ? "adm-btn-primary" : "adm-btn-secondary"}
            style={{ fontSize: "0.72rem", padding: "0.4rem 0.875rem" }}
          >
            ყველა ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter("OPEN")}
            className={selectedFilter === "OPEN" ? "adm-btn-primary" : "adm-btn-secondary"}
            style={{ fontSize: "0.72rem", padding: "0.4rem 0.875rem" }}
          >
            ღია ({tickets.filter(t => t.status === "OPEN").length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter("RESOLVED")}
            className={selectedFilter === "RESOLVED" ? "adm-btn-primary" : "adm-btn-secondary"}
            style={{ fontSize: "0.72rem", padding: "0.4rem 0.875rem" }}
          >
            დასრულებული ({tickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED").length})
          </button>
        </div>
      </div>

      {/* Main Support Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.25rem", alignItems: "start" }}>

        {/* Ticket List */}
        <div className="adm-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "0.8rem", color: "#0f172a" }}>დიალოგები ({filteredTickets.length})</h3>
            <span style={{ fontSize: "0.65rem", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} /> Live Sync
            </span>
          </div>
          
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {filteredTickets.map((t) => {
              const isSelected = activeTicketId === t.id;
              const isClosed = t.status === "RESOLVED" || t.status === "CLOSED";

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTicketId(t.id)}
                  style={{
                    width: "100%",
                    padding: "1rem 1.25rem",
                    textAlign: "left",
                    background: isSelected ? "#f5f3ff" : "transparent",
                    borderTop: "none",
                    borderRight: "none",
                    borderBottom: "1px solid #f8fafc",
                    borderLeft: isSelected ? "3px solid #6366f1" : "3px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: "0.375rem", background: isClosed ? "#f1f5f9" : "#eef2ff", color: isClosed ? "#64748b" : "#6366f1", fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {t.customerName.slice(0, 2)}
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "#0f172a" }}>{t.customerName}</span>
                    </div>
                    <span
                      className={
                        t.status === "OPEN"
                          ? "adm-badge adm-badge-amber"
                          : t.status === "RESOLVED"
                          ? "adm-badge adm-badge-green"
                          : "adm-badge adm-badge-slate"
                      }
                      style={{ fontSize: "0.55rem" }}
                    >
                      {t.status === "OPEN" ? "ღია" : "დასრულებული"}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.7rem", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.topic}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.65rem", color: "#94a3b8", marginTop: "2px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      <Clock size={10} /> {t.time}
                    </span>
                    <span>{t.messages.length} შეტყობინება</span>
                  </div>
                </button>
              );
            })}

            {filteredTickets.length === 0 && (
              <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.75rem" }}>
                ჩათები არ მოიძებნა
              </div>
            )}
          </div>
        </div>

        {/* Active Conversation Desk */}
        {activeTicket ? (
          <div className="adm-card" style={{ display: "flex", flexDirection: "column", height: "70vh", overflow: "hidden" }}>
            
            {/* Active Header & Close Action */}
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", background: "#ffffff" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <h3 style={{ fontSize: "0.9rem", color: "#0f172a" }}>{activeTicket.customerName}</h3>
                  <span
                    className={
                      activeTicket.status === "OPEN"
                        ? "adm-badge adm-badge-amber"
                        : "adm-badge adm-badge-green"
                    }
                  >
                    {activeTicket.status === "OPEN" ? "აქტიური დიალოგი" : "დახურული / დასრულებული"}
                  </span>
                </div>
                <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>
                  {activeTicket.customerEmail} · თემა: {activeTicket.topic}
                </p>
              </div>

              {/* Action Buttons: Close Chat / Reopen / Delete / Dismiss */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {activeTicket.status === "OPEN" ? (
                  <button
                    type="button"
                    onClick={() => handleCloseTicket(activeTicket.id)}
                    className="adm-btn-secondary"
                    style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", fontSize: "0.72rem", padding: "0.45rem 0.875rem" }}
                    title="საუბრის დასრულება და ჩათის დახურვა"
                  >
                    <CheckCircle2 size={14} />
                    <span>ჩათის დახურვა</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleReopenTicket(activeTicket.id)}
                    className="adm-btn-secondary"
                    style={{ fontSize: "0.72rem", padding: "0.45rem 0.875rem" }}
                    title="ჩათის ხელახლა გახსნა"
                  >
                    <RefreshCw size={13} />
                    <span>ხელახლა გახსნა</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteTicket(activeTicket.id)}
                  className="adm-icon-btn adm-icon-btn-red"
                  title="დიალოგის წაშლა"
                >
                  <Trash2 size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTicketId(null)}
                  className="adm-icon-btn"
                  title="ფანჯრის დახურვა"
                  style={{ marginLeft: "4px" }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", background: "#f8fafc" }}>
              {activeTicket.messages.map((msg, idx) => {
                const isAdmin = msg.sender === "admin";
                return (
                  <div key={idx} style={{ display: "flex", justifyContent: isAdmin ? "flex-end" : "flex-start" }}>
                    <div
                      style={{
                        maxWidth: "75%",
                        padding: "0.75rem 1rem",
                        borderRadius: isAdmin ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                        background: isAdmin ? "linear-gradient(135deg, #4f46e5, #6366f1)" : "#ffffff",
                        border: isAdmin ? "none" : "1px solid #e2e8f0",
                        color: isAdmin ? "#ffffff" : "#0f172a",
                        fontSize: "0.8rem",
                        lineHeight: 1.5,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                    >
                      <p>{msg.text}</p>
                      <span
                        style={{
                          fontSize: "0.6rem",
                          opacity: 0.7,
                          display: "block",
                          marginTop: "4px",
                          textAlign: isAdmin ? "right" : "left",
                        }}
                      >
                        {isAdmin ? "ადმინისტრატორი" : activeTicket.customerName} • {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} style={{ padding: "1rem 1.25rem", borderTop: "1px solid #f1f5f9", display: "flex", gap: "0.625rem", background: "#ffffff" }}>
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="ჩაწერეთ პასუხი მომხმარებლისთვის (გაიგზავნება რეალურ დროში)..."
                className="adm-input"
                style={{ flex: 1 }}
              />
              <button type="submit" className="adm-btn-primary" style={{ flexShrink: 0 }}>
                <Send size={15} />
                <span>გაგზავნა</span>
              </button>
            </form>

          </div>
        ) : (
          <div className="adm-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", gap: "0.75rem" }}>
            <MessageSquare size={36} style={{ color: "#cbd5e1" }} />
            <p style={{ fontSize: "0.85rem", color: "#0f172a" }}>დიალოგი არ არის არჩეული</p>
            <p style={{ fontSize: "0.72rem", color: "#94a3b8" }}>აირჩიეთ ჩათი მარცხენა სიიდან სასაუბროდ</p>
          </div>
        )}

      </div>

    </div>
  );
}

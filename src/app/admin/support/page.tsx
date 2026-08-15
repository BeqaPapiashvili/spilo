"use client";

import React, { useState, useEffect, useRef } from "react";
import { Headphones, Send, MessageSquare, Clock, CheckCircle2, XCircle, Trash2, Check, RefreshCw, X, Phone, Archive, User, Edit3, AlertTriangle, Lock, Folder, FolderOpen } from "lucide-react";
import { dataService, SupportTicket } from "@/services/dataService";

import { useStore } from "@/store/useStore";

export default function AdminSupportPage() {
  const { adminUser, user } = useStore();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"OPEN" | "RESOLVED" | "ALL">("OPEN");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFeedRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef<number>(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTickets(dataService.getSupportTickets());

    // Lightweight 1s polling — only fetches /api/admin/support (1 call, not 11)
    const pollInterval = setInterval(() => {
      dataService.syncSupportOnly();
    }, 1000);

    const unsub = dataService.subscribe(() => {
      const currentTickets = dataService.getSupportTickets();
      setTickets(currentTickets);
      if (!activeTicketId && currentTickets.length > 0) {
        setActiveTicketId(currentTickets[0].id);
      }
    });

    return () => {
      clearInterval(pollInterval);
      unsub();
    };
  }, [activeTicketId]);

  // Smart auto-scroll: Only when activeTicketId changes or new message arrives while user is near bottom
  useEffect(() => {
    if (activeTicketId) {
      dataService.markMessagesAsRead(activeTicketId, "admin");
      setTimeout(() => {
        if (chatFeedRef.current) {
          chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [activeTicketId]);

  const currentOperatorName =
    adminUser?.name ||
    user?.name ||
    (adminUser?.email ? adminUser.email.split("@")[0] : "") ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "ოპერატორი";

  const activeTicket = tickets.find((t) => t.id === activeTicketId);
  const isAnotherAdminTyping = Boolean(activeTicket?.isAdminTyping && activeTicket?.typingAdminName && activeTicket.typingAdminName !== currentOperatorName);
  const isAssignedToOther = Boolean(activeTicket?.assignedToName && activeTicket.assignedToName !== currentOperatorName);
  const isLockedForOtherOperator = isAnotherAdminTyping || isAssignedToOther;
  const lockOwnerName = activeTicket?.typingAdminName || activeTicket?.assignedToName || "სხვა ოპერატორი";

  const currentMsgCount = activeTicket?.messages.length || 0;

  useEffect(() => {
    if (currentMsgCount > 0) {
      if (currentMsgCount > prevMsgCountRef.current) {
        if (chatFeedRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = chatFeedRef.current;
          const isUserNearBottom = scrollHeight - scrollTop - clientHeight < 160;
          if (isUserNearBottom) {
            chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
          }
        }
      }
    }
    prevMsgCountRef.current = currentMsgCount;
  }, [currentMsgCount]);

  const filteredTickets = tickets.filter((t) => {
    if (selectedFilter === "OPEN") return t.status === "OPEN";
    if (selectedFilter === "RESOLVED") return t.status === "RESOLVED" || t.status === "CLOSED";
    return true;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedForOtherOperator || !activeTicketId || !replyText.trim()) return;

    dataService.addSupportReply(activeTicketId, replyText.trim(), currentOperatorName);
    dataService.setTypingStatus(activeTicketId, "admin", false, currentOperatorName);
    setReplyText("");

    setTimeout(() => {
      if (chatFeedRef.current) {
        chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
      }
    }, 30);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyText(e.target.value);
    if (activeTicketId) {
      dataService.setTypingStatus(activeTicketId, "admin", true, currentOperatorName);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        dataService.setTypingStatus(activeTicketId, "admin", false, currentOperatorName);
      }, 2500);
    }
  };

  const handleClaimTicket = (id: string) => {
    dataService.assignTicket(id, currentOperatorName);
  };

  const handleFilterChange = (filter: "OPEN" | "RESOLVED" | "ALL") => {
    setSelectedFilter(filter);
    const newFiltered = tickets.filter((t) => {
      if (filter === "OPEN") return t.status === "OPEN";
      if (filter === "RESOLVED") return t.status === "RESOLVED" || t.status === "CLOSED";
      return true;
    });
    if (newFiltered.length > 0) {
      setActiveTicketId(newFiltered[0].id);
    } else {
      setActiveTicketId(null);
    }
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
    if (selectedFilter === "RESOLVED") {
      const remainingResolved = tickets.filter(t => t.id !== ticketId && (t.status === "RESOLVED" || t.status === "CLOSED"));
      setActiveTicketId(remainingResolved[0]?.id || null);
    }
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (confirm("დარწმუნებული ხართ, რომ გსურთ ამ ჩათის წაშლა?")) {
      dataService.deleteSupportTicket(ticketId);
      dataService.syncFromBackend(true);
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
          <p className="adm-page-desc">აქტიური ჩათები და დახურული ჩათების არქივი ცალკე ტაბებში.</p>
        </div>

        {/* Segmented Filter Tabs */}
        <div style={{ display: "flex", gap: "0.375rem", background: "#f1f5f9", padding: "0.25rem", borderRadius: "0.5rem" }}>
          <button
            type="button"
            onClick={() => handleFilterChange("OPEN")}
            style={{
              fontSize: "0.75rem",
              padding: "0.45rem 0.875rem",
              borderRadius: "0.375rem",
              border: "none",
              cursor: "pointer",
              background: selectedFilter === "OPEN" ? "#ffffff" : "transparent",
              color: selectedFilter === "OPEN" ? "#0f172a" : "#64748b",
              boxShadow: selectedFilter === "OPEN" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }} />
            აქტიური ჩათები ({tickets.filter(t => t.status === "OPEN").length})
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange("RESOLVED")}
            style={{
              fontSize: "0.75rem",
              padding: "0.45rem 0.875rem",
              borderRadius: "0.375rem",
              border: "none",
              cursor: "pointer",
              background: selectedFilter === "RESOLVED" ? "#ffffff" : "transparent",
              color: selectedFilter === "RESOLVED" ? "#0f172a" : "#64748b",
              boxShadow: selectedFilter === "RESOLVED" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.15s ease",
            }}
          >
            <Archive size={13} style={{ color: selectedFilter === "RESOLVED" ? "#2563eb" : "#64748b" }} />
            დახურული / არქივი ({tickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED").length})
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange("ALL")}
            style={{
              fontSize: "0.75rem",
              padding: "0.45rem 0.875rem",
              borderRadius: "0.375rem",
              border: "none",
              cursor: "pointer",
              background: selectedFilter === "ALL" ? "#ffffff" : "transparent",
              color: selectedFilter === "ALL" ? "#0f172a" : "#64748b",
              boxShadow: selectedFilter === "ALL" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.15s ease",
            }}
          >
            ყველა ({tickets.length})
          </button>
        </div>
      </div>

      {/* Main Support Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1rem", height: "calc(100vh - 180px)", minHeight: "550px", maxHeight: "720px" }}>
        
        {/* Left Column: Tickets List */}
        <div className="adm-card" style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
            <h2 style={{ fontSize: "0.82rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {selectedFilter === "OPEN" && (
                <>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                  აქტიური ჩათები ({filteredTickets.length})
                </>
              )}
              {selectedFilter === "RESOLVED" && (
                <>
                  <Archive size={14} style={{ color: "#2563eb" }} />
                  დახურული ჩათების არქივი ({filteredTickets.length})
                </>
              )}
              {selectedFilter === "ALL" && (
                <>
                  <FolderOpen size={14} style={{ color: "#64748b" }} />
                  ყველა ჩატი ({filteredTickets.length})
                </>
              )}
            </h2>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", minHeight: 0 }}>
            {filteredTickets.length === 0 ? (
              <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.78rem" }}>
                ჩათები არ არის
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isActive = t.id === activeTicketId;
                const lastMsg = t.messages[t.messages.length - 1];

                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveTicketId(t.id)}
                    style={{
                      padding: "1rem 1.25rem",
                      borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer",
                      background: isActive ? "#eff6ff" : "transparent",
                      borderLeft: isActive ? "3px solid #2563eb" : "3px solid transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                      <span style={{ fontSize: "0.82rem", color: "#0f172a" }}>{t.customerName}</span>
                      <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{t.time}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{t.customerPhone}</span>
                      {t.status === "OPEN" ? (
                        <span className="adm-badge adm-badge-blue" style={{ fontSize: "0.6rem", padding: "0.1rem 0.4rem" }}>ღია</span>
                      ) : (
                        <span className="adm-badge adm-badge-green" style={{ fontSize: "0.6rem", padding: "0.1rem 0.4rem" }}>დახურული</span>
                      )}
                      {t.assignedToName && (
                        <span className="adm-badge" style={{ fontSize: "0.6rem", padding: "0.1rem 0.4rem", background: "#e0f2fe", color: "#0369a1", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <User size={10} /> {t.assignedToName}
                        </span>
                      )}
                      {t.isAdminTyping && t.typingAdminName && t.typingAdminName !== currentOperatorName && (
                        <span className="adm-badge" style={{ fontSize: "0.6rem", padding: "0.1rem 0.4rem", background: "#fef3c7", color: "#92400e", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <Edit3 size={10} /> {t.typingAdminName} ბეჭდავს
                        </span>
                      )}
                    </div>

                    {lastMsg && (
                      <p style={{ fontSize: "0.75rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lastMsg.sender === "admin" ? "თქვენ: " : ""}{lastMsg.text}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Feed & Messaging */}
        <div className="adm-card" style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
          {activeTicket ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: "0.9rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {activeTicket.customerName}
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>({activeTicket.customerPhone})</span>
                  </h2>
                  <p style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.125rem" }}>
                    თემა: {activeTicket.topic}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {activeTicket.assignedToName !== currentOperatorName && (
                    <button
                      type="button"
                      onClick={() => handleClaimTicket(activeTicket.id)}
                      className="adm-btn-secondary"
                      style={{ fontSize: "0.72rem", padding: "0.35rem 0.75rem", background: "#eff6ff", color: "#1d4ed8" }}
                    >
                      <Check size={13} /> {activeTicket.assignedToName ? "ჩატის გადაბარება" : "ჩატის მიღება"}
                    </button>
                  )}

                  {activeTicket.status === "OPEN" ? (
                    <button
                      type="button"
                      onClick={() => handleCloseTicket(activeTicket.id)}
                      className="adm-btn-secondary"
                      style={{ fontSize: "0.72rem", padding: "0.35rem 0.75rem" }}
                    >
                      <CheckCircle2 size={13} /> ჩათის დახურვა
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReopenTicket(activeTicket.id)}
                      className="adm-btn-secondary"
                      style={{ fontSize: "0.72rem", padding: "0.35rem 0.75rem" }}
                    >
                      <RefreshCw size={13} /> ხელახლა გახსნა
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteTicket(activeTicket.id)}
                    className="adm-btn-danger"
                    style={{ fontSize: "0.72rem", padding: "0.35rem 0.6rem" }}
                    title="ჩათის წაშლა"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Closed Archive Banner */}
              {(activeTicket.status === "RESOLVED" || activeTicket.status === "CLOSED") && (
                <div style={{ padding: "0.6rem 1.25rem", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Archive size={14} style={{ color: "#94a3b8" }} />
                    <span>ეს ჩატი დახურულია და შენახულია არქივში.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReopenTicket(activeTicket.id)}
                    className="adm-btn-secondary"
                    style={{ fontSize: "0.68rem", padding: "0.25rem 0.65rem" }}
                  >
                    <RefreshCw size={12} /> ხელახლა გახსნა
                  </button>
                </div>
              )}

              {/* Chat Feed */}
              <div ref={chatFeedRef} style={{ flex: 1, padding: "1.25rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.875rem", background: "#fafafa", minHeight: 0, position: "relative" }}>
                {activeTicket.messages.map((msg, idx) => {
                  const isAdmin = msg.sender === "admin";
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isAdmin ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "75%",
                          padding: "0.75rem 1rem",
                          borderRadius: isAdmin ? "1rem 1rem 0 1rem" : "1rem 1rem 1rem 0",
                          background: isAdmin ? "#2563eb" : "#ffffff",
                          color: isAdmin ? "#ffffff" : "#1e293b",
                          fontSize: "0.82rem",
                          lineHeight: "1.5",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          border: isAdmin ? "none" : "1px solid #e2e8f0",
                        }}
                      >
                        {msg.text}
                      </div>

                      <span style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: "0.25rem", padding: "0 0.25rem" }}>
                        {isAdmin ? (msg.adminName || "ოპერატორი") : activeTicket.customerName} • {msg.time}
                        {isAdmin && (
                          <span style={{ marginLeft: "0.4rem", color: msg.read ? "#2563eb" : "#94a3b8" }}>
                            {msg.read ? "✓✓ წაკითხულია" : "✓ გაგზავნილია"}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}

                {activeTicket.isUserTyping && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0.5rem", color: "#2563eb", fontSize: "0.75rem", fontStyle: "italic" }}>
                    <span>{activeTicket.customerName} ბეჭდავს...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Operator Conflict / Assignment Warning Banners */}
              {isAnotherAdminTyping && (
                <div style={{ padding: "0.6rem 1.25rem", background: "#fef3c7", borderTop: "1px solid #fde68a", color: "#92400e", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <AlertTriangle size={14} style={{ color: "#d97706" }} />
                  <span><strong>ყურადღება:</strong> ოპერატორი <strong>"{activeTicket.typingAdminName}"</strong> ამ წამს ბეჭდავს პასუხს ამ მომხმარებლისთვის!</span>
                </div>
              )}

              {isAssignedToOther && (
                <div style={{ padding: "0.6rem 1.25rem", background: "#eff6ff", borderTop: "1px solid #bfdbfe", color: "#1e40af", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Lock size={13} style={{ color: "#2563eb" }} />
                    <span>ამ ჩატს ემსახურება ოპერატორი: <strong>"{activeTicket.assignedToName}"</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleClaimTicket(activeTicket.id)}
                    className="adm-btn-secondary"
                    style={{ fontSize: "0.68rem", padding: "0.25rem 0.65rem" }}
                  >
                    გადაბარება
                  </button>
                </div>
              )}

              {/* Chat Reply Form */}
              <form onSubmit={handleSendReply} style={{ padding: "1rem", borderTop: "1px solid #f1f5f9", background: isLockedForOtherOperator ? "#f8fafc" : "#ffffff", display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={replyText}
                  disabled={isLockedForOtherOperator}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (activeTicketId && !isLockedForOtherOperator) {
                      dataService.markMessagesAsRead(activeTicketId, "admin");
                    }
                  }}
                  placeholder={
                    isLockedForOtherOperator
                      ? `ჩატი დაკავებულია (${lockOwnerName}-ს მიერ)...`
                      : "ჩაწერეთ პასუხი მომხმარებლისთვის..."
                  }
                  className="adm-input"
                  style={{
                    flex: 1,
                    height: "2.5rem",
                    fontSize: "0.82rem",
                    background: isLockedForOtherOperator ? "#f1f5f9" : undefined,
                    cursor: isLockedForOtherOperator ? "not-allowed" : "text",
                  }}
                />
                <button
                  type="submit"
                  disabled={isLockedForOtherOperator || !replyText.trim()}
                  className="adm-btn-primary"
                  style={{
                    height: "2.5rem",
                    padding: "0 1.25rem",
                    opacity: isLockedForOtherOperator ? 0.5 : 1,
                    cursor: isLockedForOtherOperator ? "not-allowed" : "pointer",
                  }}
                >
                  <Send size={14} /> გაგზავნა
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                <MessageSquare size={32} />
                <p style={{ fontSize: "0.82rem" }}>აირჩიეთ ჩათი მარცხენა სიიდან მიმოწერა რომ დაიწყოთ</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

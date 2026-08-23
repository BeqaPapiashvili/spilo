"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Headphones, 
  Send, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Check, 
  RefreshCw, 
  X, 
  Phone, 
  Mail,
  Archive, 
  User, 
  Edit3, 
  AlertTriangle, 
  Lock, 
  FolderOpen, 
  FileText, 
  Download,
  Search,
  Sparkles,
  Zap,
  CheckCheck,
  ShieldAlert,
  ArrowRight,
  MoreVertical,
  ExternalLink,
  Paperclip,
  Smile
} from "lucide-react";
import { useStore } from "@/store/useStore";

export interface ChatAttachment {
  type: "image" | "video" | "file";
  url: string;
  name: string;
  size?: string;
}

export interface ChatMessage {
  id?: string;
  sender: "user" | "bot" | "admin";
  text: string;
  time: string;
  adminName?: string;
  adminAvatar?: string;
  read?: boolean;
  liked?: boolean | null;
  attachment?: ChatAttachment;
  createdAt?: string;
}

export interface SupportTicket {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  userName: string;
  userPhone?: string;
  userEmail?: string;
  topic?: string;
  status: "OPEN" | "CLOSED" | "RESOLVED";
  isUserTyping?: boolean;
  isAdminTyping?: boolean;
  typingAdminName?: string;
  assignedToName?: string;
  time: string;
  messages: ChatMessage[];
  updatedAt?: string;
  createdAt?: string;
}

const QUICK_REPLIES = [
  "გამარჯობა! რით შემიძლია დაგეხმაროთ?",
  "თქვენი შეკვეთის ნომერი მომწერეთ, გთხოვთ.",
  "მოთხოვნა მიღებულია, ვამოწმებ ინფორმაციას.",
  "პროდუქტი მარაგშია და მზადაა გასაგზავნად.",
  "გმადლობთ დაკავშირებისთვის! სასიამოვნო დღეს გისურვებთ! 😊",
];

export default function AdminSupportPage() {
  const { adminUser, user } = useStore();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"OPEN" | "RESOLVED" | "ALL">("OPEN");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingTicket, setIsDeletingTicket] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFeedRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef<number>(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/admin/support");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTickets(json.data);
      }
    } catch (err) {
      console.warn("Failed to fetch tickets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const pollInterval = setInterval(fetchTickets, 2500);
    return () => clearInterval(pollInterval);
  }, []);

  // Smart auto-scroll
  useEffect(() => {
    if (activeTicketId) {
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

  const activeTicket = useMemo(() => {
    return tickets.find((t) => t.id === activeTicketId) || null;
  }, [tickets, activeTicketId]);

  const isAnotherAdminTyping = Boolean(
    activeTicket?.isAdminTyping &&
    activeTicket?.typingAdminName &&
    activeTicket.typingAdminName !== currentOperatorName
  );
  const isAssignedToOther = Boolean(
    activeTicket?.assignedToName &&
    activeTicket.assignedToName !== currentOperatorName
  );
  const isLockedForOtherOperator = isAnotherAdminTyping || isAssignedToOther;
  const lockOwnerName = activeTicket?.typingAdminName || activeTicket?.assignedToName || "სხვა ოპერატორი";

  const currentMsgCount = activeTicket?.messages.length || 0;

  useEffect(() => {
    if (currentMsgCount > 0) {
      if (currentMsgCount > prevMsgCountRef.current) {
        if (chatFeedRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = chatFeedRef.current;
          const isUserNearBottom = scrollHeight - scrollTop - clientHeight < 180;
          if (isUserNearBottom) {
            chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
          }
        }
      }
    }
    prevMsgCountRef.current = currentMsgCount;
  }, [currentMsgCount]);

  // Filter and Search Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // 1. Status Filter
      if (selectedFilter === "OPEN" && t.status !== "OPEN") return false;
      if (selectedFilter === "RESOLVED" && (t.status !== "RESOLVED" && t.status !== "CLOSED")) return false;

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = t.customerName?.toLowerCase().includes(q);
        const matchPhone = t.customerPhone?.toLowerCase().includes(q);
        const matchEmail = t.customerEmail?.toLowerCase().includes(q);
        const matchTopic = t.topic?.toLowerCase().includes(q);
        const matchMsg = t.messages.some((m) => m.text?.toLowerCase().includes(q));
        return matchName || matchPhone || matchEmail || matchTopic || matchMsg;
      }
      return true;
    });
  }, [tickets, selectedFilter, searchQuery]);

  // Counts for Badges
  const openCount = useMemo(() => tickets.filter((t) => t.status === "OPEN").length, [tickets]);
  const resolvedCount = useMemo(() => tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length, [tickets]);

  const handleSendReply = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = (customText || replyText).trim();
    if (isLockedForOtherOperator || !activeTicketId || !text) return;

    setReplyText("");

    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeTicketId,
          replyText: text,
          adminName: currentOperatorName,
          isAdminTyping: false,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTickets((prev) => prev.map((t) => (t.id === activeTicketId ? json.data : t)));
      }
    } catch (err) {
      console.error("handleSendReply error:", err);
    }

    setTimeout(() => {
      if (chatFeedRef.current) {
        chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
      }
    }, 40);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyText(e.target.value);
    if (activeTicketId) {
      fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeTicketId,
          isAdminTyping: true,
          typingAdminName: currentOperatorName,
        }),
      }).catch(() => {});

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        fetch("/api/admin/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: activeTicketId,
            isAdminTyping: false,
            typingAdminName: "",
          }),
        }).catch(() => {});
      }, 2500);
    }
  };

  const handleClaimTicket = async (id: string) => {
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          assignedToName: currentOperatorName,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTickets((prev) => prev.map((t) => (t.id === id ? json.data : t)));
      }
    } catch (err) {
      console.error("handleClaimTicket error:", err);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ticketId,
          status: "RESOLVED",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? json.data : t)));
      }
    } catch (err) {
      console.error("handleCloseTicket error:", err);
    }
  };

  const handleReopenTicket = async (ticketId: string) => {
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ticketId,
          status: "OPEN",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? json.data : t)));
      }
    } catch (err) {
      console.error("handleReopenTicket error:", err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return;
    setIsDeletingTicket(true);
    try {
      const res = await fetch(`/api/admin/support?id=${encodeURIComponent(ticketToDelete.id)}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setTickets((prev) => prev.filter((t) => t.id !== ticketToDelete.id));
        if (activeTicketId === ticketToDelete.id) {
          setActiveTicketId(null);
        }
      }
    } catch (err) {
      console.error("handleDeleteTicket error:", err);
    } finally {
      setIsDeletingTicket(false);
      setTicketToDelete(null);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC] rounded-full text-xs">
            <Headphones className="w-3.5 h-3.5" />
            <span>რეალურ დროში მხარდაჭერა</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-zinc-900 tracking-tight">
            მხარდაჭერის ჩათი ({openCount} აქტიური)
          </h1>
          <p className="text-xs md:text-sm text-zinc-500">
            მართეთ მომხმარებლების მოთხოვნები, ონლაინ კონსულტაციები და არქივი
          </p>
        </div>

        {/* Live Counters & Refresh */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200/80 rounded-2xl p-1.5">
            <div className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200/60 text-xs text-zinc-800 shadow-2xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{openCount} ღია</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl text-xs text-zinc-500">
              {resolvedCount} დახურული
            </div>
          </div>

          <button
            type="button"
            onClick={fetchTickets}
            disabled={isLoading}
            className="h-11 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
            title="განახლება"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#FF5238]" : ""}`} />
            <span className="hidden sm:inline">განახლება</span>
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Chat Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-210px)] min-h-[640px] max-h-[840px]">
        
        {/* Left Column: Tickets Queue & Search (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col overflow-hidden">
          
          {/* Search & Filter Header */}
          <div className="p-4 border-b border-zinc-100 space-y-3 bg-zinc-50/50">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ძებნა: სახელი, ნომერი, ტექსტი..."
                className="w-full h-10 pl-9 pr-8 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF5238]/20 focus:border-[#FF5238] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Segmented Filter Pills */}
            <div className="flex p-1 bg-zinc-100/80 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setSelectedFilter("OPEN")}
                className={`flex-1 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedFilter === "OPEN"
                    ? "bg-white text-zinc-900 shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>ღია ({openCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("RESOLVED")}
                className={`flex-1 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedFilter === "RESOLVED"
                    ? "bg-white text-zinc-900 shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <Archive className="w-3.5 h-3.5 opacity-60" />
                <span>არქივი ({resolvedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("ALL")}
                className={`flex-1 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedFilter === "ALL"
                    ? "bg-white text-zinc-900 shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <span>ყველა ({tickets.length})</span>
              </button>
            </div>

          </div>

          {/* Ticket Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 p-2 space-y-1">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3.5 rounded-2xl animate-pulse space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-28 bg-zinc-200 rounded" />
                    <div className="h-3 w-12 bg-zinc-100 rounded" />
                  </div>
                  <div className="h-3 w-20 bg-zinc-100 rounded" />
                  <div className="h-3 w-4/5 bg-zinc-100 rounded" />
                </div>
              ))
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 bg-zinc-100 text-zinc-400 rounded-2xl flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-xs text-zinc-500">ჩათები არ მოიძებნა</p>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isActive = t.id === activeTicketId;
                const lastMsg = t.messages[t.messages.length - 1];
                const isOpen = t.status === "OPEN";

                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveTicketId(t.id)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer relative group ${
                      isActive
                        ? "bg-[#FFF5F2] border border-[#FED7CC] shadow-2xs"
                        : "hover:bg-zinc-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs ${
                          isActive ? "bg-[#FF5238] text-white" : "bg-zinc-100 text-zinc-700"
                        }`}>
                          {getInitials(t.customerName)}
                        </div>
                        {isOpen && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className={`text-xs truncate ${isActive ? "text-[#FF5238]" : "text-zinc-900"}`}>
                            {t.customerName}
                          </h4>
                          <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                            {t.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          {t.customerPhone && (
                            <span className="text-[11px] text-zinc-500 font-mono">
                              {t.customerPhone}
                            </span>
                          )}
                          {t.assignedToName && (
                            <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                              <User className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[80px]">{t.assignedToName}</span>
                            </span>
                          )}
                          {t.isAdminTyping && t.typingAdminName && t.typingAdminName !== currentOperatorName && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded-md animate-pulse">
                              {t.typingAdminName} ბეჭდავს...
                            </span>
                          )}
                        </div>

                        {lastMsg && (
                          <p className="text-[11px] text-zinc-500 truncate">
                            {lastMsg.sender === "admin" ? "თქვენ: " : ""}{lastMsg.text}
                          </p>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Active Conversation Feed (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col overflow-hidden">
          {activeTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-4 md:px-6 md:py-4 border-b border-zinc-100 flex items-center justify-between gap-3 bg-zinc-50/50">
                
                {/* User Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-[#FF5238] text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                    {getInitials(activeTicket.customerName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm text-zinc-900 truncate">{activeTicket.customerName}</h3>
                      {activeTicket.status === "OPEN" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          ღია
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 text-zinc-600">
                          დახურული
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-0.5">
                      {activeTicket.customerPhone && (
                        <a href={`tel:${activeTicket.customerPhone}`} className="hover:text-[#FF5238] flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{activeTicket.customerPhone}</span>
                        </a>
                      )}
                      {activeTicket.customerEmail && (
                        <a href={`mailto:${activeTicket.customerEmail}`} className="hover:text-[#FF5238] flex items-center gap-1 hidden sm:flex">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[140px]">{activeTicket.customerEmail}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  
                  {/* Claim Button */}
                  {activeTicket.assignedToName !== currentOperatorName && (
                    <button
                      type="button"
                      onClick={() => handleClaimTicket(activeTicket.id)}
                      className="h-9 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{activeTicket.assignedToName ? "გადაბარება" : "ჩატის აღება"}</span>
                    </button>
                  )}

                  {/* Close / Reopen */}
                  {activeTicket.status === "OPEN" ? (
                    <button
                      type="button"
                      onClick={() => handleCloseTicket(activeTicket.id)}
                      className="h-9 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">დახურვა</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReopenTicket(activeTicket.id)}
                      className="h-9 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">გახსნა</span>
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setTicketToDelete(activeTicket)}
                    className="h-9 w-9 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                    title="ჩათის წაშლა"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>

              {/* Locked Notice if other operator is typing */}
              {isAnotherAdminTyping && (
                <div className="px-4 py-2 bg-amber-50 border-b border-amber-200/80 text-amber-800 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>ყურადღება: ოპერატორი <strong>"{activeTicket.typingAdminName}"</strong> ამ მომენტში ბეჭდავს პასუხს.</span>
                </div>
              )}

              {/* Chat Feed */}
              <div 
                ref={chatFeedRef} 
                className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-zinc-50/30"
              >
                {activeTicket.messages.map((msg, idx) => {
                  const isAdmin = msg.sender === "admin";
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"} space-y-1`}
                    >
                      <div
                        className={`max-w-[80%] md:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isAdmin
                            ? "bg-[#FF5238] text-white rounded-tr-xs"
                            : "bg-white text-zinc-900 border border-zinc-200/80 rounded-tl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Attachments */}
                        {msg.attachment && (
                          <div className="mt-2.5 pt-2 border-t border-white/20">
                            {msg.attachment.type === "image" && (
                              <a
                                href={msg.attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                className="block rounded-xl overflow-hidden border border-black/10 max-w-[240px]"
                              >
                                <img
                                  src={msg.attachment.url}
                                  alt={msg.attachment.name}
                                  className="w-full max-h-48 object-cover"
                                />
                              </a>
                            )}

                            {msg.attachment.type === "file" && (
                              <a
                                href={msg.attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                download={msg.attachment.name}
                                className={`flex items-center gap-2 p-2 rounded-xl text-xs ${
                                  isAdmin ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-800"
                                }`}
                              >
                                <FileText className="w-4 h-4 shrink-0" />
                                <span className="truncate flex-1">{msg.attachment.name}</span>
                                <Download className="w-3.5 h-3.5 shrink-0 opacity-70" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Timestamp & Sender */}
                      <div className="flex items-center gap-1.5 px-1 text-[10px] text-zinc-400">
                        <span>{isAdmin ? (msg.adminName || "ოპერატორი") : activeTicket.customerName}</span>
                        <span>•</span>
                        <span className="font-mono">{msg.time}</span>
                        {isAdmin && (
                          <CheckCheck className="w-3 h-3 text-[#FF5238]" />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Customer typing indicator */}
                {activeTicket.isUserTyping && (
                  <div className="flex items-center gap-2 text-xs text-[#FF5238] italic bg-[#FFF5F2] border border-[#FED7CC] px-3 py-1.5 rounded-xl w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5238] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5238] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5238] animate-bounce [animation-delay:0.4s]" />
                    <span>{activeTicket.customerName} ბეჭდავს...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Canned Quick Replies Chips */}
              <div className="px-4 py-2 border-t border-zinc-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] text-zinc-400 shrink-0 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#FF5238]" /> სწრაფი:
                </span>
                {QUICK_REPLIES.map((reply, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendReply(undefined, reply)}
                    disabled={isLockedForOtherOperator}
                    className="px-2.5 py-1 bg-zinc-100 hover:bg-[#FFF5F2] hover:text-[#FF5238] text-zinc-700 rounded-lg text-[11px] whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Reply Form */}
              <form
                onSubmit={handleSendReply}
                className="p-3 md:p-4 border-t border-zinc-100 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  disabled={isLockedForOtherOperator}
                  onChange={handleInputChange}
                  placeholder={
                    isLockedForOtherOperator
                      ? `ჩატი დაკავებულია (${lockOwnerName}-ს მიერ)...`
                      : "ჩაწერეთ პასუხი მომხმარებლისთვის..."
                  }
                  className="flex-1 h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF5238]/20 focus:border-[#FF5238] transition-all disabled:bg-zinc-100 disabled:cursor-not-allowed"
                />

                <button
                  type="submit"
                  disabled={isLockedForOtherOperator || !replyText.trim()}
                  className="h-11 px-5 bg-[#FF5238] hover:bg-[#EA3A20] disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-2xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">გაგზავნა</span>
                </button>
              </form>
            </>
          ) : (
            /* Empty State when no ticket selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC] flex items-center justify-center">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base text-zinc-900">ჩატი არ არის არჩეული</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  მომხმარებელთან სასაუბროდ ან ისტორიის სანახავად გთხოვთ აირჩიოთ სასურველი ჩატი მარცხენა სიიდან.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 3. Safe Delete Ticket Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base text-zinc-900">ჩათის წაშლის დადასტურება</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                ნამდვილად გსურთ <strong>"{ticketToDelete.customerName}"</strong>-ს ჩათისა და მთლიანი მიმოწერის წაშლა?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs transition-colors cursor-pointer"
              >
                გაუქმება
              </button>

              <button
                type="button"
                disabled={isDeletingTicket}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isDeletingTicket ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>წაშლის დადასტურება</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

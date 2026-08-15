"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Minus, 
  ThumbsUp, 
  ThumbsDown, 
  ChevronDown, 
  Plus, 
  GitCompare,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { dataService } from "@/services/dataService";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "bot" | "admin";
  text: string;
  time: string;
  adminName?: string;
  adminAvatar?: string;
  liked?: boolean | null;
  read?: boolean;
}

export default function SupportChatWidget() {
  const { user, compareList } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [chatStep, setChatStep] = useState<"auth" | "consent" | "chat">("auth");
  const [guestName, setGuestName] = useState(user?.name || "");
  const [guestPhone, setGuestPhone] = useState(user?.phone || "");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [inputMsg, setInputMsg] = useState("");
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const userTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [customerId, setCustomerId] = useState<string>("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "მოგესალმებით Spilo-ს მხარდაჭერის ცენტრში! ონლაინ კონსულტანტი მზად არის დაგეხმაროთ",
      time: "ახლახანს",
    },
  ]);

  // Customer ID Initialization: Ensure every browser session has a unique private customerId
  useEffect(() => {
    try {
      let cid = localStorage.getItem("spilo_chat_customer_id");
      if (!cid) {
        cid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `cust_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem("spilo_chat_customer_id", cid);
      }
      setCustomerId(cid);
    } catch (e) {}
  }, []);

  // Session Persistence: Restore session from localStorage on F5 refresh
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("spilo_chat_session");
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.name) setGuestName(parsed.name);
        if (parsed.phone) setGuestPhone(parsed.phone);
        if (parsed.ticketId) setTicketId(parsed.ticketId);
        if (parsed.name && parsed.phone) {
          setChatStep("chat");
        }
      } else if (user?.name || user?.phone) {
        if (user.name) setGuestName(user.name);
        if (user.phone) setGuestPhone(user.phone);
      }
    } catch (e) {
      console.warn("Failed to load chat session", e);
    }
  }, [user]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen && chatStep === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, chatStep, isAdminTyping]);

  // Real-time synchronization & short polling for support operator messages
  useEffect(() => {
    const loadMessages = () => {
      const tickets = dataService.getSupportTickets();
      const formattedPhone = guestPhone ? (guestPhone.startsWith("+995") ? guestPhone : `+995 ${guestPhone}`) : "";

      // 1. Strictly find active ticket matching customer ticketId or private customerId
      const current = ticketId
        ? tickets.find((t) => t.id === ticketId)
        : customerId
        ? tickets.find((t) => t.customerId === customerId && t.status === "OPEN")
        : formattedPhone && formattedPhone !== "+995 " && formattedPhone !== "+995 5XX XX XX XX"
        ? tickets.find((t) => t.customerPhone === formattedPhone && t.status === "OPEN")
        : null;

      if (current) {
        setIsAdminTyping(Boolean(current.isAdminTyping));

        if (isOpen && current.id) {
          dataService.markMessagesAsRead(current.id, "user");
        }

        // If the ticket was CLOSED or RESOLVED by admin operator:
        if (current.status === "CLOSED" || current.status === "RESOLVED") {
          setTicketId(null);
          try {
            localStorage.removeItem("spilo_chat_session");
          } catch (e) {}
          setChatStep("auth");
          setMessages([
            {
              id: "1",
              sender: "bot",
              text: "მოგესალმებით Spilo-ს მხარდაჭერის ცენტრში! ონლაინ კონსულტანტი მზად არის დაგეხმაროთ",
              time: "ახლახანს",
            },
          ]);
          return;
        }

        if (!ticketId) {
          setTicketId(current.id);
          saveSessionToStorage(guestName, guestPhone, current.id);
        }
        if (current.messages.length > 0) {
          setMessages([
            {
              id: "1",
              sender: "bot",
              text: "მოგესალმებით Spilo-ს მხარდაჭერის ცენტრში! ონლაინ კონსულტანტი მზად არის დაგეხმაროთ",
              time: "ახლახანს",
            },
            ...current.messages.map((m, idx) => ({
              id: `msg-${idx}-${Date.now()}`,
              sender: m.sender,
              text: m.text,
              time: m.time,
              adminName: m.adminName,
              adminAvatar: m.adminAvatar,
              read: m.read,
            })),
          ]);
        }
      }
    };

    loadMessages();

    // Lightweight polling only when chat widget is open or active ticket exists
    let pollInterval: NodeJS.Timeout | null = null;
    if (isOpen || ticketId) {
      pollInterval = setInterval(() => {
        dataService.syncSupportOnly();
      }, 3000);
    }

    const unsub = dataService.subscribe(() => {
      loadMessages();
    });

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      unsub();
    };
  }, [ticketId, guestPhone, guestName, customerId, isOpen]);

  const saveSessionToStorage = (name: string, phone: string, activeId: string | null) => {
    try {
      localStorage.setItem(
        "spilo_chat_session",
        JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          ticketId: activeId,
          timestamp: Date.now(),
        })
      );
    } catch (e) {}
  };

  const handleStartAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      alert("გთხოვთ შეიყვანოთ თქვენი სახელი");
      return;
    }
    if (!guestPhone.trim()) {
      alert("გთხოვთ შეიყვანოთ თქვენი მობილურის ნომერი");
      return;
    }
    saveSessionToStorage(guestName, guestPhone, ticketId);
    setChatStep("consent");
  };

  const handleAcceptConsent = () => {
    const formattedPhone = guestPhone.startsWith("+995") ? guestPhone : `+995 ${guestPhone}`;
    const id = dataService.addUserSupportMessage(
      guestName.trim() || "მომხმარებელი",
      formattedPhone,
      "მოგესალმებით, მზად ვარ კონსულტაციისთვის",
      "ონლაინ კონსულტაცია",
      `${guestPhone.replace(/[^0-9]/g, "")}@spilo.ge`,
      customerId
    );
    setTicketId(id);
    saveSessionToStorage(guestName, guestPhone, id);
    setChatStep("chat");
  };

  const handleRejectConsent = () => {
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMsg(e.target.value);
    if (ticketId) {
      dataService.setTypingStatus(ticketId, "user", true);
      if (userTypingTimeoutRef.current) clearTimeout(userTypingTimeoutRef.current);
      userTypingTimeoutRef.current = setTimeout(() => {
        dataService.setTypingStatus(ticketId, "user", false);
      }, 2500);
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const timeStr = new Date().toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" });
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg("");

    // Send to dataService for Live Admin sync with Customer Name, Customer Phone and private customerId!
    const formattedPhone = guestPhone.startsWith("+995") ? guestPhone : `+995 ${guestPhone}`;
    const id = dataService.addUserSupportMessage(
      guestName.trim() || "მომხმარებელი",
      formattedPhone,
      text,
      "ონლაინ კონსულტაცია",
      `${guestPhone.replace(/[^0-9]/g, "")}@spilo.ge`,
      customerId
    );

    setTicketId(id);
    saveSessionToStorage(guestName, guestPhone, id);
  };

  const handleFeedback = (msgId: string, liked: boolean) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, liked } : m));
  };

  return (
    <>
      {/* Mobile Backdrop to click outside and close */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 sm:hidden transition-opacity"
        />
      )}

      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-3">
        
        {/* Floating Sticky Compare Button */}
        <Link
          href="/compare"
          className="relative bg-[#111111] hover:bg-black text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-110 border border-white/20"
          title="პროდუქტების შედარება"
        >
          <GitCompare className="w-5 h-5 text-blue-400" />
          {compareList.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#111111]">
              {compareList.length}
            </span>
          )}
        </Link>

        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.94 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-[340px] sm:w-[380px] h-[520px] rounded-[36px] p-2.5 sm:p-3 flex flex-col justify-between relative shadow-[0_25px_70px_-15px_rgba(0,0,0,0.2)] border border-white/80 overflow-hidden"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(240,244,250,0.98) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              {/* Top Glass Bar */}
              <div className="flex items-center justify-between px-2 pt-1 pb-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-xs">
                  <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px]">
                    S
                  </div>
                  <span className="text-[11px] text-slate-700">
                    Powered by <span className="text-blue-600">Spilo</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60 shadow-xs flex items-center justify-center cursor-pointer transition-all"
                  title="ჩათის ჩაკეცვა"
                >
                  <Minus size={14} />
                </button>
              </div>

              {/* Inner Main Card Container */}
              <div className="flex-1 bg-white rounded-[28px] border border-slate-100/90 shadow-sm relative overflow-hidden flex flex-col">
                
                {/* STEP 1: AUTHORIZATION (ავტორიზაცია) */}
                {chatStep === "auth" && (
                  <div className="p-6 flex-1 flex flex-col justify-between relative">
                    {/* Decorative Concentric Rings Top Right in Spilo Blue */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 pointer-events-none opacity-30">
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="70" cy="30" r="30" stroke="#93C5FD" strokeWidth="2.5" />
                        <circle cx="70" cy="30" r="42" stroke="#93C5FD" strokeWidth="2.5" />
                        <circle cx="70" cy="30" r="54" stroke="#93C5FD" strokeWidth="2.5" />
                      </svg>
                    </div>

                    <div>
                      <div className="mt-8 mb-6">
                        <h3 className="text-xl text-slate-900 tracking-tight">ავტორიზაცია</h3>
                        <p className="text-xs text-slate-500 mt-1">გთხოვთ, შეიყვანოთ თქვენი მონაცემები</p>
                      </div>

                      <form onSubmit={handleStartAuth} className="space-y-4">
                        <div>
                          <label className="block text-xs text-slate-700 mb-1.5">სახელი</label>
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="შეიყვანე შენი სახელი"
                            required
                            className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all placeholder:text-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-700 mb-1.5">მობილური ნომერი</label>
                          <div className="flex gap-2">
                            <div className="h-11 px-3 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center gap-1.5 text-xs text-slate-700">
                              <span>GE +995</span>
                              <ChevronDown size={12} className="text-slate-400" />
                            </div>
                            <input
                              type="tel"
                              value={guestPhone}
                              onChange={(e) => setGuestPhone(e.target.value)}
                              placeholder="5XX XX XX XX"
                              required
                              className="flex-1 h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm cursor-pointer transition-all shadow-md shadow-blue-500/20 mt-4 active:scale-[0.98]"
                        >
                          დაწყება
                        </button>
                      </form>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] text-slate-400">Spilo Online Customer Support</p>
                    </div>
                  </div>
                )}

                {/* STEP 2: CONSENT (თანხმობის მოთხოვნა) */}
                {chatStep === "consent" && (
                  <div className="p-6 flex-1 flex flex-col justify-center text-left">
                    <h3 className="text-xl text-slate-900 tracking-tight mb-4">თანხმობის მოთხოვნა</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-8">
                      მოგესალმებით, გაცნობებთ, რომ ჩატში თქვენს მიერ მითითებული/მოწერილი ინფორმაცია მომართვის დამუშავების მიზნით ინახება. თანხმობის შემთხვევაში შეგიძლიათ კომუნიკაცია განაგრძოთ ოპერატორთან.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleRejectConsent}
                        className="h-11 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs cursor-pointer transition-all"
                      >
                        უარყოფა
                      </button>
                      <button
                        type="button"
                        onClick={handleAcceptConsent}
                        className="h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer transition-all shadow-md shadow-blue-500/20"
                      >
                        თანხმობა
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: ACTIVE CONVERSATION (მერი / Spilo AI & Support) */}
                {chatStep === "chat" && (
                  <div className="flex-1 flex flex-col h-full overflow-hidden">
                    
                    {/* Agent Header Card inside */}
                    {(() => {
                      const lastAdminMsg = [...messages].reverse().find((m) => m.sender === "admin");
                      const operatorName = lastAdminMsg?.adminName || "Spilo Support";
                      const operatorAvatar = lastAdminMsg?.adminAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face";

                      return (
                        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 overflow-hidden flex items-center justify-center">
                                <img
                                  src={operatorAvatar}
                                  alt={operatorName}
                                  className="w-full h-full object-cover rounded-full"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face";
                                  }}
                                />
                              </div>
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                            </div>
                            <div>
                              <h4 className="text-xs text-slate-900">{operatorName}</h4>
                              <p className="text-[10px] text-blue-600">ონლაინ კონსულტანტი</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                      {messages.map((msg) => {
                        const isUser = msg.sender === "user";
                        return (
                          <div
                            key={msg.id}
                            className={`flex items-start gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                          >
                            {!isUser && (
                              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-1 border border-slate-200" title={msg.adminName || "ოპერატორი"}>
                                <img
                                  src={msg.adminAvatar || (msg.sender === "admin" ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face" : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face")}
                                  alt={msg.adminName || "ოპერატორი"}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div className={`max-w-[82%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                              <div
                                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                                  isUser
                                    ? "bg-blue-600 text-white rounded-tr-none shadow-xs"
                                    : "bg-[#F2F4F8] text-slate-800 rounded-tl-none border border-slate-100"
                                }`}
                              >
                                <p>{msg.text}</p>
                              </div>

                              <div className="flex items-center gap-1.5 mt-1 px-1">
                                {!isUser && msg.adminName && (
                                  <span className="text-[10px] text-blue-600">{msg.adminName} •</span>
                                )}
                                <span className="text-[10px] text-slate-400">{msg.time}</span>
                                {isUser && (
                                  <span className={`text-[10px] ${msg.read ? "text-blue-600" : "text-slate-400"}`}>
                                    {msg.read ? "✓✓ წაკითხულია" : "✓ გაგზავნილია"}
                                  </span>
                                )}
                              </div>

                              {/* Feedback actions under bot messages */}
                              {!isUser && (
                                <div className="flex items-center gap-1 mt-1.5 pl-1">
                                  <button
                                    type="button"
                                    onClick={() => handleFeedback(msg.id, true)}
                                    className={`p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ${
                                      msg.liked === true ? "text-emerald-600 bg-emerald-50" : ""
                                    }`}
                                  >
                                    <ThumbsUp size={11} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleFeedback(msg.id, false)}
                                    className={`p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ${
                                      msg.liked === false ? "text-red-500 bg-red-50" : ""
                                    }`}
                                  >
                                    <ThumbsDown size={11} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {isAdminTyping && (
                        <div className="flex items-start gap-2 justify-start">
                          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-1 border border-slate-200">
                            <img
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face"
                              alt="ოპერატორი"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="bg-[#F2F4F8] text-slate-600 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs flex items-center gap-2 border border-slate-100 italic">
                            <span>ოპერატორი ბეჭდავს...</span>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Bottom Rounded Input Bar */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                      }}
                      className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => handleSend("0% განვადების პირობები")}
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                        title="დამატებითი მოქმედებები"
                      >
                        <Plus size={16} />
                      </button>

                      <input
                        type="text"
                        value={inputMsg}
                        onChange={handleInputChange}
                        placeholder="Ask me anything..."
                        className="flex-1 h-10 px-4 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all placeholder:text-slate-400"
                      />

                      <button
                        type="submit"
                        className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all shadow-sm shadow-blue-500/20"
                      >
                        <Send size={14} />
                      </button>
                    </form>

                  </div>
                )}

              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger Button in Spilo Deep Slate / Blue Theme */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`p-3.5 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 border ${
            isOpen
              ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-400/40 shadow-blue-500/30"
              : "bg-[#111111] hover:bg-black text-white border-white/20"
          }`}
          title={isOpen ? "ჩათის დახურვა" : "დახმარება & ჩატი"}
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          )}
        </button>

      </div>
    </>
  );
}

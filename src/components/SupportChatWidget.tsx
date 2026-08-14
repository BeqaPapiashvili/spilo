"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MessageSquare, X, Send, Bot, GitCompare, Minus, ThumbsUp, ThumbsDown, Plus, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { dataService } from "@/services/dataService";

interface Message {
  id: string;
  sender: "bot" | "user" | "admin";
  text: string;
  time: string;
  liked?: boolean;
}

export default function SupportChatWidget() {
  const { compareList, user } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat Flow Steps: "auth" -> "consent" -> "chat"
  const [chatStep, setChatStep] = useState<"auth" | "consent" | "chat">("auth");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "ზუმერული სალამი! მე მერი ვარ, Spilo-ს AI ექსპერტი, მუდმივად ვვითარდები და ვუმჯობესდები. თქვენი გამოცდილების გასამარტივებლად, მზად ვარ ვუპასუხო პროდუქტთან თუ შეკვეთის სტატუსთან დაკავშირებულ ნებისმიერ კითხვას 🪄",
      time: "ახლახანს",
    },
  ]);

  // Populate fields from user if logged in, but keep auth step active unless explicitly started
  useEffect(() => {
    if (user?.name && !guestName) {
      setGuestName(user.name);
    }
    if (user?.phone && !guestPhone) {
      setGuestPhone(user.phone);
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
  }, [messages, isOpen, chatStep]);

  // Load messages immediately on mount and sync on real-time updates
  useEffect(() => {
    const loadMessages = () => {
      const tickets = dataService.getSupportTickets();
      const currentTicket = ticketId
        ? tickets.find((t) => t.id === ticketId)
        : tickets[0];

      if (currentTicket && currentTicket.messages.length > 0) {
        const syncedMessages: Message[] = currentTicket.messages.map((m, idx) => ({
          id: `msg-${idx}-${m.time}`,
          sender: m.sender === "admin" ? "admin" : "user",
          text: m.text,
          time: m.time,
        }));
        setMessages([
          {
            id: "1",
            sender: "bot",
            text: "ზუმერული სალამი! მე მერი ვარ, Spilo-ს AI ექსპერტი, მუდმივად ვვითარდები და ვუმჯობესდები. თქვენი გამოცდილების გასამარტივებლად, მზად ვარ ვუპასუხო პროდუქტთან თუ შეკვეთის სტატუსთან დაკავშირებულ ნებისმიერ კითხვას 🪄",
            time: "ახლახანს",
          },
          ...syncedMessages,
        ]);
      }
    };

    loadMessages();
    const unsub = dataService.subscribe(() => {
      loadMessages();
    });
    return () => unsub();
  }, [ticketId]);

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
    setChatStep("consent");
  };

  const handleAcceptConsent = () => {
    setChatStep("chat");
  };

  const handleRejectConsent = () => {
    setIsOpen(false);
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

    // Send to dataService for Live Admin sync with Customer Name and Customer Phone!
    const formattedPhone = guestPhone.startsWith("+995") ? guestPhone : `+995 ${guestPhone}`;
    const id = dataService.addUserSupportMessage(
      guestName.trim() || "მომხმარებელი",
      formattedPhone,
      text,
      "ონლაინ კონსულტაცია",
      `${guestPhone.replace(/[^0-9]/g, "")}@spilo.ge`
    );
    setTicketId(id);

    // AI automated instant response
    setTimeout(() => {
      let replyText = "გმადლობთ შეტყობინებისთვის! ჩვენი კონსულტანტი მალე გიპასუხებთ.";
      
      const lower = text.toLowerCase();
      if (lower.includes("განვადება") || lower.includes("0%")) {
        replyText = "Spilo-ში მოქმედებს 0%-იანი ონლაინ განვადება საქართველოს ბანკში, TBC-სა და კრედოში. განვადებას ირჩევთ შეკვეთის გაფორმებისას!";
      } else if (lower.includes("მიწოდება") || lower.includes("მიტანა") || lower.includes("სად")) {
        replyText = "მიწოდება უფასოა მთელ საქართველოში! თბილისში მიწოდება ხდება იმავე დღეს, ხოლო რეგიონებში 1-2 სამუშაო დღეში.";
      } else if (lower.includes("გარანტია") || lower.includes("ორიგინალი")) {
        replyText = "ყველა პროდუქტი 100% ორიგინალია და მოჰყვება ოფიციალური მწარმოებლის გარანტია!";
      } else if (lower.includes("შეკვეთა") || lower.includes("სტატუს")) {
        replyText = "შეკვეთის სტატუსის შესამოწმებლად შეგიძლიათ მიუთითოთ შეკვეთის ID ან მობილურის ნომერი.";
      }

      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: replyText,
        time: new Date().toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botReply]);
    }, 600);
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
                background: "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(245,247,250,0.95) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              {/* Top Glass Bar */}
              <div className="flex items-center justify-between px-2 pt-1 pb-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-xs">
                  <div className="w-4 h-4 rounded-full bg-[#111111] text-white flex items-center justify-center text-[9px]">
                    N
                  </div>
                  <span className="text-[11px] text-slate-700">
                    Powered by <span className="text-slate-900">Spilo</span>
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
                    {/* Decorative Concentric Rings Top Right */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 pointer-events-none opacity-40">
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="70" cy="30" r="30" stroke="#FDBA74" strokeWidth="2.5" />
                        <circle cx="70" cy="30" r="42" stroke="#FDBA74" strokeWidth="2.5" />
                        <circle cx="70" cy="30" r="54" stroke="#FDBA74" strokeWidth="2.5" />
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
                            className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50/40 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E8592A]/30 focus:border-[#E8592A] transition-all placeholder:text-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-700 mb-1.5">მობილური ნომერი</label>
                          <div className="flex gap-2">
                            <div className="h-11 px-3 rounded-2xl border border-slate-200 bg-slate-50/40 flex items-center gap-1.5 text-xs text-slate-700">
                              <span>GE +995</span>
                              <ChevronDown size={12} className="text-slate-400" />
                            </div>
                            <input
                              type="tel"
                              value={guestPhone}
                              onChange={(e) => setGuestPhone(e.target.value)}
                              placeholder="5XX XX XX XX"
                              required
                              className="flex-1 h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50/40 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E8592A]/30 focus:border-[#E8592A] transition-all placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full h-12 bg-[#E8592A] hover:bg-[#D94C1D] text-white rounded-2xl text-xs sm:text-sm cursor-pointer transition-all shadow-md shadow-[#E8592A]/20 mt-4 active:scale-[0.98]"
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
                        className="h-11 rounded-2xl bg-[#E8592A] hover:bg-[#D94C1D] text-white text-xs cursor-pointer transition-all shadow-md shadow-[#E8592A]/20"
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
                    <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 overflow-hidden flex items-center justify-center">
                            <img
                              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face"
                              alt="მერი"
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face";
                              }}
                            />
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                        </div>
                        <div>
                          <h4 className="text-xs text-slate-900">მერი</h4>
                          <p className="text-[10px] text-slate-500">AI ექსპერტი</p>
                        </div>
                      </div>
                    </div>

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
                              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-1 border border-slate-200">
                                <img
                                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face"
                                  alt="მერი"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div className={`max-w-[82%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                              <div
                                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                                  isUser
                                    ? "bg-[#E8592A] text-white rounded-tr-none shadow-xs"
                                    : "bg-[#F2F4F8] text-slate-800 rounded-tl-none border border-slate-100"
                                }`}
                              >
                                <p>{msg.text}</p>
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

                      {/* Quick Action Chips */}
                      <div className="flex items-center gap-2 pt-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleSend("კონსულტაცია")}
                          className="px-3.5 py-1.5 rounded-full border border-[#E8592A] text-[#E8592A] hover:bg-[#E8592A]/5 text-xs cursor-pointer transition-colors"
                        >
                          კონსულტაცია
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSend("შეკვეთის გადამოწმება")}
                          className="px-3.5 py-1.5 rounded-full border border-[#E8592A] text-[#E8592A] hover:bg-[#E8592A]/5 text-xs cursor-pointer transition-colors"
                        >
                          შეკვეთის გადამოწმება
                        </button>
                      </div>

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
                        onChange={(e) => setInputMsg(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1 h-10 px-4 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E8592A]/30 focus:border-[#E8592A] transition-all placeholder:text-slate-400"
                      />

                      <button
                        type="submit"
                        className="w-10 h-10 bg-[#E8592A] hover:bg-[#D94C1D] text-white rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all shadow-sm shadow-[#E8592A]/20"
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

        {/* Floating Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`p-3.5 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 border ${
            isOpen
              ? "bg-[#E8592A] hover:bg-[#D94C1D] text-white border-orange-400/30"
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

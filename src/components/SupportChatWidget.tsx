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
  ShieldCheck,
  Image as ImageIcon,
  Video,
  FileText,
  Download,
  Loader2,
  Paperclip,
  Sparkles,
  Headphones,
  Check,
  ChevronLeft
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export interface ChatAttachment {
  type: "image" | "video" | "file";
  url: string;
  name: string;
  size?: string;
}

interface Message {
  id: string;
  sender: "user" | "bot" | "admin";
  text: string;
  time: string;
  adminName?: string;
  adminAvatar?: string;
  liked?: boolean | null;
  read?: boolean;
  attachment?: ChatAttachment;
}

/* Requested Custom Chat SVG Icon */
function CustomSpiloChatIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M3 5.983C3 4.888 3.895 4 5 4h14c1.105 0 2 .888 2 1.983v8.923a1.992 1.992 0 0 1-2 1.983h-6.6l-2.867 2.7c-.955.899-2.533.228-2.533-1.08v-1.62H5c-1.105 0-2-.888-2-1.983V5.983Zm5.706 3.809a1 1 0 1 0-1.412 1.417 1 1 0 1 0 1.412-1.417Zm2.585.002a1 1 0 1 1 .003 1.414 1 1 0 0 1-.003-1.414Zm5.415-.002a1 1 0 1 0-1.412 1.417 1 1 0 1 0 1.412-1.417Z"
        clipRule="evenodd"
      />
    </svg>
  );
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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isUserAtBottomRef = useRef(true);
  const prevMessageCountRef = useRef(1);
  const [customerId, setCustomerId] = useState<string>("");

  // Attachment Menu & Upload States
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileType, setSelectedFileType] = useState<"image" | "video" | "file">("image");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "მოგესალმებით Spilo-ს მხარდაჭერის ცენტრში! ონლაინ კონსულტანტი მზად არის დაგეხმაროთ",
      time: "ახლახანს",
    },
  ]);

  // Customer ID Initialization: 30-day persistent cookie & localStorage
  useEffect(() => {
    try {
      let cid = localStorage.getItem("spilo_chat_customer_id");
      if (!cid) {
        cid =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `cust_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem("spilo_chat_customer_id", cid);
        document.cookie = `spilo_chat_customer_id=${encodeURIComponent(
          cid
        )}; max-age=${30 * 24 * 60 * 60}; path=/; SameSite=Lax`;
      }
      setCustomerId(cid);
    } catch (e) {}
  }, []);

  // Lock body scroll on mobile only when chat is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  // Smooth helper to scroll to bottom
  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  // User scroll detection
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 80;
    isUserAtBottomRef.current = isNearBottom;
  };

  // Initial scroll when opening chat
  useEffect(() => {
    if (isOpen && chatStep === "chat") {
      isUserAtBottomRef.current = true;
      setTimeout(() => scrollToBottom(false), 50);
    }
  }, [isOpen, chatStep]);

  // Auto-scroll when new message added
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.sender === "user" || isUserAtBottomRef.current) {
        scrollToBottom(true);
        isUserAtBottomRef.current = true;
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  // Real-time synchronization: Polls /api/support ONLY when chat is OPEN
  useEffect(() => {
    if (!isOpen || chatStep !== "chat" || !customerId) return;

    let isMounted = true;

    const fetchTicket = async () => {
      try {
        const res = await fetch(
          `/api/support?customerId=${encodeURIComponent(customerId)}`
        );
        const json = await res.json();
        if (json.success && json.data && isMounted) {
          const current = json.data;
          setIsAdminTyping(Boolean(current.isAdminTyping));

          if (current.status === "CLOSED" || current.status === "RESOLVED") {
            setTicketId(null);
            try {
              localStorage.removeItem("spilo_chat_session");
            } catch (e) {}
            setChatStep("auth");
            return;
          }

          if (!ticketId && current.id) {
            setTicketId(current.id);
            saveSessionToStorage(guestName, guestPhone, current.id);
          }

          if (Array.isArray(current.messages) && current.messages.length > 0) {
            const newMsgList: Message[] = [
              {
                id: "1",
                sender: "bot",
                text: "მოგესალმებით Spilo-ს მხარდაჭერის ცენტრში! ონლაინ კონსულტანტი მზად არის დაგეხმაროთ",
                time: "ახლახანს",
              },
              ...current.messages.map((m: any, idx: number) => ({
                id: m.id || `msg-${idx}`,
                sender: m.sender,
                text: m.text,
                time: m.time,
                adminName: m.adminName,
                adminAvatar: m.adminAvatar,
                read: m.read,
                liked: m.liked,
                attachment: m.attachment,
              })),
            ];

            setMessages((prev) => {
              if (prev.length === newMsgList.length) {
                const lastOld = prev[prev.length - 1];
                const lastNew = newMsgList[newMsgList.length - 1];
                if (
                  lastOld &&
                  lastNew &&
                  lastOld.text === lastNew.text &&
                  lastOld.read === lastNew.read &&
                  lastOld.liked === lastNew.liked &&
                  lastOld.adminName === lastNew.adminName
                ) {
                  return prev;
                }
              }
              return newMsgList;
            });
          }
        }
      } catch (err) {
        console.warn("fetchTicket error:", err);
      }
    };

    fetchTicket();
    const pollInterval = setInterval(fetchTicket, 2500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [isOpen, chatStep, customerId, ticketId, guestName, guestPhone]);

  const saveSessionToStorage = (
    name: string,
    phone: string,
    activeId: string | null
  ) => {
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

  const handleAcceptConsent = async () => {
    const formattedPhone = guestPhone.startsWith("+995")
      ? guestPhone
      : `+995 ${guestPhone}`;
    setChatStep("chat");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          userName: guestName.trim() || "მომხმარებელი",
          userPhone: formattedPhone,
          messageText: "მოგესალმებით, მზად ვარ კონსულტაციისთვის",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTicketId(json.data.id);
        saveSessionToStorage(guestName, guestPhone, json.data.id);
      }
    } catch (err) {
      console.error("handleAcceptConsent error:", err);
    }
  };

  const handleRejectConsent = () => {
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMsg(e.target.value);
    if (ticketId) {
      fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ticketId, customerId, isUserTyping: true }),
      }).catch(() => {});

      if (userTypingTimeoutRef.current) clearTimeout(userTypingTimeoutRef.current);
      userTypingTimeoutRef.current = setTimeout(() => {
        fetch("/api/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: ticketId,
            customerId,
            isUserTyping: false,
          }),
        }).catch(() => {});
      }, 2500);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const timeStr = new Date().toLocaleTimeString("ka-GE", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg("");

    const formattedPhone = guestPhone.startsWith("+995")
      ? guestPhone
      : `+995 ${guestPhone}`;
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ticketId || undefined,
          customerId,
          userName: guestName.trim() || "მომხმარებელი",
          userPhone: formattedPhone,
          messageText: text,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        if (!ticketId) setTicketId(json.data.id);
        saveSessionToStorage(guestName, guestPhone, json.data.id);
      }
    } catch (err) {
      console.error("handleSend error:", err);
    }
  };

  const handleTriggerFileUpload = (type: "image" | "video" | "file") => {
    setSelectedFileType(type);
    setIsAttachmentMenuOpen(false);
    if (fileInputRef.current) {
      if (type === "image") {
        fileInputRef.current.accept = "image/*";
      } else if (type === "video") {
        fileInputRef.current.accept = "video/*";
      } else {
        fileInputRef.current.accept =
          ".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar";
      }
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!data.success || !data.url) {
        alert(data.error || "ფაილის ატვირთვა ვერ მოხერხდა");
        return;
      }

      const fileUrl = data.url;

      const fileSizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(0)} KB`;

      const attachment: ChatAttachment = {
        type: selectedFileType,
        url: fileUrl,
        name: file.name,
        size: fileSizeStr,
      };

      const timeStr = new Date().toLocaleTimeString("ka-GE", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const userMessage: Message = {
        id: Date.now().toString(),
        sender: "user",
        text:
          selectedFileType === "image"
            ? "📷 სურათი"
            : selectedFileType === "video"
            ? "🎥 ვიდეო"
            : `📄 ${file.name}`,
        time: timeStr,
        attachment,
      };

      setMessages((prev) => [...prev, userMessage]);

      const formattedPhone = guestPhone.startsWith("+995")
        ? guestPhone
        : `+995 ${guestPhone}`;
      const supportRes = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ticketId || undefined,
          customerId,
          userName: guestName.trim() || "მომხმარებელი",
          userPhone: formattedPhone,
          messageText: userMessage.text,
          attachment,
        }),
      });
      const json = await supportRes.json();
      if (json.success && json.data) {
        if (!ticketId) setTicketId(json.data.id);
        saveSessionToStorage(guestName, guestPhone, json.data.id);
      }
    } catch (err) {
      console.error("File upload error:", err);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  /* Render Chat Content Helper */
  const renderChatContent = (isMobile: boolean) => {
    return (
      <>
        {/* STEP 1: AUTHORIZATION */}
        {chatStep === "auth" && (
          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative Concentric Rings Top Right in Spilo Coral */}
            <div className="absolute -top-10 -right-10 w-40 h-40 pointer-events-none opacity-20">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="70" cy="30" r="30" stroke="#FF5238" strokeWidth="2.5" />
                <circle cx="70" cy="30" r="42" stroke="#FF5238" strokeWidth="2.5" />
                <circle cx="70" cy="30" r="54" stroke="#FF5238" strokeWidth="2.5" />
              </svg>
            </div>

            <div>
              <div className="mt-2 sm:mt-4 mb-4 sm:mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC] rounded-full text-xs mb-2">
                  <Headphones className="w-3.5 h-3.5" />
                  <span>ლაივ კონსულტაცია</span>
                </div>
                <h3 className="text-xl text-zinc-900 tracking-tight">ონლაინ მხარდაჭერა</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  შეიყვანეთ სახელი და ნომერი დასაკავშირებლად
                </p>
              </div>

              <form onSubmit={handleStartAuth} className="space-y-3.5">
                <div>
                  <label className="block text-xs text-zinc-700 mb-1">თქვენი სახელი</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="მაგ: გიორგი"
                    required
                    className="w-full h-11 px-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#FF5238]/20 focus:border-[#FF5238] transition-all placeholder:text-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-700 mb-1">ტელეფონის ნომერი</label>
                  <div className="flex gap-2">
                    <div className="h-11 px-3 rounded-2xl border border-zinc-200 bg-zinc-50/70 flex items-center gap-1 text-xs text-zinc-700 shrink-0">
                      <span>+995</span>
                    </div>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="5XX XX XX XX"
                      required
                      className="flex-1 h-11 px-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 text-xs text-zinc-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#FF5238]/20 focus:border-[#FF5238] transition-all placeholder:text-zinc-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-2xl text-xs sm:text-sm cursor-pointer transition-all shadow-md shadow-[#FF5238]/20 mt-4 active:scale-[0.98] flex items-center justify-center"
                >
                  კონსულტაციის დაწყება
                </button>
              </form>
            </div>

            <div className="text-center pt-2">
              <p className="text-[10px] text-zinc-400">Spilo 24/7 Customer Live Support</p>
            </div>
          </div>
        )}

        {/* STEP 2: CONSENT */}
        {chatStep === "consent" && (
          <div className="p-6 flex-1 flex flex-col justify-center text-left overflow-hidden">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF5F2] text-[#FF5238] flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg text-zinc-900 tracking-tight mb-2">თანხმობის მოთხოვნა</h3>
            <p className="text-xs text-zinc-600 leading-relaxed mb-6">
              მოგესალმებით, გაცნობებთ, რომ ჩატში თქვენს მიერ მითითებული/მოწერილი ინფორმაცია მომართვის დამუშავებისა და ხარისხის კონტროლის მიზნით ინახება.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleRejectConsent}
                className="h-11 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs cursor-pointer transition-all"
              >
                უარყოფა
              </button>
              <button
                type="button"
                onClick={handleAcceptConsent}
                className="h-11 rounded-2xl bg-[#FF5238] hover:bg-[#EA3A20] text-white text-xs cursor-pointer transition-all shadow-md shadow-[#FF5238]/20"
              >
                თანხმობა
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ACTIVE CHAT */}
        {chatStep === "chat" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Agent Header Card */}
            {(() => {
              const lastAdminMsg = [...messages].reverse().find((m) => m.sender === "admin");
              const operatorName = lastAdminMsg?.adminName || "Spilo Support";
              const operatorAvatar =
                lastAdminMsg?.adminAvatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face";

              return (
                <div className="p-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-[#FF5238] p-0.5 overflow-hidden flex items-center justify-center">
                        <img
                          src={operatorAvatar}
                          alt={operatorName}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face";
                          }}
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>
                    <div>
                      <h4 className="text-xs text-zinc-900">{operatorName}</h4>
                      <p className="text-[10px] text-[#FF5238] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5238] animate-ping" />
                        <span>ონლაინ კონსულტანტი</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Chat Messages Feed with no-scrollbar */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/40 no-scrollbar"
            >
              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    {!isUser && (
                      <span className="text-[10px] text-zinc-400 mb-1 ml-1 font-sans">
                        {msg.adminName || "Spilo Support"}
                      </span>
                    )}

                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? "bg-[#FF5238] text-white rounded-tr-xs shadow-xs"
                          : "bg-white text-zinc-800 border border-zinc-200/80 rounded-tl-xs shadow-2xs"
                      }`}
                    >
                      {msg.text}

                      {/* Attachment Rendering */}
                      {msg.attachment && (
                        <div className="mt-2 pt-2 border-t border-black/10">
                          {msg.attachment.type === "image" ? (
                            <a
                              href={msg.attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block overflow-hidden rounded-xl bg-black/5"
                            >
                              <img
                                src={msg.attachment.url}
                                alt={msg.attachment.name}
                                className="max-h-52 w-full object-contain rounded-xl"
                              />
                            </a>
                          ) : msg.attachment.type === "video" ? (
                            <video
                              controls
                              playsInline
                              preload="metadata"
                              className="max-h-52 w-full rounded-xl bg-black"
                              src={msg.attachment.url}
                            />
                          ) : (
                            <a
                              href={msg.attachment.url}
                              download={msg.attachment.name}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 p-2 bg-black/5 rounded-xl hover:bg-black/10 transition-colors"
                            >
                              <FileText className="w-4 h-4 text-zinc-700 shrink-0" />
                              <span className="truncate flex-1 text-xs">{msg.attachment.name}</span>
                              <Download className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-zinc-400 mt-1 font-mono px-1">
                      {msg.time}
                    </span>
                  </div>
                );
              })}

              {/* Admin Typing Indicator */}
              {isAdminTyping && (
                <div className="flex items-center gap-1.5 p-2 bg-white border border-zinc-200/80 rounded-2xl rounded-tl-xs max-w-[80px] shadow-2xs">
                  <span className="w-1.5 h-1.5 bg-[#FF5238] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#FF5238] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#FF5238] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            {/* Quick Reply Chips */}
            <div className="px-3 py-1.5 bg-white border-t border-zinc-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {[
                "როდის ჩამაბარებენ?",
                "განვადება როგორ მუშაობს?",
                "ოპერატორთან დაკავშირება",
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(chip)}
                  className="px-2.5 py-1 rounded-full bg-[#FFF5F2] hover:bg-[#FFEAE5] text-[#FF5238] border border-[#FED7CC] text-[11px] whitespace-nowrap cursor-pointer transition-colors shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-2.5 bg-white border-t border-zinc-100 relative shrink-0">
              {/* Attachment Popup Menu */}
              {isAttachmentMenuOpen && (
                <div className="absolute bottom-14 left-3 bg-white rounded-2xl border border-zinc-200 shadow-xl p-1.5 z-30 flex flex-col gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleTriggerFileUpload("image")}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 rounded-xl text-zinc-700 cursor-pointer"
                  >
                    <ImageIcon size={14} className="text-[#FF5238]" />
                    <span>ფოტო</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerFileUpload("file")}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 rounded-xl text-zinc-700 cursor-pointer"
                  >
                    <FileText size={14} className="text-zinc-600" />
                    <span>დოკუმენტი</span>
                  </button>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                  className="p-2 text-zinc-400 hover:text-[#FF5238] rounded-full hover:bg-zinc-100 transition-colors cursor-pointer shrink-0"
                  title="ფაილის მიმაგრება"
                  aria-label="ფაილის მიმაგრება"
                >
                  <Paperclip size={16} />
                </button>

                <input
                  type="text"
                  value={inputMsg}
                  onChange={handleInputChange}
                  placeholder="ჩაწერეთ შეკითხვა..."
                  className="flex-1 h-10 px-4 bg-zinc-50 border border-zinc-200 rounded-full text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#FF5238]/20 focus:border-[#FF5238] transition-all placeholder:text-zinc-400"
                />

                <button
                  type="submit"
                  disabled={isUploading || !inputMsg.trim()}
                  className="w-10 h-10 bg-[#FF5238] hover:bg-[#EA3A20] disabled:opacity-40 disabled:hover:bg-[#FF5238] text-white rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all shadow-sm shadow-[#FF5238]/20"
                  aria-label="გაგზავნა"
                >
                  {isUploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* =========================================================
          1. MOBILE FULL SCREEN MODAL (sm:hidden)
          ========================================================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="sm:hidden fixed inset-0 z-50 bg-white flex flex-col h-[100dvh] overflow-hidden select-none"
          >
            {/* Mobile Top Header Bar */}
            <div className="px-4 py-3 bg-[#1D1D1F] text-white flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                <div className="w-4 h-4 rounded-full bg-[#FF5238] text-white flex items-center justify-center text-[9px]">
                  S
                </div>
                <span className="text-[12px] text-white">
                  Spilo <span className="text-[#FF5238]">მხარდაჭერა</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
                aria-label="დახურვა"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mobile Chat Body */}
            <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
              {renderChatContent(true)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          2. DESKTOP FLOATING ISLAND (Bottom-Right) (Exact Original)
          ========================================================= */}
      <div
        className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-2.5 select-none ${
          isOpen ? "hidden sm:flex" : "flex"
        }`}
      >
        {/* Floating Compare Button */}
        <Link
          href="/compare"
          className="relative bg-[#111111] hover:bg-black text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 border border-white/10 active:scale-95"
          title="პროდუქტების შედარება"
        >
          <GitCompare className="w-5 h-5 text-white" />
          {compareList.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FF5238] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#111111] font-mono shadow-xs">
              {compareList.length}
            </span>
          )}
        </Link>

        {/* Desktop Chat Window (hidden on mobile, rendered cleanly on desktop) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="hidden sm:flex w-[380px] h-[520px] rounded-[36px] p-3 flex-col justify-between relative shadow-[0_25px_70px_-15px_rgba(0,0,0,0.25)] border border-white/80 overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,245,242,0.95) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              {/* Top Glass Header Bar */}
              <div className="flex items-center justify-between px-2 pt-1 pb-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#FED7CC] shadow-2xs">
                  <div className="w-4 h-4 rounded-full bg-[#FF5238] text-white flex items-center justify-center text-[9px]">
                    S
                  </div>
                  <span className="text-[11px] text-zinc-700">
                    Spilo <span className="text-[#FF5238]">მხარდაჭერა</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200/80 shadow-2xs flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  title="ჩათის ჩაკეცვა"
                >
                  <Minus size={14} />
                </button>
              </div>

              {/* Inner Main Card Container */}
              <div className="flex-1 bg-white rounded-[28px] border border-zinc-100/90 shadow-2xs relative overflow-hidden flex flex-col">
                {renderChatContent(false)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Chat Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 border relative active:scale-95 ${
            isOpen
              ? "bg-[#FF5238] hover:bg-[#EA3A20] text-white border-[#FED7CC] shadow-[#FF5238]/30"
              : "bg-[#111111] hover:bg-black text-white border-white/15"
          }`}
          title={isOpen ? "ჩათის დახურვა" : "დახმარება & ჩატი"}
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <>
              <CustomSpiloChatIcon className="w-6 h-6 text-white" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FF5238] rounded-full ring-2 ring-[#111111] animate-pulse" />
            </>
          )}
        </button>

      </div>
    </>
  );
}

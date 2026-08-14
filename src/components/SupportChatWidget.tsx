"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, X, Send, Bot, GitCompare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
}

export default function SupportChatWidget() {
  const { compareList } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "გამარჯობა! 👋 მე ვარ spilo-ს ასისტენტი. რით შემიძლია დაგეხმაროთ?",
      time: "ახლახანს",
    },
  ]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text,
      time: new Date().toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg("");

    setTimeout(() => {
      let replyText = "გმადლობთ კითხვისთვის! ჩვენი კონსულტანტი მალე დაგიკავშირდებათ. ოპერატორის ცხელი ხაზი: (032) 2 00 00 00.";
      
      const lower = text.toLowerCase();
      if (lower.includes("განვადება") || lower.includes("0%")) {
        replyText = "spilo-ში მოქმედებს 0%-იანი ონლაინ განვადება საქართველოს ბანკში, TBC-სა და კრედოში. განვადებას ირჩევთ შეკვეთის გაფორმებისას!";
      } else if (lower.includes("მიწოდება") || lower.includes("მიტანა") || lower.includes("ფასი")) {
        replyText = "მიწოდება უფასოა მთელ საქართველოში! თბილისში მიწოდება ხდება იმავე დღეს, ხოლო რეგიონებში 1-2 სამუშაო დღეში.";
      } else if (lower.includes("გარანტია") || lower.includes("ორიგინალი")) {
        replyText = "ყველა პროდუქტი 100% ორიგინალია და მოჰყვება ოფიციალური მწარმოებლის გარანტია!";
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

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-3">
      
      {/* Floating Sticky Compare Button (positioned directly above help icon) */}
      <Link
        href="/compare"
        className="relative bg-[#111111] hover:bg-black text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-110 border border-white/20"
        title="პროდუქტების შედარება"
      >
        <GitCompare className="w-5 h-5 text-blue-400" />
        {compareList.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-[#111111]">
            {compareList.length}
          </span>
        )}
      </Link>

      {/* Floating Toggle Help Button (Icon Only) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="bg-[#111111] hover:bg-black text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-110 border border-white/20"
            title="დახმარება & ჩატი"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-[28px] shadow-2xl border border-gray-100 w-[340px] sm:w-[380px] h-[480px] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#111111] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm">spilo მხარდაჭერა</h4>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ონლაინშია</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Question Chips */}
            <div className="bg-[#F8FAFC] px-3 py-2 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto text-[11px] text-gray-700">
              <button
                onClick={() => handleSend("როგორ მოქმედებს 0% განვადება?")}
                className="bg-white px-2.5 py-1 rounded-full border border-gray-200 hover:border-blue-500 whitespace-nowrap cursor-pointer transition-colors"
              >
                💳 0% განვადება
              </button>
              <button
                onClick={() => handleSend("რამდენ ხანში მოვა მიწოდება?")}
                className="bg-white px-2.5 py-1 rounded-full border border-gray-200 hover:border-blue-500 whitespace-nowrap cursor-pointer transition-colors"
              >
                🚚 მიწოდება
              </button>
              <button
                onClick={() => handleSend("ორიგინალია პროდუქცია?")}
                className="bg-white px-2.5 py-1 rounded-full border border-gray-200 hover:border-blue-500 whitespace-nowrap cursor-pointer transition-colors"
              >
                🛡️ გარანტია
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-900 shadow-xs border border-gray-100 rounded-bl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 ${
                        msg.sender === "user" ? "text-blue-200" : "text-gray-400"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="ჩაწერთ შეკითხვა..."
                className="flex-1 h-10 px-3.5 bg-[#F1F3F6] rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

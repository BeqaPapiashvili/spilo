"use client";

import React, { useState, useEffect } from "react";
import { Headphones, MessageSquare, Send, CheckCircle2, X } from "lucide-react";
import { dataService, SupportTicket } from "@/services/dataService";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    setTickets(dataService.getSupportTickets());
    const unsub = dataService.subscribe(() => {
      setTickets(dataService.getSupportTickets());
    });
    return () => unsub();
  }, []);

  const activeTicket = tickets.find((t) => t.id === activeTicketId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketId || !replyText.trim()) return;

    dataService.addSupportReply(activeTicketId, replyText.trim());
    setReplyText("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">მხარდაჭერის ჩათი (Live Support)</h1>
          <p className="text-xs text-gray-500 mt-1">მომხმარებელთა შეკითხვები, რეალური ჩათი და პასუხების გაგზავნა.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-100">
            აქტიური ბილეთები ({tickets.length})
          </h3>
          <div className="space-y-2">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTicketId(t.id)}
                className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  activeTicketId === t.id
                    ? "bg-blue-50 border-blue-500/40 text-blue-900"
                    : "bg-gray-50/80 border-gray-200 hover:bg-gray-100/60 text-gray-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{t.customerName}</span>
                  <span className="text-[10px] text-gray-400">{t.time}</span>
                </div>
                <p className="text-xs text-gray-600 truncate mt-1">{t.topic}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Box */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 flex flex-col justify-between min-h-[400px]">
          {activeTicket ? (
            <>
              <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{activeTicket.customerName}</h3>
                  <p className="text-xs text-gray-500">{activeTicket.topic}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px]">
                  {activeTicket.status}
                </span>
              </div>

              {/* Messages area */}
              <div className="flex-1 my-4 space-y-3 overflow-y-auto max-h-[300px] p-2 bg-gray-50 rounded-xl">
                {activeTicket.messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === "admin" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                        m.sender === "admin"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-xs"
                      }`}
                    >
                      <p>{m.text}</p>
                    </div>
                    <span className="text-[9px] text-gray-400 mt-0.5 px-1">{m.time}</span>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="flex gap-2 pt-2 border-t border-gray-100">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="ჩაწერეთ პასუხი მომხმარებლისთვის..."
                  className="flex-1 h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-4 h-4" />
                  <span>გაგზავნა</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 text-gray-300" />
              <p>აირჩიეთ ბილეთი მარცხენა სიიდან ჩათის დასაწყებად</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

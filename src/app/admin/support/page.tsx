"use client";

import React, { useState } from "react";
import { Headphones, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState([
    { id: "conv-1", customer: "Beka Papiashvili", topic: "iPhone 16 Pro-ს მიწოდების ვადა", status: "OPEN", time: "10:30" },
    { id: "conv-2", customer: "Nino Beridze", topic: "განვადების დამტკიცების კითხვა", status: "OPEN", time: "09:45" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">მხარდაჭერის ჩათი (Live Support)</h1>
          <p className="text-xs text-gray-500 mt-1">მომხმარებელთა შეკითხვები, ჩათი და ბილეთების მართვა.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conversations.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-900">{c.customer}</span>
              <span className="text-[10px] text-gray-400">{c.time}</span>
            </div>
            <p className="text-xs text-gray-700 font-medium">{c.topic}</p>
            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl cursor-pointer">
                ჩათში შესვლა
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

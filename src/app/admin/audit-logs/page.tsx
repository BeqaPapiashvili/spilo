"use client";

import React, { useState, useEffect } from "react";
import { History, Search } from "lucide-react";
import { dataService, AuditLog } from "@/services/dataService";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLogs(dataService.getAuditLogs());
    const unsub = dataService.subscribe(() => {
      setLogs(dataService.getAuditLogs());
    });
    return () => unsub();
  }, []);

  const filtered = logs.filter(
    (l) =>
      !searchQuery ||
      l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Audit Log (მოქმედებების ისტორია)</h1>
          <p className="text-xs text-gray-500 mt-1">ადმინისტრატორების მიერ განხორციელებული ყველა ცვლილების უსაფრთხოების ჟურნალი.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ძიება ისტორიაში..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-xs text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50 uppercase text-[10px] text-gray-500 border-b border-gray-100">
            <tr>
              <th className="py-3 px-4">თარიღი/დრო</th>
              <th className="py-3 px-4">ადმინი</th>
              <th className="py-3 px-4">მოქმედება</th>
              <th className="py-3 px-4">ობიექტი</th>
              <th className="py-3 px-4">დეტალები</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3 px-4 font-mono text-gray-500">{log.timestamp}</td>
                <td className="py-3 px-4 font-semibold text-gray-900">{log.userName}</td>
                <td className="py-3 px-4 font-mono text-blue-600 font-bold">{log.action}</td>
                <td className="py-3 px-4 font-semibold text-gray-800">{log.entity}</td>
                <td className="py-3 px-4 text-gray-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

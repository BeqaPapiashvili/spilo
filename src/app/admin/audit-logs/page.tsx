"use client";

import React, { useState, useEffect } from "react";
import { History, Search, Shield, Package, ShoppingBag, Tag, Settings, Globe, User, Loader2 } from "lucide-react";

interface AuditLogItem {
  id: string;
  userId?: string;
  adminEmail: string;
  adminName?: string;
  userName?: string;
  userEmail?: string;
  action: string;
  entity?: string;
  target?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  createdAt: string;
}

const ACTION_ICON: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  PRODUCT_SAVE: { icon: <Package className="w-3.5 h-3.5" />, color: "text-indigo-600", bg: "bg-indigo-50" },
  PRODUCT_CREATE: { icon: <Package className="w-3.5 h-3.5" />, color: "text-blue-600", bg: "bg-blue-50" },
  STOCK_UPDATE: { icon: <Package className="w-3.5 h-3.5" />, color: "text-amber-600", bg: "bg-amber-50" },
  ORDER_STATUS_UPDATE: { icon: <ShoppingBag className="w-3.5 h-3.5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
  PROMOTION_SAVE: { icon: <Tag className="w-3.5 h-3.5" />, color: "text-purple-600", bg: "bg-purple-50" },
  SETTINGS_UPDATE: { icon: <Settings className="w-3.5 h-3.5" />, color: "text-slate-600", bg: "bg-slate-50" },
  LOGIN: { icon: <User className="w-3.5 h-3.5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
  DEFAULT: { icon: <Shield className="w-3.5 h-3.5" />, color: "text-blue-600", bg: "bg-blue-50" },
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const url = selectedAction === "ALL" ? "/api/admin/audit-logs" : `/api/admin/audit-logs?action=${encodeURIComponent(selectedAction)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLogs(json.data);
      }
    } catch (err) {
      console.error("AdminAuditLogsPage: Failed to load audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedAction]);

  const filtered = logs.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      l.adminEmail.toLowerCase().includes(q) ||
      (l.adminName && l.adminName.toLowerCase().includes(q)) ||
      l.action.toLowerCase().includes(q) ||
      (l.target && l.target.toLowerCase().includes(q)) ||
      (l.details && l.details.toLowerCase().includes(q)) ||
      (l.ipAddress && l.ipAddress.includes(q))
    );
  });

  return (
    <div className="space-y-6">

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            <History className="w-3.5 h-3.5" />
            <span>სისტემური უსაფრთხოება</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
            Audit ლოგები ({filtered.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            ადმინისტრატორების ყველა მოქმედების, ავტორიზაციისა და ცვლილებების რეალური ისტორია MySQL ბაზაში.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <History className="w-4 h-4" />
          <span>განახლება</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ძებნა: ადმინი, მოქმედება, სამიზნე, IP..."
            className="w-full h-10 pl-9 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">ყველა მოქმედება</option>
            <option value="PRODUCT_CREATE">PRODUCT_CREATE</option>
            <option value="PRODUCT_UPDATE">PRODUCT_UPDATE</option>
            <option value="STOCK_UPDATE">STOCK_UPDATE</option>
            <option value="ORDER_STATUS_UPDATE">ORDER_STATUS_UPDATE</option>
            <option value="COUPON_CREATE">COUPON_CREATE</option>
            <option value="LOGIN">LOGIN</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <span>იტვირთება Audit ლოგები...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Shield className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm text-slate-700">Audit ჩანაწერები ვერ მოიძებნა</h3>
            <p className="text-xs text-slate-400">მონაცემთა ბაზაში ახალი ლოგები არ არის</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">დრო</th>
                  <th className="py-3.5 px-4">ადმინისტრატორი</th>
                  <th className="py-3.5 px-4">მოქმედება</th>
                  <th className="py-3.5 px-4">ობიექტი / სამიზნე</th>
                  <th className="py-3.5 px-4">დეტალები</th>
                  <th className="py-3.5 px-4">IP მისამართი</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filtered.map((log) => {
                  const cfg = ACTION_ICON[log.action] || ACTION_ICON.DEFAULT;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("ka-GE")}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-[11px]">
                            {log.adminName ? log.adminName[0].toUpperCase() : "A"}
                          </div>
                          <div>
                            <p className="text-slate-900 leading-tight">{log.adminName || log.adminEmail}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{log.adminEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon}
                          <span className="font-mono">{log.action}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-900">
                        {log.entity && <span className="text-slate-400 mr-1">[{log.entity}]</span>}
                        <span>{log.target || "-"}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[280px] truncate">
                        {log.details || "-"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {log.ipAddress ? (
                          <span className="inline-flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span>{log.ipAddress}</span>
                          </span>
                        ) : (
                          "127.0.0.1"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

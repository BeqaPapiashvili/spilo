"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Plus, Users, Check, X, Lock } from "lucide-react";
import { dataService, AdminUser, Role } from "@/services/dataService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    setUsers(dataService.getAdminUsers());
    setRoles(dataService.getRoles());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ადმინები & როლები (RBAC)</h1>
          <p className="text-xs text-gray-500 mt-1">თანამშრომლების ანგარიშები, როლები და Granular Permissions მატრიცა.</p>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">ადმინისტრატორების სია</h3>
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px]">
            <tr>
              <th className="py-2.5 px-3">სახელი</th>
              <th className="py-2.5 px-3">ელ-ფოსტა</th>
              <th className="py-2.5 px-3">როლი</th>
              <th className="py-2.5 px-3">სტატუსი</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-3 px-3 font-bold text-gray-900">{u.name}</td>
                <td className="py-3 px-3 text-gray-600">{u.email}</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-full">{u.roleName}</span></td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full">{u.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">როლების ნებართვების მატრიცა (Permissions Matrix)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((r) => (
            <div key={r.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-2">
              <h4 className="text-xs font-bold text-gray-900">{r.name}</h4>
              <p className="text-[11px] text-gray-500">{r.description}</p>
              <div className="pt-2 border-t border-gray-200 space-y-1">
                {r.permissions.map((perm, idx) => (
                  <span key={idx} className="inline-block px-2 py-0.5 bg-white text-gray-700 border border-gray-200 text-[10px] font-mono rounded mr-1 mb-1">
                    ✓ {perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

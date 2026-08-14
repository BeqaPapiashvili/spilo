"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, Check } from "lucide-react";
import { dataService, AdminUser, Role } from "@/services/dataService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    setUsers(dataService.getAdminUsers());
    setRoles(dataService.getRoles());
  }, []);

  const roleColors: Record<string, { badge: string }> = {
    "Super Admin": { badge: "adm-badge adm-badge-purple" },
    "Product Manager": { badge: "adm-badge adm-badge-blue" },
    "Order Manager": { badge: "adm-badge adm-badge-green" },
    "Content Manager": { badge: "adm-badge adm-badge-amber" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem" }}>
        <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}><ShieldCheck size={13} /> სისტემა</div>
        <h1 className="adm-page-title">ადმინები & როლები (RBAC)</h1>
        <p className="adm-page-desc">თანამშრომლების ანგარიშები, Role-Based Access Control და ნებართვების მართვა.</p>
      </div>

      {/* Users Table */}
      <div className="adm-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ fontSize: "0.875rem", color: "#0f172a" }}>ადმინისტრატორების სია</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>ადმინი</th>
                <th>ელ-ფოსტა</th>
                <th>ბოლო შესვლა</th>
                <th>როლი</th>
                <th>სტატუსი</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "linear-gradient(135deg, #4f46e5, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#fff", flexShrink: 0 }}>
                        {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "#0f172a" }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "#64748b", fontSize: "0.75rem" }}>{u.email}</td>
                  <td style={{ color: "#94a3b8", fontSize: "0.72rem" }}>{u.lastLogin || "—"}</td>
                  <td>
                    <span className={roleColors[u.roleName]?.badge || "adm-badge adm-badge-slate"}>
                      {u.roleName}
                    </span>
                  </td>
                  <td>
                    <span className={u.status === "ACTIVE" ? "adm-badge adm-badge-green" : "adm-badge adm-badge-red"}>
                      {u.status === "ACTIVE" ? "აქტიური" : "გათიშული"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roles Permissions Matrix */}
      <div className="adm-card" style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1.25rem", paddingBottom: "0.875rem", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ fontSize: "0.875rem", color: "#0f172a" }}>როლების ნებართვების მატრიცა (Permissions Matrix)</h3>
          <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "3px" }}>Granular Access Control — ყველა როლის დაშვებები</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.875rem" }}>
          {roles.map(r => (
            <div key={r.id} style={{ padding: "1.25rem", borderRadius: "0.875rem", border: "1px solid #f1f5f9", background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
                <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Lock size={13} style={{ color: "#6366f1" }} />
                </div>
                <h4 style={{ fontSize: "0.8rem", color: "#0f172a" }}>{r.name}</h4>
              </div>
              <p style={{ fontSize: "0.68rem", color: "#94a3b8", marginBottom: "0.875rem" }}>{r.description}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                {r.permissions.map((perm, idx) => (
                  <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "0.2rem 0.5rem", borderRadius: "9999px", background: "#fff", border: "1px solid #e2e8f0", fontSize: "0.6rem", color: "#475569", fontFamily: "monospace" }}>
                    <Check size={9} style={{ color: "#16a34a" }} />{perm}
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

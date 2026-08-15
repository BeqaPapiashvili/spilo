"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, Check, Plus, Trash2, Edit3, Key, RefreshCw, X, Loader2 } from "lucide-react";
import { Role } from "@/services/dataService";

interface DBAdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE" | string;
  createdAt: string;
  updatedAt: string;
}

const ROLES_LIST: { id: string; name: string; description: string; permissions: string[] }[] = [
  {
    id: "SUPER_ADMIN",
    name: "Super Admin",
    description: "სრული წვდომა სისტემის ყველა ფუნქციაზე და პარამეტრზე.",
    permissions: ["all:read", "all:write", "users:manage", "settings:manage", "finance:full"],
  },
  {
    id: "STORE_MANAGER",
    name: "Store Manager",
    description: "შეკვეთების, პროდუქტების და მარკეტინგის სრული მართვა.",
    permissions: ["products:write", "orders:write", "marketing:write", "analytics:read"],
  },
  {
    id: "SUPPORT_AGENT",
    name: "Support Agent",
    description: "მომხმარებელთა მხარდაჭერა და ონლაინ ჩათის ოპერირება.",
    permissions: ["support:write", "orders:read", "customers:read"],
  },
  {
    id: "CATALOG_MANAGER",
    name: "Catalog Manager",
    description: "პროდუქტების, კატეგორიების და ბრენდების მართვა.",
    permissions: ["products:write", "categories:write", "brands:write", "inventory:write"],
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<DBAdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DBAdminUser | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STORE_MANAGER");
  const [status, setStatus] = useState("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Error fetching admin users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, status }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddOpen(false);
        setName("");
        setEmail("");
        setPassword("");
        setActionMessage("ადმინისტრატორი წარმატებით დაემატა!");
        setTimeout(() => setActionMessage(null), 3000);
        fetchUsers();
      } else {
        alert(data.error || "დამატება ვერ მოხერხდა");
      }
    } catch (err) {
      console.error("Add user error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedUser.id, name, email, role, status }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditOpen(false);
        setSelectedUser(null);
        setActionMessage("მონაცემები განახლდა!");
        setTimeout(() => setActionMessage(null), 3000);
        fetchUsers();
      } else {
        alert(data.error || "განახლება ვერ მოხერხდა");
      }
    } catch (err) {
      console.error("Edit user error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !password.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedUser.id, password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPasswordOpen(false);
        setPassword("");
        setSelectedUser(null);
        setActionMessage("პაროლი წარმატებით შეიცვალა!");
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        alert(data.error || "პაროლის შეცვლა ვერ მოხერხდა");
      }
    } catch (err) {
      console.error("Password update error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, userName: string) => {
    if (!confirm(`ნამდვილად გსურთ ადმინისტრატორ ${userName}-ს წაშლა?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage("ადმინისტრატორი წაიშალა!");
        setTimeout(() => setActionMessage(null), 3000);
        fetchUsers();
      } else {
        alert(data.error || "წაშლა ვერ მოხერხდა");
      }
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  const openEditModal = (u: DBAdminUser) => {
    setSelectedUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setStatus(u.status || "ACTIVE");
    setIsEditOpen(true);
  };

  const openPasswordModal = (u: DBAdminUser) => {
    setSelectedUser(u);
    setPassword("");
    setIsPasswordOpen(true);
  };

  const getRoleBadge = (roleKey: string) => {
    switch (roleKey) {
      case "SUPER_ADMIN":
        return <span className="adm-badge adm-badge-purple">Super Admin</span>;
      case "STORE_MANAGER":
        return <span className="adm-badge adm-badge-blue">Store Manager</span>;
      case "SUPPORT_AGENT":
        return <span className="adm-badge adm-badge-green">Support Agent</span>;
      case "CATALOG_MANAGER":
        return <span className="adm-badge adm-badge-amber">Catalog Manager</span>;
      default:
        return <span className="adm-badge adm-badge-slate">{roleKey}</span>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}><ShieldCheck size={13} /> სისტემა</div>
          <h1 className="adm-page-title">ადმინები & როლები (RBAC)</h1>
          <p className="adm-page-desc">თანამშრომლების ანგარიშები, Role-Based Access Control და ნებართვების მართვა.</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="adm-btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>განახლება</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setName("");
              setEmail("");
              setPassword("");
              setRole("STORE_MANAGER");
              setStatus("ACTIVE");
              setIsAddOpen(true);
            }}
            className="adm-btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
          >
            <Plus size={15} />
            <span>ახალი ადმინისტრატორი</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Check size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="adm-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "0.875rem", color: "#0f172a" }}>ადმინისტრატორების სია ({users.length})</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>ადმინი</th>
                <th>ელ-ფოსტა</th>
                <th>როლი</th>
                <th>სტატუსი</th>
                <th>თარიღი</th>
                <th style={{ textAlign: "right" }}>მოქმედება</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "linear-gradient(135deg, #4f46e5, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#fff", flexShrink: 0 }}>
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "#0f172a" }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "#64748b", fontSize: "0.75rem" }}>{u.email}</td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td>
                    <span className={u.status === "ACTIVE" ? "adm-badge adm-badge-green" : "adm-badge adm-badge-red"}>
                      {u.status === "ACTIVE" ? "აქტიური" : "გათიშული"}
                    </span>
                  </td>
                  <td style={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("ka-GE") : "—"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                      <button
                        type="button"
                        onClick={() => openEditModal(u)}
                        title="რედაქტირება"
                        className="adm-btn-secondary"
                        style={{ padding: "0.35rem 0.6rem", fontSize: "0.72rem" }}
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openPasswordModal(u)}
                        title="პაროლის შეცვლა"
                        className="adm-btn-secondary"
                        style={{ padding: "0.35rem 0.6rem", fontSize: "0.72rem" }}
                      >
                        <Key size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id, u.name)}
                        title="წაშლა"
                        className="adm-btn-secondary"
                        style={{ padding: "0.35rem 0.6rem", fontSize: "0.72rem", color: "#ef4444" }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
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
          <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "3px" }}>Granular Access Control — როლების დაშვებები და პრივილეგიები</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.875rem" }}>
          {ROLES_LIST.map((r) => (
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

      {/* 1. Add Admin Modal */}
      {isAddOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "1.25rem", width: "100%", maxWidth: "440px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "1rem", color: "#0f172a" }}>ახალი ადმინისტრატორის დამატება</h3>
              <button type="button" onClick={() => setIsAddOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <label className="adm-label">სრული სახელი *</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="გიორგი ბერიძე" className="adm-input" />
              </div>
              <div>
                <label className="adm-label">ელ-ფოსტა *</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@spilo.ge" className="adm-input" />
              </div>
              <div>
                <label className="adm-label">პაროლი *</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="adm-input" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label className="adm-label">როლი</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="adm-select" style={{ width: "100%" }}>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="STORE_MANAGER">Store Manager</option>
                    <option value="SUPPORT_AGENT">Support Agent</option>
                    <option value="CATALOG_MANAGER">Catalog Manager</option>
                  </select>
                </div>
                <div>
                  <label className="adm-label">სტატუსი</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="adm-select" style={{ width: "100%" }}>
                    <option value="ACTIVE">აქტიური</option>
                    <option value="INACTIVE">გათიშული</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setIsAddOpen(false)} className="adm-btn-secondary">
                  გაუქმება
                </button>
                <button type="submit" disabled={isSubmitting} className="adm-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>შენახვა</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Admin Modal */}
      {isEditOpen && selectedUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "1.25rem", width: "100%", maxWidth: "440px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "1rem", color: "#0f172a" }}>ადმინისტრატორის რედაქტირება</h3>
              <button type="button" onClick={() => setIsEditOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <label className="adm-label">სრული სახელი</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="adm-input" />
              </div>
              <div>
                <label className="adm-label">ელ-ფოსტა</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="adm-input" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label className="adm-label">როლი</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="adm-select" style={{ width: "100%" }}>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="STORE_MANAGER">Store Manager</option>
                    <option value="SUPPORT_AGENT">Support Agent</option>
                    <option value="CATALOG_MANAGER">Catalog Manager</option>
                  </select>
                </div>
                <div>
                  <label className="adm-label">სტატუსი</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="adm-select" style={{ width: "100%" }}>
                    <option value="ACTIVE">აქტიური</option>
                    <option value="INACTIVE">გათიშული</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setIsEditOpen(false)} className="adm-btn-secondary">
                  გაუქმება
                </button>
                <button type="submit" disabled={isSubmitting} className="adm-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>განახლება</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Change Password Modal */}
      {isPasswordOpen && selectedUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "1.25rem", width: "100%", maxWidth: "400px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "1rem", color: "#0f172a" }}>პაროლის განახლება ({selectedUser.name})</h3>
              <button type="button" onClick={() => setIsPasswordOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <label className="adm-label">ახალი პაროლი *</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="ახალი პაროლი" className="adm-input" />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setIsPasswordOpen(false)} className="adm-btn-secondary">
                  გაუქმება
                </button>
                <button type="submit" disabled={isSubmitting} className="adm-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                  <span>პაროლის შეცვლა</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

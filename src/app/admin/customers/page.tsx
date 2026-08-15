"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Users, 
  Mail, 
  Phone, 
  ShoppingBag, 
  ShieldCheck, 
  UserCheck, 
  Settings, 
  Crown, 
  Headphones, 
  Package, 
  X, 
  Check, 
  Plus, 
  Sparkles,
  Sliders
} from "lucide-react";
import { useStore } from "@/store/useStore";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: string;
  registeredAt?: string;
  ordersCount: number;
  totalSpent: number;
}

const ROLES_INFO = [
  { 
    key: "SUPER_ADMIN", 
    label: "Super Admin", 
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200", 
    icon: <Crown className="w-3.5 h-3.5 text-purple-600" />,
    desc: "სრული წვდომა სისტემის ყველა მოდულზე, ფინანსებსა და პარამეტრებზე"
  },
  { 
    key: "STORE_MANAGER", 
    label: "Store Manager", 
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200", 
    icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />,
    desc: "შეკვეთების, პროდუქტების, აქციებისა და კლიენტების მართვა"
  },
  { 
    key: "SUPPORT_AGENT", 
    label: "Support Agent", 
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200", 
    icon: <Headphones className="w-3.5 h-3.5 text-emerald-600" />,
    desc: "ჩატები, მხარდაჭერის თიკეტები და შეკვეთების სტატუსის კონტროლი"
  },
  { 
    key: "CATALOG_MANAGER", 
    label: "Catalog Manager", 
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200", 
    icon: <Package className="w-3.5 h-3.5 text-amber-600" />,
    desc: "მხოლოდ პროდუქტების, კატეგორიების და ბრენდების მართვა"
  },
  { 
    key: "CUSTOMER", 
    label: "Customer", 
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200", 
    icon: <Users className="w-3.5 h-3.5 text-slate-500" />,
    desc: "ჩვეულებრივი დარეგისტრირებული მყიდველი"
  },
];

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tabFilter, setTabFilter] = useState<"ALL" | "CUSTOMERS" | "STAFF">("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Role Edit Modal State
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [newRole, setNewRole] = useState("CUSTOMER");
  const [isUpdating, setIsUpdating] = useState(false);
  const { adminUser, addToast } = useStore();
  const isSuperAdmin = adminUser?.role === "SUPER_ADMIN";

  const fetchUsers = () => {
    setIsLoading(true);
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((resData) => {
        if (resData && resData.success && Array.isArray(resData.data)) {
          setUsers(resData.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsUpdating(true);

    try {
      const res = await fetch("/api/admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          email: selectedUser.email,
          role: newRole,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        useStore.getState().updateUserRole(selectedUser.email, newRole);
        addToast({
          title: "როლი განახლდა",
          message: `${selectedUser.name}-ს მიენიჭა ${newRole} უფლება`,
          type: "success",
        });
        setSelectedUser(null);
        fetchUsers();
      } else {
        addToast({
          title: "შეცდომა",
          message: resData.error || "როლის განახლება ვერ მოხერხდა",
          type: "error",
        });
      }
    } catch (err) {
      addToast({
        title: "შეცდომა",
        message: "სერვერთან კავშირი შეწყდა",
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      !searchQuery || 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (tabFilter === "CUSTOMERS") return u.role === "CUSTOMER";
    if (tabFilter === "STAFF") return u.role !== "CUSTOMER";

    return true;
  });

  const totalCustomers = users.filter((u) => u.role === "CUSTOMER").length;
  const totalStaff = users.filter((u) => u.role !== "CUSTOMER").length;
  const totalRevenue = users.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div className="space-y-6">

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>გუნდის & მომხმარებლების მენეჯერი</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
            მომხმარებლები & გუნდი ({users.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            მართეთ საიტის მომხმარებლები, მიანიჭეთ მენეჯერის, ჩატის და კატალოგის უფლებები.
          </p>
        </div>

        <div className="flex items-center gap-4 text-right shrink-0">
          <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200/80">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">ადმინისტრირება / გუნდი</p>
            <p className="text-lg text-purple-600 font-mono">{totalStaff} წევრი</p>
          </div>
          <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200/80">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">მყიდველები</p>
            <p className="text-lg text-blue-600 font-mono">{totalCustomers}</p>
          </div>
        </div>
      </div>

      {/* Tab Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ძიება: სახელი, ელ-ფოსტა, ტელეფონი..."
            className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setTabFilter("ALL")}
            className={`h-9 px-4 rounded-xl text-xs transition-all cursor-pointer ${
              tabFilter === "ALL" ? "bg-white text-slate-900 shadow-2xs font-mono" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ყველა ({users.length})
          </button>

          <button
            type="button"
            onClick={() => setTabFilter("STAFF")}
            className={`h-9 px-4 rounded-xl text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              tabFilter === "STAFF" ? "bg-white text-purple-700 shadow-2xs font-mono" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-purple-600" />
            <span>გუნდი / ადმინისტრაცია ({totalStaff})</span>
          </button>

          <button
            type="button"
            onClick={() => setTabFilter("CUSTOMERS")}
            className={`h-9 px-4 rounded-xl text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              tabFilter === "CUSTOMERS" ? "bg-white text-blue-600 shadow-2xs font-mono" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>მყიდველები ({totalCustomers})</span>
          </button>
        </div>

      </div>

      {/* Users List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6 font-normal">მომხმარებელი</th>
                  <th className="py-4 px-6 font-normal">როლი & უფლებები</th>
                  <th className="py-4 px-6 font-normal">კონტაქტი</th>
                  <th className="py-4 px-6 font-normal">შეკვეთები / დანახარჯი</th>
                  <th className="py-4 px-6 font-normal text-right">მოქმედება</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredUsers.map((user) => {
                  const initials = user.name.slice(0, 2).toUpperCase();
                  const roleConfig = ROLES_INFO.find((r) => r.key === user.role) || ROLES_INFO[4];

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Customer Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-mono shrink-0 shadow-2xs ${
                            user.role !== "CUSTOMER" ? "bg-purple-900 text-white" : "bg-slate-900 text-white"
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-xs text-slate-900">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-6">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${roleConfig.badgeBg}`}>
                          {roleConfig.icon}
                          <span>{roleConfig.label}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Orders & Spent */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <span className="text-xs text-slate-900 font-mono block">
                            {user.totalSpent.toLocaleString()} ₾
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {user.ordersCount} შეკვეთა
                          </span>
                        </div>
                      </td>

                      {/* Action: Change Role Button */}
                      <td className="py-4 px-6 text-right">
                        {isSuperAdmin ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                            }}
                            className="h-9 px-3.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-2xl text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span>როლის მინიჭება</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">მხოლოდ Super Admin</span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            მომხმარებელი ვერ მოიძებნა
          </div>
        )}
      </div>

      {/* Role & Permissions Assignment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-slate-100 shadow-2xl z-10 space-y-6 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base text-slate-900">როლის & უფლებების მინიჭება</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedUser.name} ({selectedUser.email})</p>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedUser(null)} 
                className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRoleChangeSubmit} className="space-y-4">
              <div className="space-y-3">
                <label className="block text-xs text-slate-500 uppercase tracking-wider font-mono">
                  აირჩიეთ თანამდებობა / როლი
                </label>

                <div className="space-y-2">
                  {ROLES_INFO.map((r) => {
                    const isSelected = newRole === r.key;

                    return (
                      <label
                        key={r.key}
                        onClick={() => setNewRole(r.key)}
                        className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/60 border-blue-600 shadow-2xs"
                            : "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="userRole"
                          value={r.key}
                          checked={isSelected}
                          onChange={() => setNewRole(r.key)}
                          className="mt-1 accent-blue-600"
                        />
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-900">{r.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] border ${r.badgeBg}`}>
                              {r.key}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">{r.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  {isUpdating ? "ინახება..." : "შენახვა MySQL ბაზაში"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

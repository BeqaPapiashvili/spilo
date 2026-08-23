"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Sliders,
  RefreshCw,
  Download,
  Calendar,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FilterX,
  CreditCard,
  TrendingUp,
  UserPlus,
  Trash2,
  Edit3,
  Lock,
  KeyRound,
  AlertTriangle,
  Loader2,
  ShieldAlert
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { CustomSelect, CustomSelectOption } from "@/components/admin/ui/CustomSelect";

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
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200/80", 
    icon: <Crown className="w-3.5 h-3.5 text-purple-600" />,
    desc: "სრული წვდომა სისტემის ყველა მოდულზე, ფინანსებსა და პარამეტრებზე"
  },
  { 
    key: "STORE_MANAGER", 
    label: "Store Manager", 
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200/80", 
    icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />,
    desc: "შეკვეთების, პროდუქტების, აქციებისა და კლიენტების მართვა"
  },
  { 
    key: "SUPPORT_AGENT", 
    label: "Support Agent", 
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80", 
    icon: <Headphones className="w-3.5 h-3.5 text-emerald-600" />,
    desc: "ჩატები, მხარდაჭერის თიკეტები და შეკვეთების სტატუსის კონტროლი"
  },
  { 
    key: "CATALOG_MANAGER", 
    label: "Catalog Manager", 
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80", 
    icon: <Package className="w-3.5 h-3.5 text-amber-600" />,
    desc: "მხოლოდ პროდუქტების, კატეგორიების და ბრენდების მართვა"
  },
  { 
    key: "CUSTOMER", 
    label: "Customer (მყიდველი)", 
    badgeBg: "bg-zinc-100 text-zinc-700 border-zinc-200/80", 
    icon: <Users className="w-3.5 h-3.5 text-zinc-500" />,
    desc: "ჩვეულებრივი დარეგისტრირებული ონლაინ მყიდველი"
  },
];

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [tabFilter, setTabFilter] = useState<"ALL" | "CUSTOMERS" | "STAFF">("ALL");
  const [sortBy, setSortBy] = useState("ORDERS_DESC");
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modals
  const [inspectingUser, setInspectingUser] = useState<UserRecord | null>(null);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "CUSTOMER",
    password: "",
  });

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
      .catch((err) => console.error("Failed to fetch customers:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open Edit Modal
  const handleOpenEdit = (u: UserRecord) => {
    setEditingUser(u);
    setFormData({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      address: u.address || "",
      role: u.role || "CUSTOMER",
      password: "",
    });
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      role: "CUSTOMER",
      password: "",
    });
    setIsCreateModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          role: formData.role,
          password: formData.password || undefined,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        addToast({
          title: "წარმატება",
          message: `${formData.name}-ს მონაცემები განახლდა`,
          type: "success",
        });
        setEditingUser(null);
        if (inspectingUser?.id === editingUser.id) {
          setInspectingUser({ ...inspectingUser, ...formData });
        }
        fetchUsers();
      } else {
        addToast({
          title: "შეცდომა",
          message: resData.error || "განახლება ვერ მოხერხდა",
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
      setIsSubmitting(false);
    }
  };

  // Save Create
  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (resData.success) {
        addToast({
          title: "შექმნილია",
          message: `მომხმარებელი ${formData.name} წარმატებით შეიქმნა`,
          type: "success",
        });
        setIsCreateModalOpen(false);
        fetchUsers();
      } else {
        addToast({
          title: "შეცდომა",
          message: resData.error || "შექმნა ვერ მოხერხდა",
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
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/customers?id=${encodeURIComponent(userToDelete.id)}&email=${encodeURIComponent(userToDelete.email)}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (resData.success) {
        addToast({
          title: "წაშლილია",
          message: `${userToDelete.name} წაიშალა ბაზიდან`,
          type: "success",
        });
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        if (inspectingUser?.id === userToDelete.id) {
          setInspectingUser(null);
        }
        setUserToDelete(null);
      } else {
        addToast({
          title: "შეცდომა",
          message: resData.error || "წაშლა ვერ მოხერხდა",
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
      setIsSubmitting(false);
    }
  };

  // Filter and Sort Logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = 
        !searchQuery.trim() || 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.includes(searchQuery) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (tabFilter === "CUSTOMERS" && u.role !== "CUSTOMER") return false;
      if (tabFilter === "STAFF" && u.role === "CUSTOMER") return false;

      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "ORDERS_DESC") return b.ordersCount - a.ordersCount;
      if (sortBy === "SPENT_DESC") return b.totalSpent - a.totalSpent;
      if (sortBy === "NAME_ASC") return a.name.localeCompare(b.name);
      if (sortBy === "DATE_DESC") return (b.registeredAt || "").localeCompare(a.registeredAt || "");
      return 0;
    });
  }, [users, searchQuery, tabFilter, roleFilter, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Metrics
  const totalCustomers = useMemo(() => users.filter((u) => u.role === "CUSTOMER").length, [users]);
  const totalStaff = useMemo(() => users.filter((u) => u.role !== "CUSTOMER").length, [users]);
  const buyersCount = useMemo(() => users.filter((u) => u.ordersCount > 0).length, [users]);
  const totalRevenue = useMemo(() => users.reduce((s, c) => s + c.totalSpent, 0), [users]);

  // Role Filter Options for CustomSelect
  const roleSelectOptions: CustomSelectOption[] = [
    { value: "ALL", label: "ყველა როლი" },
    { value: "CUSTOMER", label: "მყიდველი (Customer)", badge: `${totalCustomers}` },
    { value: "SUPER_ADMIN", label: "Super Admin" },
    { value: "STORE_MANAGER", label: "Store Manager" },
    { value: "SUPPORT_AGENT", label: "Support Agent" },
    { value: "CATALOG_MANAGER", label: "Catalog Manager" },
  ];

  const sortSelectOptions: CustomSelectOption[] = [
    { value: "ORDERS_DESC", label: "შეკვეთები: მაღლიდან დაბლა" },
    { value: "SPENT_DESC", label: "დანახარჯი (LTV): მაღლიდან დაბლა" },
    { value: "NAME_ASC", label: "სახელი: A-Z" },
    { value: "DATE_DESC", label: "რეგისტრაციის თარიღი" },
  ];

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Role", "Orders Count", "Total Spent (GEL)", "Registered Date"];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.phone}"`,
      u.role,
      u.ordersCount,
      u.totalSpent.toFixed(2),
      u.registeredAt || "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 pb-20">

      {/* 1. Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC] rounded-full text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>მომხმარებლების & გუნდის მენეჯერი</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-zinc-900 tracking-tight">
            მომხმარებლები & გუნდი ({users.length})
          </h1>
          <p className="text-xs md:text-sm text-zinc-500">
            სრული კონტროლი: მომხმარებლების შექმნა, რედაქტირება, წაშლა და ადმინისტრაციული როლები.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            className="h-11 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
            title="განახლება"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#FF5238]" : ""}`} />
            <span className="hidden sm:inline">განახლება</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="h-11 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>ექსპორტი (CSV)</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="h-11 px-5 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-2xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>ახალი მომხმარებელი</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive KPI Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Users */}
        <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>სულ რეგისტრირებული</span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl text-zinc-900 tracking-tight">{users.length}</p>
          <p className="text-[11px] text-zinc-400 font-mono">აქტიური ბაზა</p>
        </div>

        {/* Metric 2: Active Buyers */}
        <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700 text-xs">
            <span>აქტიური მყიდველები</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl text-zinc-900 tracking-tight">{buyersCount}</p>
          <p className="text-[11px] text-emerald-600 font-mono">შეკვეთით ≥ 1</p>
        </div>

        {/* Metric 3: Staff Members */}
        <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-purple-700 text-xs">
            <span>გუნდი / ადმინისტრაცია</span>
            <Crown className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl text-zinc-900 tracking-tight">{totalStaff}</p>
          <p className="text-[11px] text-purple-600 font-mono">ადმინისტრატორი</p>
        </div>

        {/* Metric 4: Total Revenue LTV */}
        <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#FF5238] text-xs">
            <span>სულ გაყიდვები (LTV)</span>
            <TrendingUp className="w-4 h-4 text-[#FF5238]" />
          </div>
          <p className="text-2xl text-zinc-900 tracking-tight">₾{totalRevenue.toFixed(0)}</p>
          <p className="text-[11px] text-[#FF5238] font-mono">შესრულებული შეკვეთები</p>
        </div>

      </div>

      {/* 3. Tab Filter & Search & CustomSelect Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4">
        
        {/* Top Search & Tab Segment Row */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ძებნა: სახელი, ელ-ფოსტა, ტელეფონი, ID..."
              className="w-full h-11 pl-10 pr-10 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF5238]/15 focus:border-[#FF5238] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-100/80 p-1 rounded-2xl shrink-0">
            <button
              type="button"
              onClick={() => {
                setTabFilter("ALL");
                setCurrentPage(1);
              }}
              className={`h-9 px-4 rounded-xl text-xs transition-all cursor-pointer ${
                tabFilter === "ALL" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              ყველა ({users.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setTabFilter("STAFF");
                setCurrentPage(1);
              }}
              className={`h-9 px-4 rounded-xl text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                tabFilter === "STAFF" ? "bg-white text-purple-700 shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-purple-600" />
              <span>გუნდი ({totalStaff})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTabFilter("CUSTOMERS");
                setCurrentPage(1);
              }}
              className={`h-9 px-4 rounded-xl text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                tabFilter === "CUSTOMERS" ? "bg-white text-[#FF5238] shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#FF5238]" />
              <span>მყიდველები ({totalCustomers})</span>
            </button>
          </div>

        </div>

        {/* Bottom CustomSelect Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-zinc-100">
          <CustomSelect
            placeholder="როლით გაფილტვრა"
            options={roleSelectOptions}
            value={roleFilter}
            onChange={(val) => {
              setRoleFilter(val);
              setCurrentPage(1);
            }}
          />

          <CustomSelect
            placeholder="დალაგება"
            options={sortSelectOptions}
            value={sortBy}
            onChange={setSortBy}
          />

          {(searchQuery !== "" || roleFilter !== "ALL" || tabFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("ALL");
                setTabFilter("ALL");
                setCurrentPage(1);
              }}
              className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>ფილტრების გასუფთავება</span>
            </button>
          )}
        </div>

      </div>

      {/* 4. Users Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 text-[11px] select-none">
                <th className="py-3.5 px-6">მომხმარებელი</th>
                <th className="py-3.5 px-6">როლი & უფლებები</th>
                <th className="py-3.5 px-6">კონტაქტი</th>
                <th className="py-3.5 px-6">შეკვეთები / დანახარჯი</th>
                <th className="py-3.5 px-6">რეგისტრაცია</th>
                <th className="py-3.5 px-6 text-right pr-6">მოქმედებები</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-200 rounded-2xl shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3.5 bg-zinc-200 rounded w-28" />
                          <div className="h-2.5 bg-zinc-100 rounded w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><div className="h-6 bg-zinc-100 rounded-full w-24" /></td>
                    <td className="py-4 px-6"><div className="h-3.5 bg-zinc-100 rounded w-32" /></td>
                    <td className="py-4 px-6"><div className="h-3.5 bg-zinc-100 rounded w-24" /></td>
                    <td className="py-4 px-6"><div className="h-3.5 bg-zinc-100 rounded w-20" /></td>
                    <td className="py-4 px-6 text-right pr-6"><div className="h-8 bg-zinc-100 rounded-xl w-24 inline-block" /></td>
                  </tr>
                ))
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-400">
                    <div className="w-14 h-14 rounded-3xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center mb-3">
                      <Users className="w-7 h-7" />
                    </div>
                    <p className="text-sm text-zinc-800">მომხმარებლები ვერ მოიძებნა</p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                      მითითებული ფილტრებით ჩანაწერი არ არსებობს.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const initials = getInitials(user.name);
                  const roleConfig = ROLES_INFO.find((r) => r.key === user.role) || ROLES_INFO[4];
                  const isStaff = user.role !== "CUSTOMER";

                  return (
                    <tr 
                      key={user.id} 
                      className="hover:bg-zinc-50/80 transition-colors group"
                    >
                      {/* User Avatar & Name */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div 
                            onClick={() => setInspectingUser(user)}
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs shrink-0 cursor-pointer shadow-2xs ${
                              isStaff 
                                ? "bg-purple-900 text-white" 
                                : "bg-zinc-900 text-white group-hover:bg-[#FF5238] transition-colors"
                            }`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setInspectingUser(user)}
                              className="text-xs text-zinc-900 hover:text-[#FF5238] transition-colors font-sans text-left block truncate max-w-[200px] cursor-pointer"
                            >
                              {user.name}
                            </button>
                            <span className="text-[10px] text-zinc-400 font-mono">ID: {user.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-6">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] border ${roleConfig.badgeBg}`}>
                          {roleConfig.icon}
                          <span>{roleConfig.label}</span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-6">
                        <div className="space-y-0.5">
                          <a 
                            href={`mailto:${user.email}`} 
                            className="flex items-center gap-1.5 text-zinc-600 hover:text-[#FF5238] transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{user.email}</span>
                          </a>
                          {user.phone && (
                            <a 
                              href={`tel:${user.phone}`} 
                              className="flex items-center gap-1.5 text-zinc-400 hover:text-[#FF5238] font-mono text-[11px] transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{user.phone}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Orders & Total Spent */}
                      <td className="py-3.5 px-6">
                        <div className="space-y-0.5">
                          <span className="text-zinc-900 font-mono">{user.ordersCount} შეკვეთა</span>
                          <p className="text-[11px] text-zinc-500 font-mono">
                            სულ: <span className="text-zinc-900">₾{user.totalSpent.toFixed(2)}</span>
                          </p>
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-6 font-mono text-[11px] text-zinc-500">
                        {user.registeredAt || "-"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right pr-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Quick Inspect Profile */}
                          <button
                            type="button"
                            onClick={() => setInspectingUser(user)}
                            className="p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                            title="პროფილის გადახედვა"
                          >
                            <Users className="w-4 h-4" />
                          </button>

                          {/* Full Edit Profile */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                            title="მონაცემების რედაქტირება"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete User (Admin protection) */}
                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title="მომხმარებლის წაშლა"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-zinc-500">
            ნაჩვენებია <span className="text-zinc-900">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
            <span className="text-zinc-900">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> სულ{" "}
            <span className="text-zinc-900">{filteredUsers.length}</span> მომხმარებლიდან
          </div>

          <div className="flex items-center gap-2 self-center">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                let pageNum = idx + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + idx;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - idx);
                }
                const isActive = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#FF5238] text-white shadow-2xs"
                        : "text-zinc-700 hover:bg-zinc-100 border border-zinc-200/60"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Customer Details Drawer / Modal */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setInspectingUser(null)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-zinc-100 shadow-2xl z-10 space-y-6 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF5238] text-white flex items-center justify-center text-sm shadow-xs">
                  {getInitials(inspectingUser.name)}
                </div>
                <div>
                  <h3 className="text-base text-zinc-900">{inspectingUser.name}</h3>
                  <p className="text-xs text-zinc-400 font-mono">ID: {inspectingUser.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Information List */}
            <div className="space-y-3">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">როლი სისტემაში:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-800">
                    {inspectingUser.role}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">ელ-ფოსტა:</span>
                  <a href={`mailto:${inspectingUser.email}`} className="text-zinc-900 hover:text-[#FF5238]">
                    {inspectingUser.email}
                  </a>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">ტელეფონი:</span>
                  <span className="font-mono text-zinc-900">{inspectingUser.phone || "არ არის მითითებული"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">მისამართი:</span>
                  <span className="text-zinc-900">{inspectingUser.address || "არ არის მითითებული"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">რეგისტრაციის თარიღი:</span>
                  <span className="font-mono text-zinc-900">{inspectingUser.registeredAt || "-"}</span>
                </div>
              </div>

              {/* Order Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-[#FFF5F2] rounded-2xl border border-[#FED7CC] text-center space-y-0.5">
                  <span className="text-[11px] text-[#FF5238]">სულ შეკვეთები</span>
                  <p className="text-xl text-zinc-900">{inspectingUser.ordersCount}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-0.5">
                  <span className="text-[11px] text-emerald-700">სულ დანახარჯი (LTV)</span>
                  <p className="text-xl text-zinc-900 font-mono">₾{inspectingUser.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  const u = inspectingUser;
                  setInspectingUser(null);
                  handleOpenEdit(u);
                }}
                className="px-4 py-2.5 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>რედაქტირება</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const u = inspectingUser;
                  setInspectingUser(null);
                  setUserToDelete(u);
                }}
                className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>წაშლა</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs transition-colors cursor-pointer"
              >
                დახურვა
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-zinc-100 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-base text-zinc-900">ახალი მომხმარებლის / ადმინის დამატება</h3>
                <p className="text-xs text-zinc-500">შექმენით ახალი ანგარიში პირდაპირ MySQL ბაზაში</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsCreateModalOpen(false)} 
                className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-xl hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-700 mb-1">სრული სახელი და გვარი *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="მაგ: გიორგი ბერიძე"
                  className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238]"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-700 mb-1">ელ-ფოსტა *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@spilo.ge"
                  className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-700 mb-1">ტელეფონის ნომერი</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="599 00 00 00"
                    className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 font-mono focus:outline-none focus:border-[#FF5238]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-700 mb-1">პაროლი</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="მინიმუმ 6 სიმბოლო"
                    className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-700 mb-1">მისამართი</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="თბილისი, რუსთაველის #1"
                  className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238]"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-700 mb-1.5">როლი & უფლებები</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238]"
                >
                  {ROLES_INFO.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label} ({r.key})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-10 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-xl text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>შექმნა</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 8. Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setEditingUser(null)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-zinc-100 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-base text-zinc-900">მომხმარებლის რედაქტირება</h3>
                <p className="text-xs text-zinc-500 font-mono">ID: {editingUser.id}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingUser(null)} 
                className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-xl hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-700 mb-1">სრული სახელი და გვარი *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238]"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-700 mb-1">ელ-ფოსტა *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-700 mb-1">ტელეფონის ნომერი</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 font-mono focus:outline-none focus:border-[#FF5238]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-700 mb-1">ახალი პაროლი (სურვილისამებრ)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="შეცვლის შემთხვევაში"
                    className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-700 mb-1">მისამართი</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238]"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-700 mb-1.5">როლი & უფლებები</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5238]"
                >
                  {ROLES_INFO.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label} ({r.key})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="h-10 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-xl text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>შენახვა</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 9. Safe Delete User Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setUserToDelete(null)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 md:p-8 border border-zinc-100 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base text-zinc-900">მომხმარებლის წაშლის დადასტურება</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                ნამდვილად გსურთ <strong>"{userToDelete.name}"</strong>-ს ({userToDelete.email}) წაშლა? ეს ქმედება შეუქცევადია და წაშლის მის მონაცემებს ბაზიდან.
              </p>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-1 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>როლი:</span>
                <span className="text-zinc-800">{userToDelete.role}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>შეკვეთები:</span>
                <span className="text-zinc-800">{userToDelete.ordersCount}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>სულ დანახარჯი:</span>
                <span className="text-zinc-800">₾{userToDelete.totalSpent.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs transition-colors cursor-pointer"
              >
                გაუქმება
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>წაშლის დადასტურება</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useStore } from "@/store/useStore";
import { 
  User, 
  Package, 
  MapPin, 
  LogOut, 
  Pencil, 
  Heart, 
  Bell, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  HelpCircle,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  FileText,
  Loader2,
  Save,
  Check,
  Search,
  Trash2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import OrderInvoiceModal from "@/components/OrderInvoiceModal";
import AddAddressModal from "@/components/AddAddressModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="bg-white min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5238]" />
        </div>
      }>
        <ProfileContent />
      </Suspense>
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const validTabs = [
    "edit_profile",
    "orders",
    "wishlist",
    "addresses",
    "notifications",
    "payments",
    "password",
    "security",
    "faq",
  ];

  const tabFromUrl = searchParams.get("tab");
  const hasTab = validTabs.includes(tabFromUrl || "");
  const activeTab = hasTab ? tabFromUrl! : "edit_profile";

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    if (tabId !== "orders") {
      params.delete("status");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { user, adminUser, setUser, wishlist, toggleAuthModal, addToast } = useStore();
  const isAdmin = !!user && (!!adminUser || ["SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "CATALOG_MANAGER", "ADMIN", "MODERATOR", "MANAGER"].includes(user.role || ""));

  const handleLogout = async () => {
    await useStore.getState().logout();
    addToast({
      title: "გამოსვლა",
      message: "თქვენ წარმატებით გამოხვედით სისტემიდან",
      type: "info",
    });
    window.location.assign("/");
  };

  // Form states matching user profile
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [firstName, setFirstName] = useState(user?.firstName || (user?.name ? user.name.split(" ")[0] : ""));
  const [lastName, setLastName] = useState(user?.lastName || (user?.name ? user.name.split(" ").slice(1).join(" ") : ""));
  const [isGeorgianCitizen, setIsGeorgianCitizen] = useState(user?.isGeorgianCitizen ?? true);
  const [idNumber, setIdNumber] = useState(user?.idNumber || "");
  const [address, setAddress] = useState(user?.address || "");

  // Editable toggles for inputs (Default: false / locked until pencil icon clicked)
  const [editableFields, setEditableFields] = useState<Record<string, boolean>>({
    phone: false,
    email: false,
    firstName: false,
    lastName: false,
    idNumber: false,
  });

  // Input refs to focus on click
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const idNumberRef = useRef<HTMLInputElement>(null);

  const toggleFieldEdit = (field: string, inputRef?: React.RefObject<HTMLInputElement | null>) => {
    setEditableFields((prev) => {
      const isNowEditable = !prev[field];
      if (isNowEditable && inputRef && inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
      return { ...prev, [field]: isNowEditable };
    });
  };

  // Simply lock the input field on blur (clicking outside or moving focus)
  const handleFieldBlur = (field: string) => {
    if (editableFields[field]) {
      setEditableFields((prev) => ({ ...prev, [field]: false }));
    }
  };

  // Notification Toggles
  const [smsNotify, setSmsNotify] = useState(user?.smsNotify ?? true);
  const [emailNotify, setEmailNotify] = useState(user?.emailNotify ?? true);

  // Password tab states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Modals & Feedbacks
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [dbOrders, setDbOrders] = useState<any[]>([]);

  // Fetch real profile data & orders from SQL backend on load
  useEffect(() => {
    if (!user) return;

    const fetchProfileAndOrders = async () => {
      setIsLoading(true);
      try {
        const query = user.email ? `email=${encodeURIComponent(user.email)}` : `phone=${encodeURIComponent(user.phone)}`;
        const res = await fetch(`/api/user/profile?${query}`);
        const data = await res.json();

        if (data.success && data.user) {
          const u = data.user;
          setEmail(u.email || user.email || "");
          setPhone(u.phone || user.phone || "");
          setFirstName(u.firstName || (u.name ? u.name.split(" ")[0] : ""));
          setLastName(u.lastName || (u.name ? u.name.split(" ").slice(1).join(" ") : ""));
          setIsGeorgianCitizen(u.isGeorgianCitizen ?? true);
          setIdNumber(u.idNumber || "");
          setAddress(u.address || "");
          setSmsNotify(u.smsNotify ?? true);
          setEmailNotify(u.emailNotify ?? true);

          // Update store user state with real DB data
          setUser({
            ...user,
            id: u.id,
            name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
            email: u.email,
            phone: u.phone,
            firstName: u.firstName,
            lastName: u.lastName,
            idNumber: u.idNumber,
            isGeorgianCitizen: u.isGeorgianCitizen,
            address: u.address,
            smsNotify: u.smsNotify,
            emailNotify: u.emailNotify,
          });
        }

        if (data.orders && Array.isArray(data.orders)) {
          setDbOrders(data.orders);
        } else {
          setDbOrders([]);
        }
      } catch (err) {
        console.warn("Failed to fetch profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndOrders();
  }, [user?.email, user?.phone]);

  if (!user) {
    return (
      <div className="bg-[#F8FAFC] min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-[32px] p-8 md:p-12 max-w-md w-full text-center space-y-5 shadow-xs border border-gray-100">
          <div className="w-16 h-16 bg-[#FFF1EE] text-[#FF5238] rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl text-gray-900">პირადი კაბინეტი</h1>
          <p className="text-xs text-gray-500">
            პროფილის სანახავად და გასამართად გთხოვთ გაიაროთ ავტორიზაცია
          </p>
          <button
            onClick={() => toggleAuthModal(true)}
            className="w-full py-3.5 bg-[#111111] hover:bg-black text-white rounded-2xl text-xs sm:text-sm cursor-pointer transition-colors"
          >
            ავტორიზაცია / რეგისტრაცია
          </button>
        </div>
      </div>
    );
  }

  // Handle saving profile changes to SQL Database
  const handleProfileUpdate = async (e?: React.FormEvent, customAddress?: string) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    const targetAddress = customAddress !== undefined ? customAddress : address;
    try {
      const computedName = `${firstName} ${lastName}`.trim();
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          email: email || user.email,
          phone: phone || user.phone,
          firstName,
          lastName,
          name: computedName,
          isGeorgianCitizen,
          idNumber,
          address: targetAddress,
          smsNotify,
          emailNotify,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        const u = data.user;
        setEmail(u.email || email);
        setPhone(u.phone || phone);
        setFirstName(u.firstName || firstName);
        setLastName(u.lastName || lastName);
        setIdNumber(u.idNumber || idNumber);
        setIsGeorgianCitizen(u.isGeorgianCitizen ?? isGeorgianCitizen);
        setAddress(u.address || targetAddress);

        setUser({
          ...user,
          ...u,
        });
        addToast({
          title: "მონაცემები განახლდა",
          message: "პროფილის მონაცემები წარმატებით შეინახა",
          type: "success",
        });
        setIsSaved(true);
        // Reset all fields to locked state after successful save
        setEditableFields({
          phone: false,
          email: false,
          firstName: false,
          lastName: false,
          idNumber: false,
        });
        setTimeout(() => setIsSaved(false), 2500);
      } else {
        addToast({
          title: "შეცდომა",
          message: data.error || "პროფილის შენახვა ვერ მოხერხდა",
          type: "error",
        });
      }
    } catch (err: any) {
      addToast({
        title: "შეცდომა",
        message: err.message || "სერვერთან კავშირის შეცდომა",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle changing password in SQL database
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast({
        title: "შეცდომა",
        message: "ახალი პაროლები არ ემთხვევა ერთმანეთს",
        type: "error",
      });
      return;
    }

    if (newPassword.length < 6) {
      addToast({
        title: "შეცდომა",
        message: "პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო",
        type: "error",
      });
      return;
    }

    setIsPasswordSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          phone: user.phone,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        addToast({
          title: "პაროლი შეცვლილია",
          message: "ახალი პაროლი წარმატებით განახლდა",
          type: "success",
        });
        setTimeout(() => setPasswordSuccess(false), 2500);
      } else {
        addToast({
          title: "შეცდომა",
          message: data.error || "პაროლის შეცვლა ვერ მოხერხდა",
          type: "error",
        });
      }
    } catch (err: any) {
      addToast({
        title: "შეცდომა",
        message: err.message || "სერვერთან კავშირის შეცდომა",
        type: "error",
      });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  // Toggle notification preferences with background auto-sync
  const toggleNotification = async (type: "sms" | "email") => {
    const updatedSms = type === "sms" ? !smsNotify : smsNotify;
    const updatedEmail = type === "email" ? !emailNotify : emailNotify;

    if (type === "sms") setSmsNotify(updatedSms);
    if (type === "email") setEmailNotify(updatedEmail);

    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          phone: user.phone,
          smsNotify: updatedSms,
          emailNotify: updatedEmail,
        }),
      });
      addToast({
        title: "პარამეტრები შენახულია",
        message: "შეტყობინებების პარამეტრები განახლდა",
        type: "success",
      });
    } catch (e) {
      console.warn("Could not sync notification preference:", e);
    }
  };

  const profileNavItems = [
    { id: "edit_profile", label: "პროფილის რედაქტირება", href: "/profile?tab=edit_profile" },
    { id: "orders", label: "შეკვეთები", href: "/profile?tab=orders" },
    { id: "orders_completed", label: "ჩემი დასრულებული შეკვეთები", href: "/profile?tab=orders&status=completed" },
    { id: "wishlist", label: "ვიშლისტი", href: "/profile?tab=wishlist" },
    { id: "addresses", label: "მისამართები", href: "/profile?tab=addresses" },
    { id: "notifications", label: "SMS/Mail შეტყობინებები", href: "/profile?tab=notifications" },
    { id: "payments", label: "გადახდები", href: "/profile?tab=payments" },
    { id: "password", label: "პაროლი", href: "/profile?tab=password" },
    { id: "security", label: "უსაფრთხოების პოლიტიკა", href: "/profile?tab=security" },
    { id: "faq", label: "დახმარების ცენტრი", href: "/profile?tab=faq" },
  ];

  const orderStatusParam = searchParams.get("status");
  const activeLabel =
    activeTab === "orders" && orderStatusParam === "completed"
      ? "ჩემი დასრულებული შეკვეთები"
      : profileNavItems.find((item) => item.id === activeTab)?.label || "პროფილი";

  return (
    <div className="bg-white min-h-screen py-1 md:py-8 pb-[calc(7.25rem+env(safe-area-inset-bottom,0px))] md:pb-8 max-md:overflow-x-hidden">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-4 lg:px-8 md:container space-y-0 md:space-y-8">

        <div
          className={`md:hidden origin-left transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
            hasTab ? "-translate-x-[18%] opacity-40 pointer-events-none" : "translate-x-0 opacity-100"
          }`}
        >
            <div className="flex items-center gap-3 py-4 border-b border-gray-200">
              <User className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
              <h1 className="text-[17px] text-gray-900">გამარჯობა</h1>
            </div>

            {isAdmin && (
              <Link
                href="/admin"
                className="w-full flex items-center justify-between py-4 text-[15px] text-gray-900 border-b border-gray-100"
              >
                <span>ადმინპანელი</span>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" strokeWidth={1.5} />
              </Link>
            )}

            <nav className="flex flex-col">
              {profileNavItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="w-full flex items-center justify-between py-4 text-[15px] text-gray-900 border-b border-gray-100"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" strokeWidth={1.5} />
                </Link>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-between py-4 text-[15px] text-[#FF5238]"
              >
                <span>გასვლა</span>
                <ChevronRight className="w-4 h-4 text-[#FF5238] shrink-0" strokeWidth={1.5} />
              </button>
            </nav>
        </div>

        <div className="hidden md:flex items-center justify-between border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-gray-900" />
            <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">
              პროფილი
            </h1>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin text-[#FF5238]" />
              <span>ჩატვირთვა...</span>
            </div>
          )}
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start max-md:fixed max-md:inset-x-0 max-md:top-16 max-md:bottom-0 max-md:z-[45] max-md:overflow-y-auto max-md:overscroll-contain max-md:bg-white max-md:px-5 max-md:pb-[calc(7.25rem+env(safe-area-inset-bottom,0px))] max-md:transition-transform max-md:duration-[420ms] max-md:ease-[cubic-bezier(0.32,0.72,0,1)] ${
            hasTab ? "max-md:translate-x-0" : "max-md:translate-x-full max-md:pointer-events-none"
          }`}
        >
          
          {/* Left Navigation Sidebar Menu (4 cols) */}
          <div className="hidden md:block md:col-span-4 border-r-0 md:border-r border-gray-100 pr-0 md:pr-8">
            {/* Admin Panel Direct Link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="w-full text-left px-4 py-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs md:text-sm flex items-center justify-between transition-colors shadow-xs group cursor-pointer mb-3"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#FF5238]" />
                  <span>ადმინპანელში გადასვლა</span>
                </div>
                <span className="text-[10px] bg-[#FF5238]/20 text-[#FFB4A8] border border-[#FF5238]/30 px-2.5 py-0.5 rounded-full">
                  Admin
                </span>
              </Link>
            )}

            <div className="flex md:flex-col gap-1.5 md:gap-1 overflow-x-auto no-scrollbar pb-3 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
              {[
                { id: "edit_profile", label: "პროფილის რედაქტირება" },
                { id: "orders", label: `შეკვეთები (${dbOrders.length})` },
                { id: "wishlist", label: `ვიშლისტი (${wishlist.length})` },
                { id: "addresses", label: "მისამართები" },
                { id: "notifications", label: "SMS/Mail შეტყობინებები" },
                { id: "payments", label: "გადახდები" },
                { id: "password", label: "პაროლი" },
                { id: "security", label: "უსაფრთხოების პოლიტიკა" },
                { id: "faq", label: "ხშირად დასმული კითხვები" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`shrink-0 md:shrink md:w-full whitespace-nowrap text-left px-3.5 py-2 md:px-4 md:py-3 rounded-xl text-xs md:text-sm cursor-pointer transition-colors ${
                    activeTab === item.id
                      ? "bg-[#F1F3F6] text-gray-900 shadow-xs md:shadow-none"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 bg-gray-50/60 md:bg-transparent"
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}

              {/* Logout Action (Red) */}
              <div className="md:pt-4 md:border-t md:border-gray-100 md:mt-2 shrink-0 md:shrink">
                <button
                  onClick={handleLogout}
                  className="whitespace-nowrap md:w-full text-left px-3.5 py-2 md:px-4 md:py-3 text-xs md:text-sm text-red-500 hover:bg-red-50 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 md:gap-2 bg-red-50/50 md:bg-transparent"
                >
                  <LogOut className="w-4 h-4" />
                  <span>გასვლა</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Main Content Area (8 cols) */}
          <div className="md:col-span-8 max-w-xl space-y-4 md:space-y-6">
            {hasTab && (
              <div className="md:hidden flex items-center gap-1 py-3 mb-2 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push("/profile")}
                  className="-ml-2 w-9 h-9 rounded-full flex items-center justify-center text-gray-900"
                  aria-label="უკან"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <h1 className="text-[15px] text-gray-900 truncate">{activeLabel}</h1>
              </div>
            )}
            
            {/* 1. Edit Profile Form Tab */}
            {activeTab === "edit_profile" && (
              <form onSubmit={handleProfileUpdate} className="space-y-3.5 md:space-y-5">
                <h2 className="hidden md:block text-xl text-gray-900 mb-6">
                  პროფილის რედაქტირება
                </h2>

                {/* Phone input */}
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 block px-2">ტელეფონის ნომერი</label>
                  <div className="relative flex items-center">
                    <input
                      ref={phoneRef}
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => handleFieldBlur("phone")}
                      disabled={!editableFields.phone}
                      placeholder="ტელეფონის ნომერი (მაგ: 599123456)"
                      className={`w-full h-11 md:h-13 pl-4 pr-12 rounded-2xl text-xs md:text-sm transition-all focus:outline-none ${
                        editableFields.phone
                          ? "bg-white text-gray-900 ring-2 ring-[#FF5238] shadow-xs"
                          : "bg-[#F1F3F6] text-gray-500 cursor-not-allowed select-none opacity-80"
                      }`}
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleFieldEdit("phone", phoneRef)}
                      className="absolute right-3.5 p-1 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                      title="რედაქტირება"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Email input */}
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 block px-2">ელფოსტა</label>
                  <div className="relative flex items-center">
                    <input
                      ref={emailRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleFieldBlur("email")}
                      disabled={!editableFields.email}
                      placeholder="ელფოსტა"
                      className={`w-full h-11 md:h-13 pl-4 pr-12 rounded-2xl text-xs md:text-sm transition-all focus:outline-none ${
                        editableFields.email
                          ? "bg-white text-gray-900 ring-2 ring-[#FF5238] shadow-xs"
                          : "bg-[#F1F3F6] text-gray-500 cursor-not-allowed select-none opacity-80"
                      }`}
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleFieldEdit("email", emailRef)}
                      className="absolute right-3.5 p-1 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                      title="რედაქტირება"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* First Name input */}
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 block px-2">სახელი</label>
                  <div className="relative flex items-center">
                    <input
                      ref={firstNameRef}
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={() => handleFieldBlur("firstName")}
                      disabled={!editableFields.firstName}
                      placeholder="მიუთითეთ სახელი"
                      className={`w-full h-11 md:h-13 pl-4 pr-12 rounded-2xl text-xs md:text-sm transition-all focus:outline-none ${
                        editableFields.firstName
                          ? "bg-white text-gray-900 ring-2 ring-[#FF5238] shadow-xs"
                          : "bg-[#F1F3F6] text-gray-500 cursor-not-allowed select-none opacity-80"
                      }`}
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleFieldEdit("firstName", firstNameRef)}
                      className="absolute right-3.5 p-1 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                      title="რედაქტირება"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Last Name input */}
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 block px-2">გვარი</label>
                  <div className="relative flex items-center">
                    <input
                      ref={lastNameRef}
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={() => handleFieldBlur("lastName")}
                      disabled={!editableFields.lastName}
                      placeholder="მიუთითეთ გვარი"
                      className={`w-full h-11 md:h-13 pl-4 pr-12 rounded-2xl text-xs md:text-sm transition-all focus:outline-none ${
                        editableFields.lastName
                          ? "bg-white text-gray-900 ring-2 ring-[#FF5238] shadow-xs"
                          : "bg-[#F1F3F6] text-gray-500 cursor-not-allowed select-none opacity-80"
                      }`}
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleFieldEdit("lastName", lastNameRef)}
                      className="absolute right-3.5 p-1 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                      title="რედაქტირება"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Georgian Citizenship Switch Box */}
                <div className="h-11 md:h-13 px-4 bg-[#F1F3F6] rounded-2xl flex items-center justify-between">
                  <span className="text-xs md:text-sm text-gray-800">საქართველოს მოქალაქე</span>
                  <button
                    type="button"
                    onClick={() => {
                      const val = !isGeorgianCitizen;
                      setIsGeorgianCitizen(val);
                    }}
                    className={`w-12 h-6 rounded-full relative p-0.5 transition-colors cursor-pointer ${
                      isGeorgianCitizen ? "bg-[#FF5238]" : "bg-gray-300"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isGeorgianCitizen ? "translate-x-6" : ""
                    }`} />
                  </button>
                </div>

                {/* Personal ID input */}
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 block px-2">პირადი ნომერი</label>
                  <div className="relative flex items-center">
                    <input
                      ref={idNumberRef}
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      onBlur={() => handleFieldBlur("idNumber")}
                      disabled={!editableFields.idNumber}
                      placeholder="მიუთითეთ 11-ნიშნა პირადი ნომერი"
                      className={`w-full h-11 md:h-13 pl-4 pr-12 rounded-2xl text-xs md:text-sm transition-all focus:outline-none ${
                        editableFields.idNumber
                          ? "bg-white text-gray-900 ring-2 ring-[#FF5238] shadow-xs"
                          : "bg-[#F1F3F6] text-gray-500 cursor-not-allowed select-none opacity-80"
                      }`}
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleFieldEdit("idNumber", idNumberRef)}
                      className="absolute right-3.5 p-1 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                      title="რედაქტირება"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Save/Update Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-11 md:h-13 bg-[#FF5238] hover:bg-[#EA3A20] disabled:opacity-70 text-white rounded-2xl text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>ინახება...</span>
                      </>
                    ) : isSaved ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>შენახულია!</span>
                      </>
                    ) : (
                      <span>განახლება</span>
                    )}
                  </button>
                </div>

              </form>
            )}
            {activeTab === "orders" && (() => {
              const activeOrders = dbOrders.filter(
                (o) =>
                  o.status === "მუშავდება" ||
                  o.status === "გზაშია" ||
                  o.status === "PROCESSING" ||
                  o.status === "SHIPPED" ||
                  o.status === "PENDING"
              );
              const completedOrders = dbOrders.filter(
                (o) =>
                  o.status === "ჩაბარებულია" ||
                  o.status === "DELIVERED" ||
                  o.status === "გაუქმებულია" ||
                  o.status === "CANCELLED"
              );

              const orderStatusParam = searchParams.get("status");
              const currentSubTab = orderStatusParam === "completed" ? "completed" : "active";

              const handleOrderSubTabChange = (status: "active" | "completed") => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("tab", "orders");
                params.set("status", status);
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
              };

              const displayedOrders = currentSubTab === "completed" ? completedOrders : activeOrders;

              const statusMeta = (status: string) => {
                const raw = status || "";
                const upper = raw.toUpperCase();
                if (raw === "ჩაბარებულია" || upper === "DELIVERED") {
                  return { label: "ჩაბარებულია", className: "bg-emerald-50 text-emerald-700" };
                }
                if (raw === "გზაშია" || upper === "SHIPPED") {
                  return { label: "გზაშია", className: "bg-[#FFF1EE] text-[#FF5238]" };
                }
                if (raw === "გაუქმებულია" || upper === "CANCELLED") {
                  return { label: "გაუქმებულია", className: "bg-red-50 text-red-600" };
                }
                if (raw === "მუშავდება" || upper === "PROCESSING") {
                  return { label: "მუშავდება", className: "bg-amber-50 text-amber-700" };
                }
                if (upper === "PENDING") {
                  return { label: "მოლოდინში", className: "bg-amber-50 text-amber-700" };
                }
                return { label: raw, className: "bg-white text-gray-600" };
              };

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 p-1 bg-[#F4F5F7] rounded-2xl">
                    <button
                      type="button"
                      onClick={() => handleOrderSubTabChange("active")}
                      className={`h-10 rounded-[14px] text-[13px] md:text-sm cursor-pointer transition-colors ${
                        currentSubTab === "active"
                          ? "bg-white text-[#1D1D1F] shadow-sm"
                          : "text-gray-400"
                      }`}
                    >
                      მიმდინარე{activeOrders.length > 0 ? ` ${activeOrders.length}` : ""}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOrderSubTabChange("completed")}
                      className={`h-10 rounded-[14px] text-[13px] md:text-sm cursor-pointer transition-colors ${
                        currentSubTab === "completed"
                          ? "bg-white text-[#1D1D1F] shadow-sm"
                          : "text-gray-400"
                      }`}
                    >
                      დასრულებული{completedOrders.length > 0 ? ` ${completedOrders.length}` : ""}
                    </button>
                  </div>

                  {displayedOrders.length === 0 ? (
                    <div className="bg-[#F4F5F7] rounded-[22px] px-5 py-9 text-center">
                      <span className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-3">
                        <Package className="w-6 h-6 text-[#FF5238]" strokeWidth={1.6} />
                      </span>
                      <p className="text-[15px] text-[#1D1D1F]">
                        {currentSubTab === "completed"
                          ? "დასრულებული შეკვეთები არ არის"
                          : "მიმდინარე შეკვეთა არ არის"}
                      </p>
                      <p className="text-[12px] text-gray-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                        {currentSubTab === "completed"
                          ? "ჩაბარებული ან გაუქმებული შეკვეთები აქ გამოჩნდება"
                          : "როცა შეკვეთას გააფორმებ, აქ გამოჩნდება"}
                      </p>
                      {currentSubTab === "active" && (
                        <Link
                          href="/catalog"
                          className="inline-flex items-center justify-center mt-4 h-11 px-5 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-2xl text-[14px]"
                        >
                          კატალოგის ნახვა
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayedOrders.map((order) => {
                        const meta = statusMeta(order.status);
                        return (
                          <article key={order.id} className="bg-[#F4F5F7] rounded-[22px] p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[14px] text-[#1D1D1F]">შეკვეთა #{order.id}</p>
                                <p className="text-[12px] text-gray-400 mt-0.5">{order.date}</p>
                              </div>
                              <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] ${meta.className}`}>
                                {meta.label}
                              </span>
                            </div>

                            <div className="space-y-2.5">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-14 h-14 object-contain rounded-xl bg-white shrink-0 p-1"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[13px] text-[#1D1D1F] line-clamp-2 leading-snug">
                                      {item.title}
                                    </p>
                                    <p className="text-[12px] text-gray-400 mt-0.5">
                                      {item.quantity} ცალი
                                    </p>
                                  </div>
                                  <span className="text-[13px] text-[#1D1D1F] shrink-0">
                                    {((item.discountPrice || item.price) * item.quantity).toFixed(0)} ₾
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-white/80">
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceOrder(order)}
                                className="text-[13px] text-[#FF5238] cursor-pointer"
                              >
                                ინვოისი
                              </button>
                              <p className="text-[15px] text-[#1D1D1F]">
                                {order.totalAmount.toFixed(0)} ₾
                              </p>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 3. Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="space-y-4">
                <h2 className="hidden md:block text-xl text-gray-900 border-b border-gray-100 pb-3">
                  ვიშლისტი ({wishlist.length})
                </h2>
                {wishlist.length === 0 ? (
                  <div className="bg-[#F8FAFC] rounded-2xl p-8 text-center text-gray-500 space-y-2 border border-gray-100">
                    <Heart className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="text-xs md:text-sm text-gray-700">ვიშლისტი ცარიელია</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wishlist.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-gray-100 text-xs">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.title} className="w-12 h-12 object-contain bg-white p-1 rounded-xl" />
                          <div>
                            <span className="text-gray-900 block truncate max-w-[240px]">{item.title}</span>
                            <span className="text-gray-400 text-[11px]">კოდი: #{item.id}</span>
                          </div>
                        </div>
                        <span className="text-gray-900 font-mono text-sm">{(item.discountPrice || item.price).toFixed(2)} ₾</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-5">
                <h2 className="hidden md:block text-xl text-gray-900">მისამართები</h2>

                {address && address.trim() ? (
                  <div className="bg-[#F4F5F7] rounded-[22px] p-4 md:p-5 flex items-start gap-3">
                    <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-[18px] h-[18px] text-[#FF5238]" strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-[14px] md:text-sm text-[#1D1D1F] leading-snug">
                        {address.split(", (კომენტარი:")[0].split(", comment:")[0]}
                      </p>
                      {address.includes(", (კომენტარი:") ? (
                        <p className="text-[12px] text-gray-500">
                          {address.split(", (კომენტარი:")[1].replace(")", "")}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsAddressModalOpen(true)}
                        className="w-9 h-9 rounded-full bg-white text-gray-700 flex items-center justify-center cursor-pointer"
                        title="მისამართის შეცვლა"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleProfileUpdate(undefined, "")}
                        className="w-9 h-9 rounded-full bg-white text-gray-500 hover:text-[#FF5238] flex items-center justify-center cursor-pointer"
                        title="მისამართის წაშლა"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#F4F5F7] rounded-[22px] px-5 py-8 text-center">
                    <span className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-6 h-6 text-[#FF5238]" strokeWidth={1.6} />
                    </span>
                    <p className="text-[15px] text-[#1D1D1F]">მისამართი არ არის დამატებული</p>
                    <p className="text-[12px] text-gray-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                      დაამატე მიწოდების მისამართი, რომ შეკვეთა პირდაპირ შენთან მოვიდეს
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="w-full h-12 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-2xl text-[15px] cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{address && address.trim() ? "მისამართის შეცვლა" : "მისამართის დამატება"}</span>
                </button>
              </div>
            )}

            {/* 5. SMS/Mail Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <h2 className="hidden md:block text-xl text-gray-900 border-b border-gray-100 pb-3">
                  SMS / Mail შეტყობინებები
                </h2>
                <div className="space-y-3">
                  <div className="h-11 md:h-13 px-4 bg-[#F1F3F6] rounded-2xl flex items-center justify-between">
                    <span className="text-xs md:text-sm text-gray-800">SMS შეტყობინებები შეკვეთის სტატუსზე</span>
                    <button
                      type="button"
                      onClick={() => toggleNotification("sms")}
                      className={`w-12 h-6 rounded-full relative p-0.5 transition-colors cursor-pointer ${
                        smsNotify ? "bg-[#FF5238]" : "bg-gray-300"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${smsNotify ? "translate-x-6" : ""}`} />
                    </button>
                  </div>

                  <div className="h-11 md:h-13 px-4 bg-[#F1F3F6] rounded-2xl flex items-center justify-between">
                    <span className="text-xs md:text-sm text-gray-800">Mail შეტყობინებები ფასდაკლებებზე</span>
                    <button
                      type="button"
                      onClick={() => toggleNotification("email")}
                      className={`w-12 h-6 rounded-full relative p-0.5 transition-colors cursor-pointer ${
                        emailNotify ? "bg-[#FF5238]" : "bg-gray-300"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${emailNotify ? "translate-x-6" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Payments Tab */}
            {activeTab === "payments" && (
              <div className="space-y-4">
                <h2 className="hidden md:block text-xl text-gray-900 border-b border-gray-100 pb-3">
                  გადახდები & შენახული ბარათები
                </h2>
                <div className="bg-[#F8FAFC] rounded-2xl p-8 text-center text-gray-500 space-y-2 border border-gray-100">
                  <CreditCard className="w-8 h-8 mx-auto text-gray-400" />
                  <p className="text-xs md:text-sm text-gray-700">შენახული ბარათები არ მოიძებნა</p>
                  <p className="text-[11px] text-gray-400">შენახული საბანკო ბარათები არ გაქვთ. ბარათი ინახება უსაფრთხოდ შეკვეთის გაფორმებისას.</p>
                </div>
              </div>
            )}

            {/* 7. Password Tab */}
            {activeTab === "password" && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <h2 className="hidden md:block text-xl text-gray-900 border-b border-gray-100 pb-3">
                  პაროლის შეცვლა
                </h2>
                <div className="space-y-3">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="მიმდინარე პაროლი"
                    className="w-full h-11 md:h-13 px-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5238]"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="ახალი პაროლი (მინ. 6 სიმბოლო)"
                    className="w-full h-11 md:h-13 px-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5238]"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="გაამეორეთ ახალი პაროლი"
                    className="w-full h-11 md:h-13 px-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF5238]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPasswordSaving}
                  className="w-full h-11 md:h-13 bg-[#111111] hover:bg-black disabled:opacity-70 text-white rounded-2xl text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  {isPasswordSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>პაროლის განახლება...</span>
                    </>
                  ) : passwordSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>პაროლი შეცვლილია!</span>
                    </>
                  ) : (
                    <span>პაროლის განახლება</span>
                  )}
                </button>
              </form>
            )}

            {/* 8. Security Policy Tab */}
            {activeTab === "security" && (
              <div className="space-y-4">
                <h2 className="hidden md:block text-xl text-gray-900 border-b border-gray-100 pb-3">
                  უსაფრთხოების პოლიტიკა
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed">
                  spilo-ზე თქვენი პერსონალური მონაცემები 100%-ით დაცულია SSL 256-bit შიფრაციით. ჩვენ არ ვინახავთ თქვენი საბანკო ბარათების სრულ მონაცემებს და არ გადავცემთ მესამე პირებს.
                </p>
              </div>
            )}

            {/* 9. FAQ Tab */}
            {activeTab === "faq" && (
              <div className="space-y-4">
                <h2 className="hidden md:block text-xl text-gray-900 border-b border-gray-100 pb-3">
                  ხშირად დასმული კითხვები
                </h2>
                <div className="space-y-3 text-xs md:text-sm">
                  <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100 space-y-1">
                    <h4 className="text-gray-900">როგორ მოქმედებს 0% განვადება?</h4>
                    <p className="text-gray-500 text-xs">განვადებას ირჩევთ შეკვეთის გაფორმებისას (TBC, BOG, Credo).</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100 space-y-1">
                    <h4 className="text-gray-900">რამდენ ხანში მოვა მიწოდება?</h4>
                    <p className="text-gray-500 text-xs">თბილისში იმავე დღეს, ხოლო რეგიონებში 1-2 დღეში.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          order={selectedInvoiceOrder}
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Add Address Modal with Real Live Map Autocomplete Search */}
      <AddAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        initialAddress={address}
        onSaveAddress={(fullAddr) => handleProfileUpdate(undefined, fullAddr)}
      />
    </div>
  );
}

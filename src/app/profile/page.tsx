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
  Trash2
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
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
  const activeTab = validTabs.includes(tabFromUrl || "") ? tabFromUrl! : "edit_profile";

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

  const handleLogout = () => {
    setUser(null);
    addToast({
      title: "გამოსვლა",
      message: "თქვენ წარმატებით გამოხვედით სისტემიდან",
      type: "info",
    });
    router.push("/");
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
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
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

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl space-y-8">
        
        {/* Page Top Heading */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-gray-900" />
            <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">
              პროფილი
            </h1>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>ჩატვირთვა...</span>
            </div>
          )}
        </div>

        {/* 2-Column Main Profile Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* Left Navigation Sidebar Menu (4 cols) */}
          <div className="md:col-span-4 border-r-0 md:border-r border-gray-100 pr-0 md:pr-8 space-y-1">
            {/* Admin Panel Direct Link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="w-full text-left px-4 py-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs md:text-sm flex items-center justify-between transition-colors shadow-xs group cursor-pointer mb-3"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>ადმინპანელში გადასვლა</span>
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                  Admin
                </span>
              </Link>
            )}

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
                className={`w-full text-left px-4 py-3 rounded-xl text-xs md:text-sm cursor-pointer transition-colors ${
                  activeTab === item.id
                    ? "bg-[#F1F3F6] text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}

            {/* Logout Action (Red) */}
            <div className="pt-4 border-t border-gray-100 mt-2">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-xs md:text-sm text-red-500 hover:bg-red-50 rounded-xl cursor-pointer transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>გასვლა</span>
              </button>
            </div>
          </div>

          {/* Right Main Content Area (8 cols) */}
          <div className="md:col-span-8 max-w-xl space-y-6">
            
            {/* 1. Edit Profile Form Tab */}
            {activeTab === "edit_profile" && (
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <h2 className="text-xl text-gray-900 mb-6">
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
                      className={`w-full h-13 pl-4 pr-12 rounded-2xl text-xs md:text-sm transition-all focus:outline-none ${
                        editableFields.phone
                          ? "bg-white text-gray-900 ring-2 ring-blue-600 shadow-xs"
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
                      className={`w-full h-13 pl-4 pr-12 rounded-2xl text-xs md:text-sm transition-all focus:outline-none ${
                        editableFields.email
                          ? "bg-white text-gray-900 ring-2 ring-blue-600 shadow-xs"
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
                      className={`w-full h-13 pl-4 pr-12 rounded-2xl text-xs md:text-sm transition-all focus:outline-none ${
                        editableFields.firstName
                          ? "bg-white text-gray-900 ring-2 ring-blue-600 shadow-xs"
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
                      className={`w-full h-13 pl-4 pr-12 rounded-2xl text-xs md:text-sm transition-all focus:outline-none ${
                        editableFields.lastName
                          ? "bg-white text-gray-900 ring-2 ring-blue-600 shadow-xs"
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
                <div className="h-13 px-4 bg-[#F1F3F6] rounded-2xl flex items-center justify-between">
                  <span className="text-xs md:text-sm text-gray-800">საქართველოს მოქალაქე</span>
                  <button
                    type="button"
                    onClick={() => {
                      const val = !isGeorgianCitizen;
                      setIsGeorgianCitizen(val);
                    }}
                    className={`w-12 h-6 rounded-full relative p-0.5 transition-colors cursor-pointer ${
                      isGeorgianCitizen ? "bg-blue-600" : "bg-gray-300"
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
                      className={`w-full h-13 pl-4 pr-12 rounded-2xl text-xs md:text-sm transition-all focus:outline-none ${
                        editableFields.idNumber
                          ? "bg-white text-gray-900 ring-2 ring-blue-600 shadow-xs"
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
                    className="w-full h-13 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-2xl text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs"
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

              return (
                <div className="space-y-6">
                  
                  {/* Sub-Tabs Header Navigation Bar matching Screenshot */}
                  <div className="flex border-b border-gray-200 gap-8 text-sm md:text-base pt-2">
                    <button
                      type="button"
                      onClick={() => handleOrderSubTabChange("active")}
                      className={`pb-3 font-sans transition-all cursor-pointer border-b-2 -mb-[2px] ${
                        currentSubTab === "active"
                          ? "border-blue-600 text-gray-900"
                          : "border-transparent text-gray-400 hover:text-gray-900"
                      }`}
                    >
                      <span>
                        მიმდინარე შეკვეთები{activeOrders.length > 0 ? ` (${activeOrders.length})` : ""}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOrderSubTabChange("completed")}
                      className={`pb-3 font-sans transition-all cursor-pointer border-b-2 -mb-[2px] ${
                        currentSubTab === "completed"
                          ? "border-blue-600 text-gray-900"
                          : "border-transparent text-gray-400 hover:text-gray-900"
                      }`}
                    >
                      <span>
                        დასრულებული შეკვეთები{completedOrders.length > 0 ? ` (${completedOrders.length})` : ""}
                      </span>
                    </button>
                  </div>

                  {/* Orders List / Cards */}
                  {displayedOrders.length === 0 ? (
                    <div className="bg-[#F1F3F6] rounded-3xl p-10 text-center text-gray-500 space-y-2">
                      <Package className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-xs md:text-sm text-gray-700">
                        {currentSubTab === "completed"
                          ? "დასრულებული შეკვეთები არ მოიძებნა"
                          : "მიმდინარე შეკვეთები არ მოიძებნა"}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {currentSubTab === "completed"
                          ? "თქვენ არ გაქვთ ჩაბარებული ან გაუქმებული შეკვეთების ისტორია"
                          : "თქვენ არ გაქვთ აქტიური შეკვეთა დამუშავების პროცესში"}
                      </p>
                    </div>
                  ) : (
                    displayedOrders.map((order) => (
                      <div key={order.id} className="bg-[#F1F3F6] rounded-3xl p-5 md:p-6 space-y-4">
                        
                        {/* Card Header Row: Order ID & Status & Invoice */}
                        <div className="flex items-center justify-between text-xs md:text-sm">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-900 font-mono tracking-tight">
                              #{order.id}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] ${
                              order.status === "ჩაბარებულია" || order.status === "DELIVERED"
                                ? "bg-emerald-100 text-emerald-700"
                                : order.status === "გზაშია" || order.status === "SHIPPED"
                                ? "bg-blue-100 text-blue-700"
                                : order.status === "გაუქმებულია" || order.status === "CANCELLED"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="text-blue-600 hover:underline text-xs md:text-sm cursor-pointer transition-colors"
                          >
                            ინვოისი
                          </button>
                        </div>

                        {/* Inner White Box with Items */}
                        <div className="bg-white rounded-2xl p-4 md:p-5 space-y-3 shadow-2xs">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-12 h-12 md:w-14 md:h-14 object-contain rounded-xl bg-gray-50 border border-gray-100 shrink-0 p-1"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs md:text-sm text-gray-900 line-clamp-2">
                                    {item.title}
                                  </p>
                                  {item.quantity > 1 && (
                                    <p className="text-[11px] text-gray-400">
                                      რაოდენობა: {item.quantity} ცალი
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs md:text-sm text-[#111111] font-mono">
                                  {((item.discountPrice || item.price) * item.quantity).toFixed(0)} ₾
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Card Footer Row: Order Date & Total Cost */}
                        <div className="flex items-center justify-between text-xs md:text-sm pt-1">
                          <span className="text-gray-500">
                            შეკვეთა: {order.date}
                          </span>
                          <div className="text-right">
                            <span className="text-gray-900">
                              შეკვეთის ღირებულება:
                            </span>
                            <span className="text-blue-600 font-mono text-sm md:text-base pl-1.5">
                              {order.totalAmount.toFixed(0)} ₾
                            </span>
                          </div>
                        </div>

                      </div>
                    ))
                  )}

                </div>
              );
            })()}

            {/* 3. Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="space-y-4">
                <h2 className="text-xl text-gray-900 border-b border-gray-100 pb-3">
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
              <div className="space-y-6">
                <h2 className="text-xl text-gray-900">მისამართები</h2>

                {address && address.trim() ? (
                  <div className="bg-[#F1F3F6] rounded-2xl p-5 md:p-6 flex items-center justify-between border border-gray-100/60">
                    <div className="space-y-1 pr-4">
                      <p className="text-xs md:text-sm text-gray-900 leading-snug">
                        {address.split(", (კომენტარი:")[0].split(", comment:")[0]}
                      </p>
                      <p className="text-[12px] text-gray-500">
                        {address.includes(", (კომენტარი:")
                          ? address.split(", (კომენტარი:")[1].replace(")", "")
                          : "კომენტარი"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsAddressModalOpen(true)}
                        className="p-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                        title="მისამართის შეცვლა"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleProfileUpdate(undefined, "")}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                        title="მისამართის წაშლა"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : null}

                <div>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="px-8 h-13 bg-[#111111] hover:bg-black text-white rounded-2xl text-xs md:text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>მისამართის დამატება</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. SMS/Mail Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <h2 className="text-xl text-gray-900 border-b border-gray-100 pb-3">
                  SMS / Mail შეტყობინებები
                </h2>
                <div className="space-y-3">
                  <div className="h-13 px-4 bg-[#F1F3F6] rounded-2xl flex items-center justify-between">
                    <span className="text-xs md:text-sm text-gray-800">SMS შეტყობინებები შეკვეთის სტატუსზე</span>
                    <button
                      type="button"
                      onClick={() => toggleNotification("sms")}
                      className={`w-12 h-6 rounded-full relative p-0.5 transition-colors cursor-pointer ${
                        smsNotify ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${smsNotify ? "translate-x-6" : ""}`} />
                    </button>
                  </div>

                  <div className="h-13 px-4 bg-[#F1F3F6] rounded-2xl flex items-center justify-between">
                    <span className="text-xs md:text-sm text-gray-800">Mail შეტყობინებები ფასდაკლებებზე</span>
                    <button
                      type="button"
                      onClick={() => toggleNotification("email")}
                      className={`w-12 h-6 rounded-full relative p-0.5 transition-colors cursor-pointer ${
                        emailNotify ? "bg-blue-600" : "bg-gray-300"
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
                <h2 className="text-xl text-gray-900 border-b border-gray-100 pb-3">
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
                <h2 className="text-xl text-gray-900 border-b border-gray-100 pb-3">
                  პაროლის შეცვლა
                </h2>
                <div className="space-y-3">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="მიმდინარე პაროლი"
                    className="w-full h-13 px-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="ახალი პაროლი (მინ. 6 სიმბოლო)"
                    className="w-full h-13 px-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="გაამეორეთ ახალი პაროლი"
                    className="w-full h-13 px-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPasswordSaving}
                  className="w-full h-13 bg-[#111111] hover:bg-black disabled:opacity-70 text-white rounded-2xl text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
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
                <h2 className="text-xl text-gray-900 border-b border-gray-100 pb-3">
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
                <h2 className="text-xl text-gray-900 border-b border-gray-100 pb-3">
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

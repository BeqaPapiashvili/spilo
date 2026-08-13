"use client";

import { useState } from "react";
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
  FileText
} from "lucide-react";
import Link from "next/link";
import OrderInvoiceModal from "@/components/OrderInvoiceModal";

export default function ProfilePage() {
  const { user, setUser, orders, wishlist, toggleAuthModal } = useStore();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    | "edit_profile" 
    | "orders" 
    | "wishlist" 
    | "addresses" 
    | "notifications" 
    | "payments" 
    | "password" 
    | "security" 
    | "faq"
  >("edit_profile");

  // Form states matching screenshot
  const [phone, setPhone] = useState(user?.phone || "995551008897");
  const [email, setEmail] = useState(user?.email || "papicha@gmail.com");
  const [firstName, setFirstName] = useState(user?.name ? user.name.split(" ")[0] : "ბექა");
  const [lastName, setLastName] = useState(user?.name ? user.name.split(" ")[1] || "პაპიაშვილი" : "პაპიაშვილი");
  const [isGeorgianCitizen, setIsGeorgianCitizen] = useState(true);
  const [idNumber, setIdNumber] = useState("01019000000");

  // Notification Toggles
  const [smsNotify, setSmsNotify] = useState(true);
  const [emailNotify, setEmailNotify] = useState(true);

  // Updated Feedback
  const [isSaved, setIsSaved] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any>(null);

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

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      name: `${firstName} ${lastName}`,
      email,
      phone,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl space-y-8">
        
        {/* Page Top Heading */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
          <User className="w-6 h-6 text-gray-900" />
          <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">
            პროფილი
          </h1>
        </div>

        {/* 2-Column Main Profile Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* Left Navigation Sidebar Menu (4 cols) */}
          <div className="md:col-span-4 border-r-0 md:border-r border-gray-100 pr-0 md:pr-8 space-y-1">
            {[
              { id: "edit_profile", label: "პროფილის რედაქტირება" },
              { id: "orders", label: "შეკვეთები" },
              { id: "wishlist", label: "ვიშლისტი" },
              { id: "addresses", label: "მისამართები" },
              { id: "notifications", label: "SMS/Mail შეტყობინებები" },
              { id: "payments", label: "გადახდები" },
              { id: "password", label: "პაროლი" },
              { id: "security", label: "უსაფრთხოების პოლიტიკა" },
              { id: "faq", label: "ხშირად დასმული კითხვები" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
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
                onClick={() => setUser(null)}
                className="w-full text-left px-4 py-3 text-xs md:text-sm text-red-500 hover:bg-red-50 rounded-xl cursor-pointer transition-colors"
              >
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

                {/* Phone input (Disabled background style) */}
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 block px-2">ტელეფონის ნომერი</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-13 px-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-700 outline-none"
                  />
                </div>

                {/* Email input with Pencil icon */}
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 block px-2">ელფოსტა</label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ელფოსტა"
                      className="w-full h-13 pl-4 pr-10 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <Pencil className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" />
                  </div>
                </div>

                {/* First Name input with Pencil icon */}
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 block px-2">სახელი</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="სახელი"
                      className="w-full h-13 pl-4 pr-10 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <Pencil className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" />
                  </div>
                </div>

                {/* Last Name input with Pencil icon */}
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 block px-2">გვარი</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="გვარი"
                      className="w-full h-13 pl-4 pr-10 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <Pencil className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" />
                  </div>
                </div>

                {/* Georgian Citizenship Switch Box */}
                <div className="h-13 px-4 bg-[#F1F3F6] rounded-2xl flex items-center justify-between">
                  <span className="text-xs md:text-sm text-gray-800">საქართველოს მოქალაქე</span>
                  <button
                    type="button"
                    onClick={() => setIsGeorgianCitizen(!isGeorgianCitizen)}
                    className={`w-12 h-6 rounded-full relative p-0.5 transition-colors cursor-pointer ${
                      isGeorgianCitizen ? "bg-[#EE5B27]" : "bg-gray-300"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isGeorgianCitizen ? "translate-x-6" : ""
                    }`} />
                  </button>
                </div>

                {/* Personal ID input with Pencil icon */}
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 block px-2">პირადი ნომერი</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="პირადი ნომერი"
                      className="w-full h-13 pl-4 pr-10 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <Pencil className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" />
                  </div>
                </div>

                {/* Save/Update Button - Orange Brand Action */}
                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full h-13 bg-[#EE5B27] hover:bg-[#d94f1f] text-white rounded-2xl text-sm cursor-pointer transition-colors"
                  >
                    {isSaved ? "შენახულია!" : "განახლება"}
                  </button>
                </div>

              </form>
            )}

            {/* 2. Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-5">
                <h2 className="text-xl text-gray-900 border-b border-gray-100 pb-3">
                  შეკვეთები ({orders.length})
                </h2>

                {orders.length === 0 ? (
                  <div className="bg-[#F8FAFC] rounded-2xl p-8 text-center text-gray-500 space-y-2">
                    <Package className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="text-xs md:text-sm">შეკვეთების ისტორია ცარიელია</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-[#F8FAFC] rounded-2xl p-5 border border-gray-100 space-y-3">
                      <div className="flex items-center justify-between text-xs border-b border-gray-200/60 pb-3">
                        <div>
                          <span className="text-gray-400">შეკვეთა N:</span> <span className="text-gray-900 font-mono">{order.id}</span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">{order.date}</span>
                        </div>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[11px]">
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-2 pt-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <img src={item.image} alt={item.title} className="w-10 h-10 object-contain bg-white p-1 rounded-lg" />
                              <span className="text-gray-900 truncate max-w-[200px]">{item.title}</span>
                            </div>
                            <span className="text-gray-900 font-mono">{((item.discountPrice || item.price) * item.quantity).toFixed(2)} ₾</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-gray-200/60 flex justify-between items-center text-xs">
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="inline-flex items-center gap-1 bg-[#111111] hover:bg-black text-white px-3 py-1.5 rounded-xl text-[11px] cursor-pointer transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>🧾 ინვოისი</span>
                        </button>
                        <div className="text-right">
                          <span className="text-gray-400 text-[11px] block">სულ გადახდილი:</span>
                          <span className="text-blue-600 font-mono text-base">{order.totalAmount.toFixed(2)} ₾</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="space-y-4">
                <h2 className="text-xl text-gray-900 border-b border-gray-100 pb-3">
                  ვიშლისტი ({wishlist.length})
                </h2>
                {wishlist.length === 0 ? (
                  <p className="text-xs text-gray-500">ვიშლისტი ცარიელია</p>
                ) : (
                  <div className="space-y-3">
                    {wishlist.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-gray-100 text-xs">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.title} className="w-12 h-12 object-contain bg-white p-1 rounded-xl" />
                          <span className="text-gray-900">{item.title}</span>
                        </div>
                        <span className="text-gray-900 font-mono">{(item.discountPrice || item.price).toFixed(2)} ₾</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="text-xl text-gray-900">მისამართები</h2>
                  <button className="inline-flex items-center gap-1 bg-[#F1F3F6] hover:bg-gray-200 text-gray-900 px-3 py-1.5 rounded-xl text-xs cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                    <span>ახალი მისამართი</span>
                  </button>
                </div>
                <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100 text-xs space-y-1">
                  <span className="text-blue-600 block">მთავარი მისამართი</span>
                  <p className="text-gray-900">თბილისი, ჭავჭავაძის გამზირი N34, ბინა 12</p>
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
                      onClick={() => setSmsNotify(!smsNotify)}
                      className={`w-12 h-6 rounded-full relative p-0.5 transition-colors cursor-pointer ${
                        smsNotify ? "bg-[#EE5B27]" : "bg-gray-300"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${smsNotify ? "translate-x-6" : ""}`} />
                    </button>
                  </div>

                  <div className="h-13 px-4 bg-[#F1F3F6] rounded-2xl flex items-center justify-between">
                    <span className="text-xs md:text-sm text-gray-800">Mail შეტყობინებები ფასდაკლებებზე</span>
                    <button
                      type="button"
                      onClick={() => setEmailNotify(!emailNotify)}
                      className={`w-12 h-6 rounded-full relative p-0.5 transition-colors cursor-pointer ${
                        emailNotify ? "bg-[#EE5B27]" : "bg-gray-300"
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
                <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-gray-900">Visa **** 4892</p>
                      <span className="text-[11px] text-gray-400">ვადა: 08/28</span>
                    </div>
                  </div>
                  <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">აქტიური</span>
                </div>
              </div>
            )}

            {/* 7. Password Tab */}
            {activeTab === "password" && (
              <form onSubmit={(e) => { e.preventDefault(); setIsSaved(true); setTimeout(() => setIsSaved(false), 2000); }} className="space-y-4">
                <h2 className="text-xl text-gray-900 border-b border-gray-100 pb-3">
                  პაროლის შეცვლა
                </h2>
                <div className="space-y-3">
                  <input type="password" placeholder="მიმდინარე პაროლი" className="w-full h-13 px-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 focus:outline-none" />
                  <input type="password" placeholder="ახალი პაროლი" className="w-full h-13 px-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 focus:outline-none" />
                  <input type="password" placeholder="გაამეორეთ ახალი პაროლი" className="w-full h-13 px-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 focus:outline-none" />
                </div>
                <button type="submit" className="w-full h-13 bg-[#EE5B27] hover:bg-[#d94f1f] text-white rounded-2xl text-sm cursor-pointer transition-colors">
                  {isSaved ? "პაროლი შეცვლილია!" : "პაროლის განახლება"}
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
    </div>
  );
}

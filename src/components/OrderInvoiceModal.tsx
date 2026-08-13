"use client";

import React from "react";
import { OrderRecord } from "@/store/useStore";
import { Printer, X, ShieldCheck, Download, CheckCircle2 } from "lucide-react";

interface OrderInvoiceModalProps {
  order: OrderRecord;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderInvoiceModal({ order, isOpen, onClose }: OrderInvoiceModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-[32px] max-w-2xl w-full p-6 md:p-8 shadow-2xl relative space-y-6 my-8 animate-in fade-in zoom-in-95 print:p-0 print:shadow-none print:max-w-none print:w-full print:rounded-none">
        
        {/* Top Actions (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base text-gray-900">ოფიციალური ინვოისი / საგარანტიო ტალონი</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-[#111111] hover:bg-black text-white px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>ბეჭდვა / PDF შენახვა</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Body */}
        <div className="space-y-6 text-gray-900 text-xs md:text-sm font-sans print:text-black">
          
          {/* Invoice Header */}
          <div className="flex items-start justify-between border-b border-gray-200 pb-6">
            <div>
              <div className="text-3xl text-gray-900 tracking-tighter flex items-center gap-0.5 mb-1">
                <span>spilo</span>
                <span className="text-blue-600">.</span>
              </div>
              <p className="text-xs text-gray-500">შპს სპილო • ს/კ: 405928410</p>
              <p className="text-xs text-gray-500">თბილისი, ჭავჭავაძის გამზირი N34</p>
              <p className="text-xs text-gray-500">info@spilo.ge • +995 (32) 2 900 000</p>
            </div>
            <div className="text-right space-y-1">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-mono inline-block">
                ინვოისი N: {order.id}
              </span>
              <p className="text-xs text-gray-500 block pt-1">თარიღი: {order.date}</p>
              <p className="text-xs text-emerald-600 block">სტატუსი: {order.status}</p>
            </div>
          </div>

          {/* Customer & Payment Details Grid */}
          <div className="grid grid-cols-2 gap-4 bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100 print:border-gray-300">
            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">მყიდველი</span>
              <p className="text-gray-900">{order.address.split(",")[0] || "ბექა პაპიაშვილი"}</p>
              <p className="text-gray-600 text-xs">{order.address}</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">გადახდის მეთოდი</span>
              <p className="text-gray-900">{order.paymentMethod}</p>
              <p className="text-emerald-600 text-xs">გადახდილია სრულად</p>
            </div>
          </div>

          {/* Itemized Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-2">პროდუქტი</th>
                  <th className="py-2.5 px-2 text-center">რაოდ.</th>
                  <th className="py-2.5 px-2 text-right">ფასი</th>
                  <th className="py-2.5 px-2 text-right">სულ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <tr key={item.id} className="text-xs">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-10 h-10 object-contain bg-gray-50 p-1 rounded-lg print:hidden" 
                        />
                        <div>
                          <p className="text-gray-900">{item.title}</p>
                          <span className="text-[10px] text-gray-400">ID: {item.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-mono">{item.quantity}</td>
                    <td className="py-3 px-2 text-right font-mono">
                      {(item.discountPrice || item.price).toFixed(2)} ₾
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-gray-900">
                      {((item.discountPrice || item.price) * item.quantity).toFixed(2)} ₾
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Totals */}
          <div className="border-t border-gray-200 pt-4 flex flex-col items-end space-y-1.5 text-xs">
            <div className="flex justify-between w-64 text-gray-600">
              <span>ქვეჯამი:</span>
              <span className="font-mono">{order.totalAmount.toFixed(2)} ₾</span>
            </div>
            <div className="flex justify-between w-64 text-gray-600">
              <span>მიწოდება:</span>
              <span className="text-emerald-600">0.00 ₾ (უფასო)</span>
            </div>
            <div className="flex justify-between w-64 text-sm text-gray-900 pt-2 border-t border-gray-200">
              <span>სულ გადახდილი:</span>
              <span className="text-base text-blue-600 font-mono">{order.totalAmount.toFixed(2)} ₾</span>
            </div>
          </div>

          {/* Warranty & Footer Stamp */}
          <div className="border-t border-gray-100 pt-6 flex items-center justify-between text-[11px] text-gray-400">
            <div className="space-y-1">
              <p className="text-gray-600">✓ პროდუქციაზე მოქმედებს 2 წლიანი ოფიციალური გარანტია</p>
              <p>გმადლობთ, რომ სარგებლობთ spilo.ge-ს სერვისით!</p>
            </div>
            <div className="border border-dashed border-gray-300 rounded-xl p-2.5 text-center text-gray-400 w-32 print:border-black">
              <span>შპს სპილო</span>
              <span className="block text-[9px]">[ ბეჭდის ადგილი ]</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

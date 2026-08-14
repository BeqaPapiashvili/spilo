"use client";

import React, { useState } from "react";
import { MessageSquare, Star, CheckCircle, XCircle, Trash2 } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([
    { id: "rev-1", author: "გიორგი მ.", rating: 5, date: "12 აგვისტო, 2026", productTitle: "iPhone 16 Pro", comment: "ძალიან კმაყოფილი ვარ, მიწოდება იყო უსწრაფესი!", status: "APPROVED" },
    { id: "rev-2", author: "ნინო ქ.", rating: 4, date: "10 აგვისტო, 2026", productTitle: "DJI Neo Drone", comment: "კარგი დრონია, დამწყებებისთვის იდეალურია.", status: "PENDING" },
  ]);

  const handleApprove = (id: string) => {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r)));
  };

  const handleReject = (id: string) => {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">შეფასებები & მოდერაცია</h1>
          <p className="text-xs text-gray-500 mt-1">მომხმარებელთა მიმოხილვების დადასტურება, უარყოფა და მოდერაცია.</p>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-xs">{r.author}</span>
                <span className="text-[10px] text-gray-400">• {r.productTitle}</span>
                <div className="flex items-center gap-0.5 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-bold text-gray-900 ml-1">{r.rating}</span>
                </div>
              </div>
              <p className="text-xs text-gray-700">{r.comment}</p>
              <span className="text-[10px] text-gray-400 block">{r.date}</span>
            </div>

            <div className="flex items-center gap-2">
              {r.status === "PENDING" ? (
                <>
                  <button
                    onClick={() => handleApprove(r.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    დადასტურება
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    უარყოფა
                  </button>
                </>
              ) : (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  r.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}>
                  {r.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

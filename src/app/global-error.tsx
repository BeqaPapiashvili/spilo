"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);
  return (
    <html lang="ka">
      <body className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center space-y-4 border border-gray-100">
          <h1 className="text-xl text-gray-900">შეცდომა გვერდის ჩატვირთვისას</h1>
          <p className="text-sm text-gray-500">დაფიქსირდა ტექნიკური ხარვეზი. გთხოვთ სცადოთ ხელახლა.</p>
          <button
            type="button"
            onClick={() => reset()}
            className="h-11 px-6 rounded-xl bg-zinc-900 text-white text-sm"
          >
            ხელახლა ცდა
          </button>
        </div>
      </body>
    </html>
  );
}

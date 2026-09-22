export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="h-8 w-48 bg-zinc-100 rounded-xl mb-6 animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-72 bg-zinc-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function Bone({ className = "" }: { className?: string }) {
  return <div className={`shimmer ${className}`} />;
}

export function ProductPageLoading() {
  return (
    <div className="min-h-screen bg-white pb-24 md:pb-16" aria-busy="true" aria-label="პროდუქტი იტვირთება">
      <div className="py-3.5 bg-white border-b border-gray-100 mb-4 md:mb-6">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1560px] flex items-center gap-2">
          <Bone className="h-3 w-14 rounded-md" />
          <Bone className="h-3 w-3 rounded-full" />
          <Bone className="h-3 w-16 rounded-md" />
          <Bone className="h-3 w-3 rounded-full hidden sm:block" />
          <Bone className="h-3 w-28 rounded-md hidden sm:block" />
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
        <Bone className="h-3 w-24 rounded-md mb-4 hidden md:block" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            <Bone className="w-full aspect-square max-h-[560px] rounded-[24px]" />
            <div className="flex gap-2 mt-3 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <Bone key={i} className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl shrink-0" />
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <Bone className="h-5 w-24 rounded-full" />
            <div className="space-y-2">
              <Bone className="h-6 w-full rounded-lg" />
              <Bone className="h-6 w-4/5 rounded-lg" />
            </div>
            <Bone className="h-10 w-36 rounded-xl" />
            <Bone className="h-[72px] w-full rounded-2xl" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Bone key={i} className="w-9 h-9 rounded-full shrink-0" />
              ))}
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Bone key={i} className="h-10 flex-1 rounded-xl" />
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <Bone className="h-12 flex-1 rounded-2xl" />
              <Bone className="h-12 w-12 rounded-2xl shrink-0" />
              <Bone className="h-12 w-12 rounded-2xl shrink-0" />
            </div>
          </div>
        </div>
      </div>

      <div
        className="lg:hidden fixed left-3 right-3 z-40 bg-white/92 border border-gray-200/80 rounded-[22px] p-2.5 flex items-center justify-between gap-3"
        style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex-1 space-y-1.5 pl-1">
          <Bone className="h-3 w-24 rounded-md" />
          <Bone className="h-4 w-16 rounded-md" />
        </div>
        <Bone className="h-11 w-28 rounded-2xl shrink-0" />
      </div>
    </div>
  );
}

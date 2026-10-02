import { resolveHomeCategoryFrame, type HomeCategoryCard } from "@/types/homeCategoryStrip";

export function HomeCategoryCardFace({ card }: { card: HomeCategoryCard }) {
  const frame = resolveHomeCategoryFrame(card);

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[10px] bg-[#fff4db]"
      style={{ width: frame.width, height: frame.height }}
    >
      <span className="pointer-events-none absolute left-3 top-3 z-10 text-[12px] font-normal leading-4 whitespace-pre-line text-[#101010]">
        {card.label}
      </span>
      {frame.images.map((image) => (
        <img
          key={image.id}
          src={image.src}
          alt=""
          draggable={false}
          className="pointer-events-none absolute max-w-none object-contain"
          style={{
            left: image.x,
            top: image.y,
            width: image.w,
            height: image.h,
            transform: `rotate(${image.rotate}deg)`,
            transformOrigin: "center center",
          }}
        />
      ))}
    </div>
  );
}

export function AllCategoriesTile() {
  return (
    <span className="relative block h-[100px] w-[125px] shrink-0 rounded-[10px] bg-[#0e1015]">
      <img
        src="/home/categories/all-categories.svg"
        alt=""
        width={32}
        height={32}
        draggable={false}
        className="absolute left-3 top-[14px] block"
      />
      <span className="absolute left-4 top-[50px] text-left text-[12px] font-normal leading-4 text-white">
        ყველა
        <br />
        კატეგორია
      </span>
    </span>
  );
}

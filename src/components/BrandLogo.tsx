import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  className?: string;
  imgClassName?: string;
  inverted?: boolean;
  onClick?: () => void;
}

export function BrandLogo({
  href = "/",
  className = "",
  imgClassName = "h-8 sm:h-10 w-auto",
  inverted = false,
  onClick,
}: BrandLogoProps) {
  const image = (
    <img
      src={inverted ? "/briz-logo-on-dark.png" : "/briz-logo.png"}
      alt="briz"
      className={`${imgClassName} object-contain object-left`}
    />
  );

  if (!href) {
    return <span className={className}>{image}</span>;
  }

  return (
    <Link href={href} onClick={onClick} className={`inline-flex items-center shrink-0 ${className}`} aria-label="briz">
      {image}
    </Link>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";

type BrandLogoProps = {
  className?: string;
  variant?: "hero" | "compact";
};

const variantClasses: Record<NonNullable<BrandLogoProps["variant"]>, string> = {
  hero: "w-[96px] sm:w-[110px] md:w-[132px] lg:w-[145px] h-auto object-contain",
  compact: "w-[88px] sm:w-[96px] md:w-[110px] h-auto object-contain",
};

export function BrandLogo({ className = "", variant = "hero" }: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span className={`inline-block font-black tracking-wide text-[var(--brand-accent)] ${className}`}>
        6 loco
      </span>
    );
  }

  return (
    <Image
      src="/logo-6loco.png"
      alt="6 loco"
      width={520}
      height={180}
      sizes={variant === "hero" ? "(max-width: 639px) 96px, (max-width: 767px) 110px, (max-width: 1023px) 132px, 145px" : "(max-width: 639px) 88px, (max-width: 767px) 96px, 110px"}
      priority={variant === "hero"}
      onError={() => setHasError(true)}
      className={`${variantClasses[variant]} ${className}`}
    />
  );
}

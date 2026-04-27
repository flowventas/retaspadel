"use client";

import Image from "next/image";
import { useState } from "react";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

export function BrandLogo({ className = "", compact = false }: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span className={`font-black tracking-wide text-[var(--brand-accent)] ${className}`}>
        6loco
      </span>
    );
  }

  return (
    <Image
      src="/logo-6loco.png"
      alt="6loco"
      width={520}
      height={180}
      onError={() => setHasError(true)}
      className={`${compact ? "h-10 sm:h-12" : "h-12 sm:h-14"} w-auto object-contain ${className}`}
    />
  );
}

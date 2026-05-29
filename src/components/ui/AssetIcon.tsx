"use client";

import { useState } from "react";

type AssetIconProps = {
  src: string;
  alt: string;
  size?: "sm" | "md";
};

export function AssetIcon({ src, alt, size = "md" }: AssetIconProps) {
  const [failed, setFailed] = useState(false);
  const className = size === "sm" ? "is-sm" : "is-md";

  return (
    <span className={`asset-icon ${className}`}>
      {failed ? (
        <span className="asset-fallback">{alt.slice(0, 3)}</span>
      ) : (
        <img
          src={src}
          alt={alt}
          title={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

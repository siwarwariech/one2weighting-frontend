// src/components/Avatar.tsx
import React from "react";
import defaultAvatar from "@/assets/avatar-default.svg";

export default function Avatar({ src, size = 36, className = "", alt = "avatar" }:{
  src?: string | null; size?: number; className?: string; alt?: string;
}) {
  const [img, setImg] = React.useState(src || defaultAvatar);
  React.useEffect(() => setImg(src || defaultAvatar), [src]);
  return (
    <img
      src={img}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      onError={() => setImg(defaultAvatar)}
    />
  );
}

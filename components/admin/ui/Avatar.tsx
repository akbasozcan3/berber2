import Image from "next/image";
import { cn } from "@/lib/admin/cn";
import { getInitials } from "@/lib/admin/utils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

const imageSizeMap = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

export default function Avatar({ src, name, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden border border-white/[0.06] flex-shrink-0",
          sizeMap[size],
          className
        )}
      >
        <Image
          src={src}
          alt={name}
          width={imageSizeMap[size]}
          height={imageSizeMap[size]}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-[#1A1A1A] border border-white/[0.06] flex items-center justify-center font-medium text-[#C8703A] flex-shrink-0",
        sizeMap[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}

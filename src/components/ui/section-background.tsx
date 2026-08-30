import Image, { type StaticImageData } from "next/image";

type SectionBackgroundProps = {
  src: StaticImageData;
  alt?: string;
  /** 首屏背景传 true，其余分屏懒加载 */
  priority?: boolean;
  unoptimized?: boolean;
  imageClassName?: string;
  className?: string;
};

/** 分屏全出血背景图：铺满整个 section，渐进式模糊占位 */
export function SectionBackground({
  src,
  alt = "",
  priority = false,
  unoptimized = false,
  imageClassName = "object-cover",
  className,
}: SectionBackgroundProps) {
  return (
    <div className={`absolute inset-0 ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        unoptimized={unoptimized}
        placeholder="blur"
        sizes="100vw"
        className={imageClassName}
      />
    </div>
  );
}

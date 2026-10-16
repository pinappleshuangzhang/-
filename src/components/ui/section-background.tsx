import Image, { type StaticImageData } from "next/image";

type SectionBackgroundProps = {
  src: StaticImageData;
  alt?: string;
  /** 首屏背景传 true，其余分屏懒加载 */
  priority?: boolean;
  unoptimized?: boolean;
  /** 需保留细节的实拍背景传 95（取值须在 next.config 的 images.qualities 内） */
  quality?: number;
  imageClassName?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
};

/** 分屏全出血背景图：铺满整个 section，渐进式模糊占位 */
export function SectionBackground({
  src,
  alt = "",
  priority = false,
  unoptimized = false,
  quality,
  imageClassName = "object-cover",
  className,
  onLoad,
  onError,
}: SectionBackgroundProps) {
  return (
    <div className={`absolute inset-0 ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        unoptimized={unoptimized}
        quality={quality}
        placeholder="blur"
        sizes="100vw"
        className={imageClassName}
        onLoad={onLoad}
        onError={onError}
      />
    </div>
  );
}

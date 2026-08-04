import Image, { type StaticImageData } from "next/image";
import { RepelBackground } from "@/components/effects/repel-background";

type SectionBackgroundProps = {
  src: StaticImageData;
  alt?: string;
  /** 首屏背景传 true，其余分屏懒加载 */
  priority?: boolean;
  /** 开启鼠标排斥交互效果（WebGL 层叠加在静态图之上，自动降级） */
  interactive?: boolean;
  className?: string;
};

/** 分屏全出血背景图：铺满整个 section，渐进式模糊占位 */
export function SectionBackground({
  src,
  alt = "",
  priority = false,
  interactive = false,
  className,
}: SectionBackgroundProps) {
  return (
    <div className={`absolute inset-0 ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        placeholder="blur"
        sizes="100vw"
        className="object-cover"
      />
      {interactive && <RepelBackground src={src.src} />}
    </div>
  );
}

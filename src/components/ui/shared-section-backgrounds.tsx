"use client";

import { SectionBackground } from "@/components/ui/section-background";
import { useDesktopMedia } from "@/hooks/use-desktop-media";
import {
  SECTION_BACKGROUNDS,
  type SectionBackgroundKey,
} from "@/lib/section-backgrounds";

type SharedSectionBackgroundsProps = {
  active: SectionBackgroundKey | null;
};

/**
 * 分屏共享背景层：每种背景只挂载一份。
 * 同背景的多屏切换时不重复加载图片、不重复挂 DOM。
 */
export function SharedSectionBackgrounds({
  active,
}: SharedSectionBackgroundsProps) {
  const isDesktop = useDesktopMedia();

  return (
    <>
      {(Object.keys(SECTION_BACKGROUNDS) as SectionBackgroundKey[]).map(
        (key) => {
          const config = SECTION_BACKGROUNDS[key];
          const isActive = active === key;
          const skipImage = Boolean(config.desktopOnly) && !isDesktop;

          return (
            <div
              key={key}
              data-shared-bg={key}
              aria-hidden={!isActive}
              className={`absolute inset-0 ${config.fallbackClassName} ${isActive ? "" : "invisible"}`}
            >
              {skipImage ? null : (
                <SectionBackground
                  src={config.src}
                  priority={config.priority}
                  unoptimized={config.unoptimized}
                  imageClassName={config.imageClassName}
                />
              )}
            </div>
          );
        },
      )}
    </>
  );
}

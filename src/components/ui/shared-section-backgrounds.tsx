"use client";

import { useState } from "react";
import { SectionBackground } from "@/components/ui/section-background";
import { useDesktopMedia } from "@/hooks/use-desktop-media";
import {
  SECTION_BACKGROUNDS,
  type SectionBackgroundKey,
} from "@/lib/section-backgrounds";

type SharedSectionBackgroundsProps = {
  active: SectionBackgroundKey | null;
  /** 倒数第二屏起预热 activeOnly 背景，避开首屏开场视频 */
  nearEnd?: boolean;
};

/**
 * 分屏共享背景层：每种背景只挂载一份。
 * 同背景的多屏切换时不重复加载图片、不重复挂 DOM。
 */
export function SharedSectionBackgrounds({
  active,
  nearEnd = false,
}: SharedSectionBackgroundsProps) {
  const isDesktop = useDesktopMedia();

  return (
    <>
      {(Object.keys(SECTION_BACKGROUNDS) as SectionBackgroundKey[]).map(
        (key) => (
          <SharedBackgroundLayer
            key={key}
            backgroundKey={key}
            active={active === key}
            nearEnd={nearEnd}
            isDesktop={isDesktop}
          />
        ),
      )}
    </>
  );
}

function SharedBackgroundLayer({
  backgroundKey,
  active,
  nearEnd,
  isDesktop,
}: {
  backgroundKey: SectionBackgroundKey;
  active: boolean;
  nearEnd: boolean;
  isDesktop: boolean;
}) {
  const config = SECTION_BACKGROUNDS[backgroundKey];
  const allow = active || (Boolean(config.activeOnly) && nearEnd);
  const [loaded, setLoaded] = useState(!config.activeOnly);
  if (allow && !loaded) setLoaded(true);

  const skipImage =
    (Boolean(config.desktopOnly) && !isDesktop) ||
    (Boolean(config.activeOnly) && !loaded);

  return (
    <div
      data-shared-bg={backgroundKey}
      aria-hidden={!active}
      className={`absolute inset-0 ${config.fallbackClassName} ${active ? "" : "invisible"}`}
    >
      {skipImage ? null : (
        <SectionBackground
          src={
            !isDesktop && config.mobileSrc ? config.mobileSrc : config.src
          }
          priority={config.priority}
          unoptimized={config.unoptimized}
          quality={config.quality}
          imageClassName={config.imageClassName}
        />
      )}
    </div>
  );
}

import { SectionBackground } from "@/components/ui/section-background";
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
  return (
    <>
      {(Object.keys(SECTION_BACKGROUNDS) as SectionBackgroundKey[]).map(
        (key) => {
          const config = SECTION_BACKGROUNDS[key];
          const isActive = active === key;

          return (
            <div
              key={key}
              aria-hidden={!isActive}
              className={`absolute inset-0 ${config.fallbackClassName} ${isActive ? "" : "invisible"}`}
            >
              <SectionBackground
                src={config.src}
                priority={config.priority}
                imageClassName={config.imageClassName}
              />
            </div>
          );
        },
      )}
    </>
  );
}

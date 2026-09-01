import { forwardRef, type ComponentPropsWithoutRef } from "react";

type ScreenShellProps = ComponentPropsWithoutRef<"section">;

/**
 * 分屏外壳：统一全屏容器尺寸与裁剪。
 * 背景由 SharedSectionBackgrounds 提供，壳本身保持透明。
 */
export const ScreenShell = forwardRef<HTMLElement, ScreenShellProps>(
  function ScreenShell({ className, children, ...props }, ref) {
    return (
      <section
        ref={ref}
        className={`relative h-full min-h-[700px] overflow-hidden ${className ?? ""}`}
        {...props}
      >
        {children}
      </section>
    );
  },
);

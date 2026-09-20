type CopyCheckIconProps = {
  variant: "nav" | "contact";
  className?: string;
};

/** 复制成功对勾：导航 12 稿、最后一屏 51 稿，描边跟随 currentColor */
export function CopyCheckIcon({ variant, className = "" }: CopyCheckIconProps) {
  if (variant === "nav") {
    return (
      <svg
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
        className={`size-[1em] shrink-0 ${className}`}
      >
        <path d="M0.5 6.44444L4.625 10L11.5 2" stroke="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 51 51"
      fill="none"
      aria-hidden="true"
      className={`size-[1em] shrink-0 ${className}`}
    >
      <path
        d="M10 29.7778L21.625 40L41 17"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

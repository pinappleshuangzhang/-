export function ScrollHint() {
  return (
    <div className="flex flex-col items-center gap-1" aria-hidden="true">
      <p className="font-bodoni text-12 uppercase italic text-grey-400">
        Scroll
      </p>
      <span className="relative h-[18px] w-[14px] rounded-rm-12 border border-grey-400">
        <span className="absolute left-1/2 top-[6px] h-[5px] w-px -translate-x-1/2 rounded-full bg-grey-400" />
      </span>
    </div>
  );
}

type ScrollHintCornerProps = React.HTMLAttributes<HTMLDivElement>;

/** 右下角滚动提示：固定在视口右下角，贴 30px 边距，全站共用 */
export function ScrollHintCorner({ className, ...rest }: ScrollHintCornerProps) {
  return (
    <div
      className={`fixed inset-x-0 bottom-[30px] z-50 ${className ?? ""}`}
      {...rest}
    >
      <div className="mx-auto flex w-[calc(100%-60px)] justify-end">
        <ScrollHint />
      </div>
    </div>
  );
}

type SiteNavProps = {
  /** 导航中间内容，默认工作室名，档案分屏可传档案编号标题 */
  center?: React.ReactNode;
};

export function SiteNav({ center }: SiteNavProps) {
  return (
    <header className="fixed inset-x-0 top-[30px] z-50">
      <div className="mx-auto flex w-[calc(100%-60px)] items-center justify-between">
        <button
          type="button"
          aria-label="打开目录"
          className="flex size-10 flex-col items-center justify-center rounded-full bg-white/90 shadow-[0_2px_8px_rgba(19,19,19,0.06)] transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2"
        >
          <span className="flex h-[15px] w-[14px] flex-col justify-between">
            <span className="h-[2px] w-full bg-grey-400" />
            <span className="h-[2px] w-full bg-grey-400" />
            <span className="h-[2px] w-full bg-grey-400" />
          </span>
        </button>

        {center ?? (
          <p className="font-bodoni text-20 uppercase text-grey-400">
            Grava Design Studio
          </p>
        )}

        <div
          className="flex items-center rounded-rm-20 border border-white/70 bg-white/40 p-[2px] backdrop-blur-[1.5px]"
          role="group"
          aria-label="语言切换"
        >
          <button
            type="button"
            aria-pressed="true"
            className="rounded-rm-16 bg-white px-1.5 pt-1 font-bodoni text-16 uppercase text-grey-400 focus-visible:ring-2 focus-visible:ring-grey-400"
          >
            CN
          </button>
          <button
            type="button"
            aria-pressed="false"
            className="rounded-rm-16 px-1.5 pt-1 font-bodoni text-16 uppercase text-grey-300 transition-colors duration-300 hover:text-grey-400 focus-visible:ring-2 focus-visible:ring-grey-400"
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}

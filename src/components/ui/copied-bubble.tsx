import Image from "next/image";

type CopiedFeedbackProps = {
  label: string;
  visible: boolean;
};

const BUBBLE_BODY =
  "flex items-center whitespace-nowrap rounded-rs-4 bg-grey-400 font-serif-sc font-normal uppercase leading-none text-white";

/**
 * 桌面「已复制」气泡（Figma 1489:438）：贴在触发元素正上方，下方三角指向元素。
 * 稿面 60×25 黑底圆角 4，三角 6.93×4.5 向上压 2px、距元素 1.5px；父级需为定位上下文。
 */
export function CopiedBubble({ label, visible }: CopiedFeedbackProps) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-full left-1/2 mb-[calc(var(--su)*1.5)] hidden -translate-x-1/2 flex-col items-center transition-opacity duration-200 ease-out md:flex motion-reduce:transition-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <span
        className={`${BUBBLE_BODY} h-[calc(var(--su)*25)] px-[calc(var(--su)*12)] pb-[calc(var(--su)*2)] text-[length:calc(var(--su)*12)]`}
      >
        {label}
      </span>
      <Image
        src="/contact-survey/bubble-arrow.svg"
        alt=""
        width={7}
        height={5}
        className="-mt-[calc(var(--su)*2)] h-[calc(var(--su)*4.5)] w-[calc(var(--su)*6.93)] rotate-180"
      />
    </span>
  );
}

/**
 * 移动端「已复制」吐司（Figma 1489:596）：屏幕顶部居中、无三角。
 * 稿面 74×29、顶距 61；收起时整块退到屏幕上沿之外（-90 = 61 + 29），
 * 只做位移不做淡入，确保观感是从屏幕外滑进来。
 */
export function CopiedToast({ label, visible }: CopiedFeedbackProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 right-0 top-[61px] z-30 flex justify-center md:hidden"
    >
      <span
        className={`${BUBBLE_BODY} h-[29px] px-4 pb-0.5 text-14 transition-transform duration-300 ease-out motion-reduce:transition-none ${
          visible ? "translate-y-0" : "-translate-y-[90px]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

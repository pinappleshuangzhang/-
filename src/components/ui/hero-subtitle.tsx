import { segmentWords } from "@/components/ui/split-words";

type HeroSubtitleProps = {
  /** 首个 highlight 片段反白在高亮条上；其余文字随容器宽度自然折行 */
  text: string;
  highlight: string;
  className: string;
  highlightClassName?: string;
  barClassName?: string;
  /** 高亮在句尾时改为单行排版，色块延伸到容器右缘（与标题右缘对齐） */
  fillLineEnd?: boolean;
};

function splitText(text: string, highlight: string) {
  const index = highlight ? text.indexOf(highlight) : -1;
  if (index < 0) return { before: text, mark: "", after: "" };
  return {
    before: text.slice(0, index),
    mark: highlight,
    after: text.slice(index + highlight.length),
  };
}

/** 逐词入场；空格保留为普通空格，词间可折行 */
function FlowWords({ text }: { text: string }) {
  return (
    <>
      {segmentWords(text).map((word, index) =>
        word.trim() === "" ? (
          " "
        ) : (
          <span
            key={`${word}-${index}`}
            aria-hidden="true"
            className="sd-word inline-block opacity-0"
          >
            {word}
          </span>
        ),
      )}
    </>
  );
}

/** 首屏副标题：逐词入场，高亮片段的色块由 sondaven-reveal 从左擦入 */
export function HeroSubtitle({
  text,
  highlight,
  className,
  highlightClassName = "",
  barClassName = "",
  fillLineEnd = false,
}: HeroSubtitleProps) {
  const { before, mark, after } = splitText(text, highlight);
  const fill = fillLineEnd && mark !== "" && after === "";

  const markNode = mark ? (
    <span
      className={`relative whitespace-nowrap text-white ${
        fill ? "min-w-0 flex-1" : "inline-block"
      } ${highlightClassName}`}
    >
      <span
        data-sd-bar
        data-sd-delay="0.3"
        aria-hidden="true"
        className={`absolute inset-0 origin-left bg-grey-400 ${barClassName}`}
      />
      <span className="relative">
        <FlowWords text={mark} />
      </span>
    </span>
  ) : null;

  return (
    <p
      data-sd-words
      data-sd-delay="0.3"
      aria-label={text}
      className={className}
    >
      {fill ? (
        <span className="flex self-stretch whitespace-nowrap">
          {before ? (
            <span>
              <FlowWords text={before} />
            </span>
          ) : null}
          {markNode}
        </span>
      ) : (
        <span className="block">
          {before ? <FlowWords text={before} /> : null}
          {markNode}
          {after ? <FlowWords text={after} /> : null}
        </span>
      )}
    </p>
  );
}

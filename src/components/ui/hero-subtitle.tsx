import { SplitWords } from "@/components/ui/split-words";

type HeroSubtitleProps = {
  /** 用 \n 分行；每行内首个 highlight 片段反白在高亮条上 */
  text: string;
  highlight: string;
  className: string;
  lineClassName?: string;
  highlightClassName?: string;
  barClassName?: string;
  /** 高亮在行尾时把色块延伸到容器右缘（与标题右缘对齐） */
  fillLineEnd?: boolean;
};

function splitLine(line: string, highlight: string) {
  const index = highlight ? line.indexOf(highlight) : -1;
  if (index < 0) return { before: line, mark: "", after: "" };
  return {
    before: line.slice(0, index),
    mark: highlight,
    after: line.slice(index + highlight.length),
  };
}

/** 首屏副标题：逐词入场，高亮片段的色块由 sondaven-reveal 从左擦入 */
export function HeroSubtitle({
  text,
  highlight,
  className,
  lineClassName = "",
  highlightClassName = "",
  barClassName = "",
  fillLineEnd = false,
}: HeroSubtitleProps) {
  const lines = text.split("\n");

  return (
    <p
      data-sd-words
      data-sd-delay="0.3"
      aria-label={lines.join(" ")}
      className={className}
    >
      {lines.map((line, lineIndex) => {
        const { before, mark, after } = splitLine(line, highlight);
        const fill = fillLineEnd && mark !== "" && after === "";
        return (
          <span
            key={`${line}-${lineIndex}`}
            className={`flex whitespace-nowrap ${fill ? "self-stretch" : ""} ${lineClassName}`}
          >
            {before ? (
              <span>
                <SplitWords text={before} />
              </span>
            ) : null}
            {mark ? (
              <span
                className={`relative text-white ${fill ? "min-w-0 flex-1" : ""} ${highlightClassName}`}
              >
                <span
                  data-sd-bar
                  data-sd-delay="0.3"
                  aria-hidden="true"
                  className={`absolute inset-0 origin-left bg-grey-400 ${barClassName}`}
                />
                <span className="relative">
                  <SplitWords text={mark} />
                </span>
              </span>
            ) : null}
            {after ? (
              <span>
                <SplitWords text={after} />
              </span>
            ) : null}
          </span>
        );
      })}
    </p>
  );
}

/** 按词切分：中文用 Intl.Segmenter，英文按空格；闭合标点并回前词以免行首孤标点 */
export function segmentWords(text: string): string[] {
  const attachClosingPunctuation = (segments: string[]) =>
    segments.reduce<string[]>((words, segment) => {
      if (
        /^[，。！？；：、】【）》〉〕］｝”’]+$/u.test(segment) &&
        words.length > 0
      ) {
        words[words.length - 1] += segment;
      } else {
        words.push(segment);
      }
      return words;
    }, []);

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("zh-Hans", { granularity: "word" });
    return attachClosingPunctuation(
      Array.from(segmenter.segment(text), (segment) => segment.segment),
    );
  }
  return attachClosingPunctuation(text.split(/(\s+)/).filter(Boolean));
}

/** 逐词入场：词包在 .sd-word 中，初始透明，由 sondaven-reveal 播动画 */
export function SplitWords({
  text,
  animated = true,
}: {
  text: string;
  animated?: boolean;
}) {
  return (
    <>
      {segmentWords(text).map((word, index) =>
        word.trim() === "" ? (
          "\u00A0"
        ) : (
          <span
            key={`${word}-${index}`}
            aria-hidden="true"
            className={`sd-word inline-block ${animated ? "opacity-0" : ""}`}
          >
            {word}
          </span>
        ),
      )}
    </>
  );
}

import type { OpsBlock } from "@/lib/ops-article";

/**
 * 与作品一相同。封面到正文 32/20，其后图到下一节 56/40，文字到自己的配图 16/12。
 * 作品四的图夹在上下文字之间时，图下间距与图上相同。
 */
export function blockSpacing(
  block: OpsBlock,
  index: number,
  blocks: OpsBlock[],
  matchImageGap = false,
) {
  if (index === 0) return "";
  const previous = blocks[index - 1];
  const title = previous?.kind === "prose" ? (previous.title ?? "") : "";
  if (previous?.kind === "image" && block.kind !== "image") {
    const above = blocks[index - 2];
    if (matchImageGap && above && above.kind !== "image") {
      return "mt-4 max-md:mt-3";
    }
    return index === 1 ? "mt-8 max-md:mt-5" : "mt-14 max-md:mt-10";
  }
  if (block.kind === "image" && previous && previous.kind !== "image") {
    return "mt-4 max-md:mt-3";
  }
  if (block.kind === "points" && previous?.kind === "prose") {
    const hasBody =
      previous.paragraphs.length > 0 ||
      Boolean(previous.bullets?.length) ||
      Boolean(previous.tail?.length);
    if (!hasBody) return "mt-4 max-md:mt-3";
    return /^(三、|六、|3\.|6\.)/.test(title) ? "mt-7 max-md:mt-5" : "mt-8 max-md:mt-5";
  }
  if (block.kind === "prose" && !block.title && previous?.kind === "points") {
    return "mt-9";
  }
  return "mt-14 max-md:mt-10";
}

export function imageCountBefore(blocks: OpsBlock[], index: number) {
  let count = 0;
  for (let i = 0; i < index; i += 1) {
    const block = blocks[i];
    if (!block) continue;
    if (block.kind === "image") count += 1;
    if (block.kind === "points") {
      count += block.items.filter((item) => item.image).length;
    }
  }
  return count;
}

/** 与前三篇作品图同一套上滑：首图 0.28s，其后每张错开 0.05s。 */
export function delayForImage(imageIndex: number) {
  if (imageIndex <= 0) return "0.28";
  return (0.5 + (imageIndex - 1) * 0.05).toFixed(2);
}

export function blockKey(block: OpsBlock, index: number) {
  if (block.kind === "image") return `${index}-${block.src}`;
  if (block.kind === "prose") {
    return `${index}-${block.title ?? block.paragraphs[0] ?? "prose"}`;
  }
  if (block.kind === "questions") return `${index}-${block.items[0] ?? "questions"}`;
  return `${index}-${block.items[0]?.title ?? block.kind}`;
}

export function pointImageOffsets(items: { image?: unknown }[]) {
  return items.reduce<number[]>((offsets, _item, index) => {
    if (index === 0) return [0];
    const previous = offsets[index - 1] ?? 0;
    const previousHasImage = items[index - 1]?.image != null;
    return [...offsets, previous + (previousHasImage ? 1 : 0)];
  }, []);
}

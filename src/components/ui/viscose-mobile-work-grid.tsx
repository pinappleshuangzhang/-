"use client";

import Image from "next/image";

export type ViscoseMobileCard = {
  title: string;
  description: string;
  src: string;
  alt: string;
  categoryIndex: number;
};

type ViscoseMobileWorkGridProps = {
  cards: ViscoseMobileCard[];
  onOpen: (categoryIndex: number) => void;
};

/**
 * 一类多件 / 所有项目：两列小卡（Figma 1269:1720）。
 * 图 177×111（1.6:1），标题 12 衬线，简介 10 / 三行截断。
 */
export function ViscoseMobileWorkGrid({
  cards,
  onOpen,
}: ViscoseMobileWorkGridProps) {
  return (
    <ul className="mt-7 grid grid-cols-2 gap-x-3 gap-y-4">
      {cards.map((card) => (
        <li key={`${card.categoryIndex}-${card.src}`}>
          <button
            type="button"
            onClick={() => onOpen(card.categoryIndex)}
            className="flex w-full flex-col items-start gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2"
          >
            <span className="relative aspect-[1.6/1] w-full overflow-hidden rounded-rs-2">
              <span
                data-mobile-media=""
                className="absolute inset-0 translate-y-[105%]"
              >
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  sizes="45vw"
                  className="object-cover"
                />
              </span>
            </span>
            <span
              data-mobile-copy=""
              className="flex w-full flex-col items-start gap-2 opacity-0"
            >
              <span className="font-bodoni text-12 font-medium capitalize leading-normal text-grey-400">
                {card.title}
              </span>
              {card.description ? (
                <span className="line-clamp-3 font-serif-sc text-10 leading-[18px] text-grey-300">
                  {card.description}
                </span>
              ) : null}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

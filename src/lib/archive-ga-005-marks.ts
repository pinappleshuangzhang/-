/** 第六屏标注：设计稿 1440×800 像素坐标（Figma 664:810） */

export type ExploreLabelMark = {
  kind: "label";
  left: number;
  top: number;
  width: number;
  height: number;
  rotate?: number;
  text: string;
};

export type ExploreGraphicMark = {
  kind: "graphic";
  left: number;
  top: number;
  width: number;
  height: number;
  rotate?: number;
  src: string;
  innerWidth: number;
  innerHeight: number;
};

export type ExploreTickMark = {
  kind: "ticks";
  left: number;
  top: number;
  count: number;
  rotate?: number;
  boxWidth?: number;
  boxHeight?: number;
};

export type ExploreMark =
  | ExploreLabelMark
  | ExploreGraphicMark
  | ExploreTickMark;

export type ExploreGroup = {
  id: string;
  ariaLabel: string;
  marks: ExploreMark[];
};

const TICK = "/archive-ga-005/tick.svg";

export const EXPLORE_GROUPS: ExploreGroup[] = [
  {
    id: "exp-001",
    ariaLabel: "EXP_001，可变字体，密度 42%，测试中",
    marks: [
      {
        kind: "graphic",
        left: 390.52,
        top: 222.76,
        width: 3.118,
        height: 36.509,
        rotate: -0.18,
        src: "/archive-ga-005/vector-723.svg",
        innerWidth: 4.95,
        innerHeight: 36.77,
      },
      {
        kind: "graphic",
        left: 393.67,
        top: 267.64,
        width: 37.09,
        height: 183.131,
        rotate: -0.18,
        src: "/archive-ga-005/vector-724.svg",
        innerWidth: 37,
        innerHeight: 183.32,
      },
      {
        kind: "label",
        left: -14,
        top: 189,
        width: 44.488,
        height: 14.764,
        rotate: 2.31,
        text: "EXP_001",
      },
      {
        kind: "label",
        left: 140,
        top: 196,
        width: 85.455,
        height: 16.417,
        rotate: 2.31,
        text: "TYPE / VARIABLE",
      },
      {
        kind: "label",
        left: 310,
        top: 203,
        width: 69.468,
        height: 15.772,
        rotate: 2.31,
        text: "DENSITY 42%",
      },
      {
        kind: "label",
        left: 405.95,
        top: 353.68,
        width: 20.898,
        height: 87.824,
        rotate: -95.24,
        text: "STATUS TESTING",
      },
    ],
  },
  {
    id: "exp-002",
    ariaLabel: "EXP_002，IP 类型，密度 56%，测试中",
    marks: [
      {
        kind: "label",
        left: 518,
        top: 183,
        width: 45.488,
        height: 14.804,
        rotate: 2.31,
        text: "EXP_002",
      },
      {
        kind: "label",
        left: 716,
        top: 189,
        width: 45.488,
        height: 14.804,
        rotate: 2.31,
        text: "TYPE / IP",
      },
      {
        kind: "label",
        left: 887,
        top: 198,
        width: 69.468,
        height: 15.772,
        rotate: 2.31,
        text: "DENSITY 56%",
      },
      {
        kind: "graphic",
        left: 1025.39,
        top: 554,
        width: 5.886,
        height: 36.623,
        rotate: -4.55,
        src: "/archive-ga-005/vector-725.svg",
        innerWidth: 4.95,
        innerHeight: 36.77,
      },
      {
        kind: "graphic",
        left: 992.74,
        top: 363,
        width: 30.433,
        height: 183.74,
        rotate: 175.62,
        src: "/archive-ga-005/vector-726.svg",
        innerWidth: 17,
        innerHeight: 183.06,
      },
      {
        kind: "label",
        left: 1001,
        top: 361,
        width: 26.961,
        height: 87.956,
        rotate: -99.35,
        text: "STATUS TESTING",
      },
      {
        kind: "ticks",
        left: 964,
        top: 221,
        count: 7,
        rotate: 79,
        boxWidth: 25.243,
        boxHeight: 103.139,
      },
      {
        kind: "ticks",
        left: 556,
        top: 610,
        count: 11,
      },
    ],
  },
  {
    id: "exp-003",
    ariaLabel: "EXP_003，IP 类型，密度 56%",
    marks: [
      {
        kind: "label",
        left: 1082,
        top: 214,
        width: 45.01,
        height: 13.034,
        text: "EXP_003",
      },
      {
        kind: "label",
        left: 1256,
        top: 216,
        width: 45.488,
        height: 14.804,
        rotate: 2.31,
        text: "TYPE / IP",
      },
      {
        kind: "label",
        left: 1427,
        top: 217,
        width: 69.468,
        height: 15.772,
        rotate: 2.31,
        text: "DENSITY 56%",
      },
      {
        kind: "ticks",
        left: 1118,
        top: 477,
        count: 7,
        rotate: 79,
        boxWidth: 25.243,
        boxHeight: 103.139,
      },
    ],
  },
];

export const EXPLORE_TICK_SRC = TICK;

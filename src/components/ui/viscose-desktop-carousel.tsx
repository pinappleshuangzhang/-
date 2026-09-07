"use client";

import type { ComponentProps } from "react";
import Carousel from "@/vendor/viscose/carousel";

/** 仅桌面动态导入此文件，手机不会下载 Three.js 与 Shader。 */
export function ViscoseDesktopCarousel(
  props: ComponentProps<typeof Carousel>,
) {
  return <Carousel {...props} />;
}

"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { EffectComposer } from "@react-three/postprocessing";
import {
  SRGBColorSpace,
  Vector2,
  type PerspectiveCamera,
  type Texture,
} from "three";
import { RepelEffect } from "./repel-effect";

const CAMERA_DIST = 5;

/** 把图片按 cover 铺满正对相机的平面（等同 CSS object-cover） */
function CoverPhoto({ url }: { url: string }) {
  const texture = useTexture(url, (loaded: Texture) => {
    loaded.colorSpace = SRGBColorSpace;
  });
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const size = useThree((state) => state.size);

  const viewH = 2 * Math.tan((camera.fov * Math.PI) / 360) * CAMERA_DIST;
  const viewW = viewH * (size.width / size.height);
  const image = texture.image as { width: number; height: number };
  const aspect = image.width / image.height;
  const height = Math.max(viewH, viewW / aspect);

  return (
    <mesh scale={[height * aspect, height, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

/** 排斥效果 + 指针跟踪（监听 window，画布被前景内容遮挡时依然生效） */
function Repel({ radius, force }: { radius: number; force: number }) {
  const effect = useMemo(
    () => new RepelEffect({ radius, force }),
    [radius, force],
  );
  const gl = useThree((state) => state.gl);
  const targetRef = useRef(new Vector2(-10, -10));

  useEffect(() => {
    const el = gl.domElement;
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      targetRef.current.set(
        (event.clientX - rect.left) / rect.width,
        1 - (event.clientY - rect.top) / rect.height,
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl]);

  useFrame((state, delta) => {
    // 指针平滑追踪（帧率无关的阻尼）
    effect.mouseUniform.lerp(targetRef.current, 1 - Math.exp(-8 * delta));
    effect.setAspect(state.size.width / state.size.height);
  });

  return (
    <EffectComposer>
      <primitive object={effect} />
    </EffectComposer>
  );
}

export type RepelCanvasProps = {
  src: string;
  radius?: number;
  force?: number;
  /** false 时暂停渲染循环（分屏不在视口内时省电） */
  active?: boolean;
};

export default function RepelCanvas({
  src,
  radius = 0.1,
  force = 0.2,
  active = true,
}: RepelCanvasProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, CAMERA_DIST] }}
      gl={{ alpha: true, antialias: false }}
      className="pointer-events-none"
      aria-hidden="true"
    >
      {/* useTexture 会挂起：纹理就绪前画布保持透明，露出下层静态图 */}
      <Suspense fallback={null}>
        <CoverPhoto url={src} />
      </Suspense>
      <Repel radius={radius} force={force} />
    </Canvas>
  );
}

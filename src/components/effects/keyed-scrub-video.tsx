"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export type KeyedScrubVideoHandle = {
  /** 把视频定位到 0~1 进度处并绘制该帧 */
  seekTo: (progress: number) => void;
};

type KeyedScrubVideoProps = {
  src: string;
  className?: string;
  /** 首帧绘制完成（可隐藏静态占位图） */
  onFirstFrame?: () => void;
  /** 视频不可用时回调（保留静态占位图） */
  onError?: () => void;
};

/**
 * WebGL 亮度键控 + 滚动擦撦视频：
 * 把接近纯黑的像素实时抠为透明（视频四周的黑色背景），
 * 画面中部的洞口区域受保护，内部黑色原样保留。
 * 视频不自动播放，帧位置完全由 seekTo 驱动。
 */
const VERTEX_SHADER = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    // uv 的 y 轴取屏幕向下，与视频像素坐标一致
    vUv = vec2(aPosition.x * 0.5 + 0.5, 0.5 - aPosition.y * 0.5);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uTex;

  // 黑底判定的亮度阈值（带平滑过渡）：
  // 背景不是纯黑，边缘带深灰过渡和投影，阈值调高才能抠干净
  const float LUMA_EDGE_0 = 0.12;
  const float LUMA_EDGE_1 = 0.32;
  // 洞口/砖墙保护区（视频 uv，y 向下）：区内黑色不抠除
  const vec2 PROTECT_MIN = vec2(0.55, 0.15);
  const vec2 PROTECT_MAX = vec2(0.975, 0.93);

  void main() {
    vec4 color = texture2D(uTex, vUv);
    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    float alpha = smoothstep(LUMA_EDGE_0, LUMA_EDGE_1, luma);
    bool inProtect =
      vUv.x > PROTECT_MIN.x && vUv.x < PROTECT_MAX.x &&
      vUv.y > PROTECT_MIN.y && vUv.y < PROTECT_MAX.y;
    if (inProtect) alpha = 1.0;
    gl_FragColor = vec4(color.rgb * alpha, alpha);
  }
`;

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("[keyed-scrub-video] 着色器编译失败:", gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  };
  const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) {
    if (gl.isContextLost()) {
      console.warn("[keyed-scrub-video] WebGL 上下文已丢失");
    }
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("[keyed-scrub-video] 程序链接失败:", gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

export const KeyedScrubVideo = forwardRef<
  KeyedScrubVideoHandle,
  KeyedScrubVideoProps
>(function KeyedScrubVideo({ src, className, onFirstFrame, onError }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const drawRef = useRef<(() => void) | null>(null);

  useImperativeHandle(ref, () => ({
    seekTo(progress) {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }
      // 收尾帧留一点余量，避免 currentTime == duration 时部分浏览器回跳
      const clamped = Math.min(Math.max(progress, 0), 0.999);
      video.currentTime = clamped * video.duration;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      console.warn("[keyed-scrub-video] WebGL 上下文创建失败");
      onError?.();
      return;
    }

    const program = createProgram(gl);
    if (!program) {
      onError?.();
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    video.src = src;
    videoRef.current = video;

    let firstFrameDone = false;

    const draw = () => {
      if (video.readyState < 2) return;
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        video,
      );
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!firstFrameDone) {
        firstFrameDone = true;
        onFirstFrame?.();
      }
    };
    drawRef.current = draw;

    const onSeeked = () => draw();
    const onLoadedData = () => draw();
    const onVideoError = () => {
      console.warn("[keyed-scrub-video] 视频加载失败:", video.error?.message);
      onError?.();
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("error", onVideoError);
    video.load();

    return () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("error", onVideoError);
      video.removeAttribute("src");
      video.load();
      videoRef.current = null;
      drawRef.current = null;
      // 只释放资源、不销毁上下文：StrictMode 重挂载会复用同一 canvas 的上下文，
      // loseContext 会让第二次挂载拿到已丢失的上下文而静默失败
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
    };
    // 效果只随视频源重建；回调通过闭包引用最新值即可
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
});

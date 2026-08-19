/**
 * 水波聚光渲染器（原生 WebGL，无三方依赖）：
 * 在画布上以聚光圈显示一张贴图，鼠标移动时沿轨迹散出一圈圈
 * 扩散并衰减的水波涟漪，圈内内容与光圈边缘都被涟漪折射扭曲，
 * 复刻 immersive-g.com 的水面 hover 质感。
 */

/** 同时存活的最大涟漪数（与片元着色器中的常量一致） */
const MAX_RIPPLES = 24;
/** 沿鼠标轨迹每隔多少 px 散出一个涟漪 */
const EMIT_SPACING_PX = 26;
/** 指针/光圈的阻尼系数（每秒） */
const POINTER_DAMPING = 10;
const RADIUS_DAMPING = 7;
/** 设备像素比上限，控制 GPU 负载 */
const MAX_DPR = 1.5;

const VERTEX_SRC = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uRadius;
uniform float uTime;
uniform vec4 uRipples[${MAX_RIPPLES}];

varying vec2 vUv;

void main() {
  // 屏幕像素坐标（y 向下，与指针一致）
  vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uRes;

  // 叠加所有存活涟漪：高斯环带沿径向扩散，随时间与距离衰减
  vec2 disp = vec2(0.0);
  float crest = 0.0;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 r = uRipples[i];
    float age = uTime - r.z;
    if (age < 0.0 || age > 2.4 || r.w <= 0.0) continue;
    vec2 d = px - r.xy;
    float dist = length(d) + 1e-4;
    float band = dist - age * 240.0;
    float ring = exp(-band * band / (2.0 * 34.0 * 34.0));
    float atten = exp(-age * 2.1) * exp(-dist * 0.0016);
    float h = ring * atten * r.w;
    disp += (d / dist) * h * 18.0;
    crest += h;
  }

  // 采样贴图：位移换算回 uv（纹理 y 已翻转，位移 y 取反）
  vec2 duv = vec2(disp.x, -disp.y) / uRes;
  vec4 col = texture2D(uTex, vUv + duv);

  // 聚光蒙版：边缘同样被涟漪推挤，轮廓呈水波形
  float dm = distance(px + disp * 2.2, uMouse);
  float alpha = 1.0 - smoothstep(uRadius * 0.7, uRadius, dm);

  // 波峰高光：微弱提亮，强化水面质感
  col.rgb += crest * 0.05;

  gl_FragColor = vec4(col.rgb, col.a * alpha);
}
`;

export type WaterSpotlight = {
  /** 指针移动（CSS px，相对画布左上角）；speed 为 px/ms，驱动涟漪强度 */
  movePointer(x: number, y: number, speed: number): void;
  /** 光圈目标半径（px），置 0 收拢隐藏 */
  setRadiusTarget(r: number): void;
  dispose(): void;
};

function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function createWaterSpotlight(
  canvas: HTMLCanvasElement,
  imageUrl: string,
): WaterSpotlight | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SRC);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // 全屏四边形
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTex = gl.getUniformLocation(program, "uTex");
  const uRes = gl.getUniformLocation(program, "uRes");
  const uMouse = gl.getUniformLocation(program, "uMouse");
  const uRadius = gl.getUniformLocation(program, "uRadius");
  const uTime = gl.getUniformLocation(program, "uTime");
  const uRipples = gl.getUniformLocation(program, "uRipples");

  // 贴图异步加载，就绪前不绘制
  let textureReady = false;
  const texture = gl.createTexture();
  const image = new window.Image();
  image.onload = () => {
    if (disposed) return;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    textureReady = true;
  };
  image.src = imageUrl;

  // 状态：指针与光圈带阻尼逼近，涟漪用环形缓冲
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, started: false };
  const spot = { r: 0, target: 0 };
  const ripples = new Float32Array(MAX_RIPPLES * 4);
  let rippleIndex = 0;
  let lastEmitX = 0;
  let lastEmitY = 0;
  const timeOrigin = performance.now();
  const now = () => (performance.now() - timeOrigin) / 1000;

  let width = 1;
  let height = 1;
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  let disposed = false;
  let rafId = 0;
  let lastFrame = performance.now();

  const frame = (frameTime: number) => {
    if (disposed) return;
    rafId = requestAnimationFrame(frame);
    const dt = Math.min((frameTime - lastFrame) / 1000, 0.05);
    lastFrame = frameTime;

    const pointerBlend = 1 - Math.exp(-POINTER_DAMPING * dt);
    pointer.x += (pointer.tx - pointer.x) * pointerBlend;
    pointer.y += (pointer.ty - pointer.y) * pointerBlend;
    spot.r += (spot.target - spot.r) * (1 - Math.exp(-RADIUS_DAMPING * dt));

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!textureReady || spot.r < 0.5) return;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uTex, 0);
    gl.uniform2f(uRes, width, height);
    gl.uniform2f(uMouse, pointer.x, pointer.y);
    gl.uniform1f(uRadius, spot.r);
    gl.uniform1f(uTime, now());
    gl.uniform4fv(uRipples, ripples);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  rafId = requestAnimationFrame(frame);

  return {
    movePointer(x, y, speed) {
      pointer.tx = x;
      pointer.ty = y;
      if (!pointer.started) {
        pointer.started = true;
        pointer.x = x;
        pointer.y = y;
        lastEmitX = x;
        lastEmitY = y;
        return;
      }
      // 沿轨迹按间距散出涟漪，强度随手速增强
      const dx = x - lastEmitX;
      const dy = y - lastEmitY;
      if (dx * dx + dy * dy < EMIT_SPACING_PX * EMIT_SPACING_PX) return;
      lastEmitX = x;
      lastEmitY = y;
      const strength = Math.min(0.35 + speed * 0.55, 1.5);
      const base = rippleIndex * 4;
      ripples[base] = x;
      ripples[base + 1] = y;
      ripples[base + 2] = now();
      ripples[base + 3] = strength;
      rippleIndex = (rippleIndex + 1) % MAX_RIPPLES;
    },
    setRadiusTarget(r) {
      spot.target = r;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}

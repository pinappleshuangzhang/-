/**
 * 流体光标揭示渲染器（原生 WebGL2，无三方依赖）：
 * 复刻 immersive-g.com 的光标质感——用一套简化的流体模拟
 * （速度场 + 密度场，鼠标注入、逐帧平流与耗散）生成 flowmap，
 * 密度场直接作为贴图的揭示蒙版：光标划过时留下液体般荡开、
 * 拖尾、缓慢消散的显影区域，而非几何圆形光圈。
 */

/** 流体模拟纹理宽度（高度按画布纵横比换算），低分辨率足够且省 GPU */
const SIM_WIDTH = 224;
/** 每帧（按 60fps 归一）耗散系数：速度消散快、密度残留久，取自参考站配置 */
const VELOCITY_DISSIPATION = 0.9;
const DENSITY_DISSIPATION = 0.955;
/** 指针阻尼（每秒），注入点平滑跟随 */
const POINTER_DAMPING = 9;
/** 整体强度淡入淡出阻尼（每秒），进出屏幕时用 */
const INTENSITY_DAMPING = 6;
/** 设备像素比上限 */
const MAX_DPR = 1.5;

const VERTEX_SRC = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/** 注入：在指针处以高斯斑点叠加速度（rg）与密度（b） */
const SPLAT_SRC = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uPoint;
uniform vec2 uVel;
uniform float uDensity;
uniform float uSplatRadius;
uniform float uAspect;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec2 d = vUv - uPoint;
  d.x *= uAspect;
  float g = exp(-dot(d, d) / (uSplatRadius * uSplatRadius));
  vec4 field = texture(uField, vUv);
  outColor = field + vec4(uVel * g, uDensity * g, 0.0);
}
`;

/** 平流 + 耗散：场沿自身速度回溯采样，速度与密度分别衰减 */
const ADVECT_SRC = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform float uDt;
uniform vec2 uDissipation;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec2 vel = texture(uField, vUv).rg;
  vec4 field = texture(uField, vUv - vel * uDt);
  field.rg *= uDissipation.x;
  field.b *= uDissipation.y;
  outColor = field;
}
`;

/** 显示：密度场作揭示蒙版，速度场对贴图做轻微液体折射 */
const DISPLAY_SRC = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform sampler2D uTex;
uniform float uIntensity;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec4 field = texture(uField, vUv);
  vec2 refr = field.rg * 0.025;
  vec4 col = texture(uTex, vUv + refr);
  // 密度越高越清晰显影，低密度处呈柔和液体边缘
  float alpha = smoothstep(0.04, 0.35, field.b) * uIntensity;
  // 流速处微弱提亮，强化液面反光质感
  col.rgb += length(field.rg) * 0.03;
  outColor = vec4(col.rgb, col.a * alpha);
}
`;

export type WaterSpotlight = {
  /** 指针移动（CSS px，相对画布左上角）；speed 为 px/ms，驱动注入强度 */
  movePointer(x: number, y: number, speed: number): void;
  /** 目标半径（px）：>0 显示（并决定液斑大小），0 淡出隐藏 */
  setRadiusTarget(r: number): void;
  dispose(): void;
};

function compile(
  gl: WebGL2RenderingContext,
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

function link(
  gl: WebGL2RenderingContext,
  vs: WebGLShader,
  fragSrc: string,
): WebGLProgram | null {
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  return program;
}

export function createWaterSpotlight(
  canvas: HTMLCanvasElement,
  imageUrl: string,
): WaterSpotlight | null {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;
  // 流体场需要半浮点渲染目标
  if (!gl.getExtension("EXT_color_buffer_float")) return null;
  const halfFloatLinear = gl.getExtension("OES_texture_half_float_linear");

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SRC);
  if (!vs) return null;
  const splatProgram = link(gl, vs, SPLAT_SRC);
  const advectProgram = link(gl, vs, ADVECT_SRC);
  const displayProgram = link(gl, vs, DISPLAY_SRC);
  if (!splatProgram || !advectProgram || !displayProgram) return null;

  // 全屏四边形
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  for (const program of [splatProgram, advectProgram, displayProgram]) {
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  }

  const splatU = {
    field: gl.getUniformLocation(splatProgram, "uField"),
    point: gl.getUniformLocation(splatProgram, "uPoint"),
    vel: gl.getUniformLocation(splatProgram, "uVel"),
    density: gl.getUniformLocation(splatProgram, "uDensity"),
    radius: gl.getUniformLocation(splatProgram, "uSplatRadius"),
    aspect: gl.getUniformLocation(splatProgram, "uAspect"),
  };
  const advectU = {
    field: gl.getUniformLocation(advectProgram, "uField"),
    dt: gl.getUniformLocation(advectProgram, "uDt"),
    dissipation: gl.getUniformLocation(advectProgram, "uDissipation"),
  };
  const displayU = {
    field: gl.getUniformLocation(displayProgram, "uField"),
    tex: gl.getUniformLocation(displayProgram, "uTex"),
    intensity: gl.getUniformLocation(displayProgram, "uIntensity"),
  };

  // 画布尺寸（CSS px）与流体场分辨率
  let width = 1;
  let height = 1;
  let simW = SIM_WIDTH;
  let simH = 126;

  const filter = halfFloatLinear ? gl.LINEAR : gl.NEAREST;
  const makeFieldTexture = () => {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA16F,
      simW,
      simH,
      0,
      gl.RGBA,
      gl.HALF_FLOAT,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  };

  // 双缓冲流体场
  let fieldA: WebGLTexture | null = null;
  let fieldB: WebGLTexture | null = null;
  const fbo = gl.createFramebuffer();

  const rebuildField = () => {
    if (fieldA) gl.deleteTexture(fieldA);
    if (fieldB) gl.deleteTexture(fieldB);
    simH = Math.max(16, Math.round(SIM_WIDTH * (height / width)));
    simW = SIM_WIDTH;
    fieldA = makeFieldTexture();
    fieldB = makeFieldTexture();
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    rebuildField();
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  // 贴图异步加载
  let textureReady = false;
  const imageTexture = gl.createTexture();
  const image = new window.Image();
  image.onload = () => {
    if (disposed) return;
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    textureReady = true;
  };
  image.src = imageUrl;

  // 指针状态（uv 空间，y 向上与纹理一致）；速度为 uv/s
  const pointer = {
    x: 0.5,
    y: 0.5,
    tx: 0.5,
    ty: 0.5,
    vx: 0,
    vy: 0,
    speed: 0,
    started: false,
  };
  const spot = { intensity: 0, target: 0, radiusPx: 160 };

  let disposed = false;
  let rafId = 0;
  let lastFrame = performance.now();

  const runPass = (
    program: WebGLProgram,
    target: WebGLTexture | null,
    setup: () => void,
  ) => {
    gl.useProgram(program);
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        target,
        0,
      );
      gl.viewport(0, 0, simW, simH);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    setup();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const frame = (frameTime: number) => {
    if (disposed) return;
    rafId = requestAnimationFrame(frame);
    const dt = Math.min((frameTime - lastFrame) / 1000, 1 / 30);
    lastFrame = frameTime;
    if (dt <= 0) return;

    const pointerBlend = 1 - Math.exp(-POINTER_DAMPING * dt);
    pointer.x += (pointer.tx - pointer.x) * pointerBlend;
    pointer.y += (pointer.ty - pointer.y) * pointerBlend;
    spot.intensity +=
      (spot.target - spot.intensity) * (1 - Math.exp(-INTENSITY_DAMPING * dt));
    pointer.speed *= Math.exp(-4 * dt);
    pointer.vx *= Math.exp(-4 * dt);
    pointer.vy *= Math.exp(-4 * dt);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!textureReady || spot.intensity < 0.01) return;

    const aspect = width / height;
    const splatRadius = (spot.radiusPx / height) * 0.62;
    // 静止时持续小量注入维持液斑，移动时按手速大幅追加密度与速度
    const density = (4.0 + pointer.speed * 24.0) * dt * spot.target;
    const frames = dt * 60;
    const velDiss = Math.pow(VELOCITY_DISSIPATION, frames);
    const denDiss = Math.pow(DENSITY_DISSIPATION, frames);

    // 注入：A -> B
    runPass(splatProgram, fieldB, () => {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fieldA);
      gl.uniform1i(splatU.field, 0);
      gl.uniform2f(splatU.point, pointer.x, pointer.y);
      gl.uniform2f(splatU.vel, pointer.vx, pointer.vy);
      gl.uniform1f(splatU.density, density);
      gl.uniform1f(splatU.radius, splatRadius);
      gl.uniform1f(splatU.aspect, aspect);
    });
    // 平流耗散：B -> A
    runPass(advectProgram, fieldA, () => {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fieldB);
      gl.uniform1i(advectU.field, 0);
      gl.uniform1f(advectU.dt, dt);
      gl.uniform2f(advectU.dissipation, velDiss, denDiss);
    });
    // 上屏
    runPass(displayProgram, null, () => {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fieldA);
      gl.uniform1i(displayU.field, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.uniform1i(displayU.tex, 1);
      gl.uniform1f(displayU.intensity, spot.intensity);
    });
  };
  rafId = requestAnimationFrame(frame);

  return {
    movePointer(x, y, speed) {
      const u = x / width;
      const v = 1 - y / height;
      if (!pointer.started) {
        pointer.started = true;
        pointer.x = u;
        pointer.y = v;
      } else {
        // 注入速度取指针位移方向，量级随手速（px/ms → uv/s 量级换算）
        pointer.vx = (u - pointer.tx) * 40;
        pointer.vy = (v - pointer.ty) * 40;
        pointer.speed = Math.min(speed, 3);
      }
      pointer.tx = u;
      pointer.ty = v;
    },
    setRadiusTarget(r) {
      spot.target = r > 0 ? 1 : 0;
      if (r > 0) spot.radiusPx = r;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      gl.deleteTexture(imageTexture);
      if (fieldA) gl.deleteTexture(fieldA);
      if (fieldB) gl.deleteTexture(fieldB);
      gl.deleteFramebuffer(fbo);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(splatProgram);
      gl.deleteProgram(advectProgram);
      gl.deleteProgram(displayProgram);
      gl.deleteShader(vs);
    },
  };
}

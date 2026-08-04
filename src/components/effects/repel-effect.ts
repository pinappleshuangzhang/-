import { Effect } from "postprocessing";
import { Uniform, Vector2 } from "three";

/**
 * 鼠标排斥后期效果：以指针为圆心，把半径内的像素向外推开。
 * radius / force 与 FX Lab 的 RepelEffect 参数语义一致（uv 空间 0~1）。
 */
const fragmentShader = /* glsl */ `
  uniform vec2 uMouse;
  uniform float uRadius;
  uniform float uForce;
  uniform float uAspect;

  void mainUv(inout vec2 uv) {
    vec2 delta = uv - uMouse;
    delta.x *= uAspect;
    float dist = length(delta);
    float strength = uForce * smoothstep(uRadius, 0.0, dist);
    if (dist > 0.0001) {
      vec2 dir = delta / dist;
      dir.x /= uAspect;
      uv -= dir * strength;
    }
  }
`;

export type RepelEffectOptions = {
  radius?: number;
  force?: number;
};

export class RepelEffect extends Effect {
  constructor({ radius = 0.1, force = 0.2 }: RepelEffectOptions = {}) {
    super("RepelEffect", fragmentShader, {
      uniforms: new Map<string, Uniform>([
        // 初始放在画面外，避免首帧出现凹陷
        ["uMouse", new Uniform(new Vector2(-10, -10))],
        ["uRadius", new Uniform(radius)],
        ["uForce", new Uniform(force)],
        ["uAspect", new Uniform(1)],
      ]),
    });
  }

  get mouseUniform(): Vector2 {
    return this.uniforms.get("uMouse")!.value as Vector2;
  }

  setAspect(aspect: number) {
    this.uniforms.get("uAspect")!.value = aspect;
  }
}

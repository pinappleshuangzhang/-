"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import gsap from "gsap";
import { ViscoseMobileStage } from "@/components/ui/viscose-mobile-stage";

import { FlipHoverButton } from "@/components/ui/flip-hover-button";
import {
  vertexShader,
  fragmentShader,
  MAX_PLANES,
  MAX_LINKS,
} from "./shaders/planeShaders";
import { buildAtlas } from "./ring/atlas";
import { createMeta } from "./ring/meta";
import { createSplitText } from "./ring/splitText";
import { defaultParams } from "./ring/params";
import { IMAGE_FILES, PROJECTS } from "./ring/projects";
import {
  TAU,
  HALF_PI,
  DEG,
  chase,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  signedOffset,
  smoothstep,
} from "./ring/utils";

// The fan starts fractionally into the spread so the seed reads first.
const FAN_START = 0.06;

/** Figma 最终卡片投影盒（1440 基准 px） */
const FINAL_SHADOW_BOX = { left: 371, top: 136, width: 385, height: 306 };
/** 高斯模糊约 3σ 才收干净；Safari 把 filter 裁在盒边上，必须预留这段溢出 */
const FINAL_SHADOW_BLEED = 102;

function su(value) {
  return `calc(var(--viscose-su) * ${value})`;
}

/**
 * 第三阶段卡片投影块。Safari 会把 `filter: blur` 裁在被滤镜元素的边框内，
 * 所以滤镜加在更大的透明外壳上，实色块仍保持设计稿尺寸。
 */
function FinalCardShadowBlob({ left, right, top, width, height, blur }) {
  const pad = blur * 3;
  return (
    <span
      className="absolute"
      style={{
        ...(left != null ? { left: su(left - pad) } : { right: su(right - pad) }),
        top: su(top - pad),
        width: su(width + pad * 2),
        height: su(height + pad * 2),
        filter: `blur(${su(blur)})`,
      }}
    >
      <span
        className="absolute bg-grey-400 opacity-10"
        style={{
          left: su(pad),
          top: su(pad),
          width: su(width),
          height: su(height),
        }}
      />
    </span>
  );
}

/** 入场种子所穿的贴图格，也是移动端第三阶段最初展示的分类 */
const INITIAL_CELL = Math.round(defaultParams().imageOffset);

const blankTexture = () => {
  const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  t.needsUpdate = true;
  return t;
};

export default function Carousel({
  onSelect,
  scrollHandlerRef,
  cursorLabel,
  categoryLabels,
  categoryFontClass,
  nameFont,
  mobileHeading,
  mobileViewDetails,
  mobileWorks,
  paused = false,
}) {
  const pausedRef = useRef(paused);
  const kickLoopRef = useRef(() => {});
  useEffect(() => {
    pausedRef.current = paused;
    if (!paused) kickLoopRef.current();
  }, [paused]);
  const containerRef = useRef(null);
  const mobileStageRef = useRef(null);
  // Which cell the single phone card is wearing; drives the chips and copy.
  // Updated only when the front cell changes, never per frame.
  const [mobileShown, setMobileShown] = useState(INITIAL_CELL);
  const stageBackgroundRef = useRef(null);
  const stageLayer2Ref = useRef(null);
  const stageLayer3Ref = useRef(null);
  const stageLayer4Ref = useRef(null);
  const finalShadowRef = useRef(null);
  const finalShadowPinRef = useRef(null);
  const hoverCloseRef = useRef(null);
  const listRef = useRef(null);
  const itemsRef = useRef([]);
  const categorySelectRef = useRef(null);
  const loaderRef = useRef(null);
  const liveRef = useRef(null);
  const cutRef = useRef(null);
  const brandStageRef = useRef(null);
  const brandBackgroundRef = useRef(null);
  const brandTextRef = useRef(null);
  // Per side: the box that positions the lockup, the filtered wrapper the goo
  // happens inside, the two rows that melt within it, and one more row outside
  // for words carrying over unchanged. See ring/meta.js.
  const metaRef = useRef({
    left: { box: null, goo: null, layers: [], plain: null },
    right: { box: null, goo: null, layers: [], plain: null },
  });

  useEffect(() => {
    const container = containerRef.current;
    const listEl = listRef.current;
    const categoryItems = itemsRef.current.filter(Boolean);
    const categoryWords = categoryItems.flatMap((item) =>
      Array.from(item.querySelectorAll("[data-category-entry-word]")),
    );
    const loaderEl = loaderRef.current;
    const stageBackground = stageBackgroundRef.current;
    const stageLayer2 = stageLayer2Ref.current;
    const immediateBackgroundLayers = [
      stageLayer3Ref.current,
      stageLayer4Ref.current,
    ].filter(Boolean);
    const rotatingBackgroundLayers = [
      stageLayer2,
      ...immediateBackgroundLayers,
    ].filter(Boolean);
    const finalShadow = finalShadowRef.current;
    const finalShadowPin = finalShadowPinRef.current;
    const hoverClose = hoverCloseRef.current;
    const brandStage = brandStageRef.current;
    const brandBackground = brandBackgroundRef.current;
    const brandText = brandTextRef.current;
    const mobileStage = mobileStageRef.current;
    // Async atlas decoding can land after cleanup under StrictMode's double
    // mount. Everything deferred checks this flag.
    let disposed = false;
    let loopOn = false;
    let ensureLoop = () => {};

    const params = defaultParams();
    params.nameFont = nameFont;
    // progress: the seed is born at screen centre
    // launch:   the seed travels out to its place on the ring
    // spread:   the rest peel off it and the ring draws
    // spin:     whole-ring rotation, radians
    // shift:    the ring moves off centre and resizes
    const state = { progress: 0, launch: 0, spread: 0, spin: 0, shift: 0 };
    let stagePhase = "entry";
    let ringAutoRotating = false;
    let backgroundSpin = 0;
    let layer2Spin = 0;
    let ringAutoRotateElapsed = 0;
    // Read-only panel readouts, so an invalid ring is visible rather than
    // silent and the reference window can be matched to the live one.
    const info = { restingGap: 0, window: "", scale: 1, band: "wide" };

    // Browsers cap the number of live WebGL contexts (~16 in Chrome). If that
    // is hit, this throws and the rest of the effect never runs — no canvas is
    // appended and the page is simply blank, which is a miserable thing to
    // debug. Fail loudly instead. See the cleanup for why it should not
    // happen: the context is released explicitly rather than left to GC.
    // Safari's Metal-backed WebGL chokes on this full-screen SDF fragment
    // shader (per-pixel loops over 32 planes + 32 links). Drop MSAA there —
    // the shader does its own edge softening — and halve the pixel ratio,
    // which cuts fragment work to roughly a quarter.
    const isSafari =
      /safari/i.test(navigator.userAgent) &&
      !/chrome|chromium|crios|edg|android/i.test(navigator.userAgent);
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSafari,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (err) {
      console.error("[ring] could not create a WebGL context:", err);
      return;
    }
    // Safari (Metal WebGL) is slower on this shader, so cap the DPR lower
    // than other browsers — but not below 1.5: further down the atlas art
    // reads as out of focus on Retina panels. Antialias stays off there,
    // the SDF does its own edge softening.
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, isSafari ? 1.5 : 2),
    );
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);

    const uniforms = {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uSize: { value: new THREE.Vector2(120, 75) },
      uRadius: { value: params.radius },
      uCount: { value: params.count },
      uPos: {
        value: Array.from({ length: MAX_PLANES }, () => new THREE.Vector2()),
      },
      uRot: { value: new Float32Array(MAX_PLANES) },
      // xy = birth scale, z = brightness, w = atlas cell. Packed because a
      // uniform array costs a full vec4 row per element either way.
      uScale: {
        value: Array.from(
          { length: MAX_PLANES },
          () => new THREE.Vector4(0, 0, 1, 0),
        ),
      },
      uLinkCount: { value: 0 },
      uLinkA: {
        value: Array.from({ length: MAX_LINKS }, () => new THREE.Vector2()),
      },
      uLinkB: {
        value: Array.from({ length: MAX_LINKS }, () => new THREE.Vector2()),
      },
      // (rEnd, rMid, sag, fillet), packed to stay inside the uniform budget.
      uLinkPar: {
        value: Array.from({ length: MAX_LINKS }, () => new THREE.Vector4()),
      },
      uK: { value: params.goo },
      uWobble: { value: params.wobble },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#131313") },
      uAtlas: { value: blankTexture() }, // placeholder so the sampler is bound
      uGrid: { value: new THREE.Vector2(1, 1) },
      uBlend: { value: params.blend },
      uTextured: { value: 0 },
      uBandTop: { value: 0 },
      uBandBottom: { value: 0 },
      uGlass: { value: new THREE.Vector4() },
      uFringe: { value: 0 },
      uSheen: { value: 0 },
      uMouse: { value: new THREE.Vector4() },
      uMelt: { value: new THREE.Vector4() },
      uHoverPlane: { value: -1 },
      uHoverColor: { value: 0 },
      uTagTex: {
        value: new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1),
      },
      uTag: { value: new THREE.Vector4() },
      uTagP: { value: new THREE.Vector4() },
      uTagQ: { value: new THREE.Vector4() },
      uPage: { value: new THREE.Color("#f4f4f4") },
    };

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
      }),
    );
    // Above the type, so the planes occlude it as the ring sweeps past.
    mesh.renderOrder = 10;
    scene.add(mesh);

    const textGroup = new THREE.Group();
    scene.add(textGroup);

    const splitText = createSplitText(textGroup, params);
    const meta = createMeta(
      {
        groups: metaRef.current,
        list: listEl,
        loader: loaderEl,
        cut: cutRef.current,
        live: liveRef.current,
      },
      params,
    );

    /* ---------------------------------------------------------------- art */
    // The atlas is bound on frame one and fills in as images arrive, so the
    // seed can be born already wearing its own art while the rest are still
    // in flight. It is also what gives the counter something to count.
    let firstIn = false; // the seed's own cell is on the texture
    let loadProg = 0; // and how much of the rest has arrived, 0..1

    // Opened on the frame the counter reads 100, and by nothing else — that is
    // what makes the number landing and the ring launching the same moment.
    let launchReady = false;
    const readyWaiters = [];
    const whenReady = (fn) => (launchReady ? fn() : readyWaiters.push(fn));

    const atlas = buildAtlas(IMAGE_FILES, (p) => {
      if (!disposed) loadProg = p;
    });

    uniforms.uAtlas.value.dispose();
    if (isSafari) {
      // Safari can sample stale black levels while an asynchronously painted
      // CanvasTexture regenerates mipmaps. Linear level-0 sampling is stable
      // and also removes the mip-generation spike during the entry.
      atlas.texture.generateMipmaps = false;
      atlas.texture.minFilter = THREE.LinearFilter;
      atlas.texture.anisotropy = 1;
    } else {
      atlas.texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    }
    uniforms.uAtlas.value = atlas.texture;
    uniforms.uGrid.value.set(atlas.grid[0], atlas.grid[1]);
    // Up front, not on completion: the cell each plane wears is derived from
    // this and has to be right from the first frame, blank cells or not.
    const imageCount = atlas.count;

    atlas.ready.then(() => {
      if (!disposed) {
        firstIn = true;
        loadProg = 1;
      }
    });

    /* --------------------------------------------------------------- size */
    let viewW = 1;
    let viewH = 1;
    // Cached: the pointer is tracked on every move, and reading the rect each
    // time is a forced layout. Only a resize can invalidate it.
    const bounds = { left: 0, top: 0 };

    // How far this window is from the reference one. Every px param is
    // multiplied through by it, so it is computed on resize and never in the
    // loop. planeK / radiusK / textK are the breakpoint bumps on top.
    let fit = 1;
    let planeK = 1;
    let radiusK = 1;
    let textK = 1;
    // Entry-only (shift = 0) multipliers. On phones the seed and its launch
    // radius are drawn at the 390-wide artboard and scale with width; these
    // fold that back onto the desktop figures so layout() stays one formula.
    let entryPlaneK = 1;
    let entryRadiusK = 1;
    // Kept as flags rather than resolved into values here, so anything picked
    // off them still answers to the dev panel between resizes.
    let narrowNow = false;
    let tightNow = false;
    // Phones get a different third act altogether: one card grows in place,
    // no ring, no spin, no backdrop. Sized off the 390 artboard by width.
    let mobileNow = false;
    let mobileFit = 1;

    const refit = () => {
      const byW = viewW / Math.max(1, params.refWidth);
      const byH = viewH / Math.max(1, params.refHeight);
      const s =
        byW * (1 - params.fitHeight) + Math.max(byW, byH) * params.fitHeight;
      fit = Math.min(params.maxScale, Math.max(params.minScale, s));

      const mobile = viewW <= params.mobileAt;
      mobileNow = mobile;
      mobileFit = viewW / Math.max(1, params.mobileRefWidth);
      entryPlaneK = mobile
        ? (params.mobileEntryPlaneSize * mobileFit)
          / (params.entryPlaneSize * fit)
        : 1;
      entryRadiusK = mobile
        ? (params.mobileEntryRingRadius * mobileFit)
          / (params.entryRingRadius * fit)
        : 1;

      const narrow = viewW <= params.narrowAt;
      const tight = viewW <= params.tightAt;
      narrowNow = narrow;
      tightNow = tight;
      planeK = narrow ? params.narrowPlane : 1;
      // The bands stack: tight sits inside narrow and pulls the arc back in
      // from where narrow had pushed it out to.
      radiusK =
        (narrow ? params.narrowRadius : 1) * (tight ? params.tightRadius : 1);
      textK = narrow ? params.narrowText : 1;

      info.window = `${Math.round(viewW)} x ${Math.round(viewH)}`;
      info.scale = Math.round(fit * 1000) / 1000;
      info.band = tight ? "tight" : narrow ? "narrow" : "wide";

      // The heading is rasterised per glyph, so it cannot be re-sized without
      // rebuilding every texture mid-animation. Scaling the group costs
      // nothing and stays sharp — the glyphs are drawn at 2x display already.
      const k = fit * textK * (tight ? params.tightSplit : 1);
      textGroup.scale.set(k, k, 1);
    };

    const styleMeta = () =>
      meta.style({ textK, tight: tightNow, viewW: viewW });

    const resize = () => {
      viewW = container.clientWidth;
      viewH = container.clientHeight;
      refit();
      renderer.setSize(viewW, viewH);
      camera.left = -viewW / 2;
      camera.right = viewW / 2;
      camera.top = viewH / 2;
      camera.bottom = -viewH / 2;
      camera.updateProjectionMatrix();
      mesh.scale.set(viewW, viewH, 1);
      uniforms.uResolution.value.set(viewW, viewH);

      const rect = renderer.domElement.getBoundingClientRect();
      bounds.left = rect.left;
      bounds.top = rect.top;
    };

    // styleMeta too, because the breakpoint bumps are steps that vw units
    // cannot express on their own.
    const onResize = () => {
      ensureLoop();
      resize();
      styleMeta();
    };

    resize();
    window.addEventListener("resize", onResize);

    /* ------------------------------------------------------- spin & input */
    const ringCentre = { x: 0, y: 0 };
    // Which way "front" is: from the ring's centre toward the middle of the
    // screen. Once the ring is off centre that is no longer 3 o'clock.
    let frontAngle = 0;
    let interactive = false;
    let spinVel = 0; // rad/s
    let dragging = false;
    let canvasCursor = "default";
    let dragPrevAngle = 0;
    let dragPrevTime = 0;

    // The snap is a phase, not a force that is always on: a flick coasts
    // untouched, and once it is nearly spent the ring commits to a slot and
    // runs itself in. snapTo is that slot, snapCap the speed it came in at.
    let settling = false;
    let snapTo = 0;
    let snapCap = 0;

    // A click is turning the ring to a card. While this is up the momentum
    // above is suspended entirely, so the two cannot both drive spin.
    let picking = false;

    let pointerTravel = 0; // tells a click from a drag
    let travelX = 0;
    let travelY = 0;

    const pointerAngle = (e) => {
      const dx = e.clientX - bounds.left - ringCentre.x;
      const dy = e.clientY - bounds.top - ringCentre.y;
      return Math.atan2(-dy, dx);
    };

    const stopPick = () => {
      if (!picking) return;
      gsap.killTweensOf(state);
      picking = false;
    };

    // Turn the ring until plane i faces front. A tween rather than a target
    // handed to the snap: the snap is a run-in for a throw that is nearly
    // spent and is shaped so it can only slow down, but a pick starts from a
    // standstill and has to accelerate.
    const pick = (i, openWhenCurrent = true) => {
      ensureLoop();
      const slot = TAU / Math.round(params.count);
      // Spread, plane i sits at seed + signedOffset(i) * slot + spin.
      const base = frontAngle - params.seed * DEG - signedOffset(i) * slot;
      // Nearest equivalent winding, so it takes the short way round rather
      // than unwinding whole turns. Every card is within half a ring.
      const target = base + Math.round((state.spin - base) / TAU) * TAU;

      const slots = Math.abs(target - state.spin) / slot;
      if (slots < 0.01) {
        if (openWhenCurrent) onSelect?.(shown);
        return;
      }

      spinVel = 0;
      settling = false;
      picking = true;
      gsap.killTweensOf(state);
      gsap.to(state, {
        spin: target,
        // Root of the distance, not linear: a card eight slots round should
        // take longer than its neighbour but not eight times longer.
        duration: params.pickTime * Math.sqrt(Math.max(1, slots)),
        ease: params.pickEase,
        onComplete: () => {
          picking = false;
          if (openWhenCurrent) onSelect?.(i);
        },
      });
    };

    // Phone category switch: there is only one card, so the ring cannot turn
    // to the picture — the seed dips, changes its cell, and settles back.
    const mobileSwap = { t: 1 };
    const swapSeedCell = (cell) => {
      if (cell === Math.round(params.imageOffset)) return;
      ensureLoop();
      gsap.killTweensOf(mobileSwap);
      gsap.to(mobileSwap, {
        t: 0,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          params.imageOffset = cell;
          gsap.to(mobileSwap, { t: 1, duration: 0.4, ease: "power2.out" });
        },
      });
    };

    const pickCategory = (cell) => {
      if (!interactive || imageCount <= 0) return;
      if (mobileNow) {
        swapSeedCell(cell);
        return;
      }

      const count = Math.round(params.count);
      const slot = TAU / count;
      const imageOffset = Math.round(params.imageOffset);
      let nearestPlane = -1;
      let nearestDistance = Number.POSITIVE_INFINITY;

      for (let i = 0; i < count; i++) {
        const signedIndex = signedOffset(i);
        const planeCell =
          ((imageOffset - signedIndex) % imageCount + imageCount) % imageCount;
        if (planeCell !== cell) continue;

        const base =
          frontAngle - params.seed * DEG - signedIndex * slot;
        const target =
          base + Math.round((state.spin - base) / TAU) * TAU;
        const distance = Math.abs(target - state.spin);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestPlane = i;
        }
      }

      if (nearestPlane >= 0) pick(nearestPlane, false);
    };
    categorySelectRef.current = pickCategory;

    /* ------------------------------------------------------------ pointer */
    // World px, origin at screen centre, Y up — the space the shader works in,
    // so nothing is converted twice.
    //
    // `inside` means the position is worth reading, which is what the card hit
    // test needs. Whether the softening is *on* is a separate question,
    // because on touch it is not simply "is there a pointer".
    const pointer = { x: 0, y: 0, inside: false, seeded: false };
    // What the ring actually follows: the cursor, smoothed. How far this
    // trails the real pointer stands in for speed and drives the wake.
    const cursor = { x: 0, y: 0, amt: 0, wake: 0 };
    const setCloseX = hoverClose
      ? gsap.quickSetter(hoverClose, "x", "px")
      : null;
    const setCloseY = hoverClose
      ? gsap.quickSetter(hoverClose, "y", "px")
      : null;
    if (hoverClose) {
      gsap.set(hoverClose, { x: -9999, y: -9999, autoAlpha: 0 });
    }

    // Read off the events rather than a media query, so a laptop with a
    // touchscreen behaves as whichever is being used at the time.
    let coarse = false;
    let held = false;
    let holdTimer = 0;

    const endHold = () => {
      clearTimeout(holdTimer);
      holdTimer = 0;
      held = false;
    };

    const beginHold = () => {
      clearTimeout(holdTimer);
      holdTimer = setTimeout(() => {
        held = true;
      }, params.touchHold * 1000);
    };

    // Mouse: being over it is the whole gesture. Touch: only a press held
    // still long enough to mean it.
    const engaged = () => (coarse ? held : pointer.inside);

    const trackPointer = (e) => {
      coarse = e.pointerType === "touch";
      pointer.x = e.clientX - bounds.left - viewW * 0.5;
      pointer.y = viewH * 0.5 - (e.clientY - bounds.top);
      pointer.inside = true;
      // Otherwise the first move sweeps the softening across the ring from
      // wherever the cursor was last left.
      if (!pointer.seeded) {
        pointer.seeded = true;
        cursor.x = pointer.x;
        cursor.y = pointer.y;
      }
    };

    const onPointerLeave = () => {
      pointer.inside = false;
      ensureLoop();
    };

    const applyWheelDelta = (deltaX, deltaY) => {
      // A single phone card has nothing to turn; spin would only tilt it.
      if (!interactive || mobileNow) return;
      ensureLoop();
      // Trackpads send horizontal deltas too; take whichever dominates.
      const d = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
      // Fresh input hands the ring back to its own momentum.
      stopPick();
      settling = false;
      spinVel += d * params.scrollSpeed;
      spinVel = Math.max(-params.maxSpeed, Math.min(params.maxSpeed, spinVel));
    };

    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        applyWheelDelta(0, e.key === "ArrowLeft" ? -120 : 120);
      } else if (e.key === "Enter" && shown >= 0) {
        e.preventDefault();
        onSelect?.(shown);
      }
    };

    const onPointerDown = (e) => {
      ensureLoop();
      pointerTravel = 0;
      travelX = e.clientX;
      travelY = e.clientY;
      trackPointer(e);
      if (!interactive) return;
      stopPick();
      if (coarse) beginHold();
      // Tracked (so a tap can still hit the card) but never dragged on phones.
      if (mobileNow) return;
      dragging = true;
      settling = false;
      spinVel = 0;
      dragPrevAngle = pointerAngle(e);
      dragPrevTime = performance.now();
      renderer.domElement.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      ensureLoop();
      trackPointer(e);

      // From coordinates, not movementX/Y: those are zero for touch in Safari,
      // which would make every swipe look stationary and end in a tap.
      pointerTravel +=
        Math.abs(e.clientX - travelX) + Math.abs(e.clientY - travelY);
      travelX = e.clientX;
      travelY = e.clientY;
      // Only before the hold takes. After that, moving drags the ring and the
      // melt together, same as a drag with the cursor down.
      if (coarse && !held && pointerTravel > params.touchSlop) endHold();

      if (!dragging) return;

      const a = pointerAngle(e);
      let delta = a - dragPrevAngle;
      // Short way round, so crossing the +/-pi seam does not snap.
      if (delta > Math.PI) delta -= TAU;
      if (delta < -Math.PI) delta += TAU;

      const turn = delta * params.dragSpeed;
      state.spin += turn;

      const now = performance.now();
      spinVel = turn / (Math.max(8, now - dragPrevTime) / 1000);
      dragPrevAngle = a;
      dragPrevTime = now;
    };

    const onPointerUp = (e) => {
      // Releasing the capture fires a leave at the container even though the
      // cursor never went anywhere, so re-track before anything else.
      trackPointer(e);
      // The finger is gone; a cursor is still there.
      endHold();
      if (!dragging) return;
      dragging = false;
      if (renderer.domElement.hasPointerCapture?.(e.pointerId)) {
        renderer.domElement.releasePointerCapture(e.pointerId);
      }
    };

    // Same box the frame loop tests, but against the raw pointer and right
    // now: a tap has no hover before it, so `over` is still last frame's.
    const hitPlane = () => {
      const count = Math.round(params.count);
      const W = uniforms.uSize.value.x;
      const H = uniforms.uSize.value.y;
      for (let i = 0; i < count; i++) {
        const sc = uniforms.uScale.value[i];
        if (sc.x <= 0.001 || sc.y <= 0.001) continue;
        const p = uniforms.uPos.value[i];
        const rot = uniforms.uRot.value[i];
        const qx = pointer.x - p.x;
        const qy = pointer.y - p.y;
        const cr = Math.cos(rot);
        const sr = Math.sin(rot);
        if (
          Math.abs(qx * cr + qy * sr) <= W * 0.5 * sc.x &&
          Math.abs(-qx * sr + qy * cr) <= H * 0.5 * sc.y
        ) {
          return i;
        }
      }
      return -1;
    };

    // A drag ends in a click too, so only a near-stationary press counts.
    // `over` comes from the same hit test that decides the tag, so a click
    // only ever lands on the card the tag was offering.
    const onClick = () => {
      if (!interactive || pointerTravel >= params.touchSlop) return;
      const target = over >= 0 ? over : hitPlane();
      if (target < 0) return;
      pick(target);
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("click", onClick);
    container.addEventListener("keydown", onKeyDown);

    const updatePointer = (dt) => {
      // Held off until the entry finishes, so the cursor cannot soften the
      // ring while the timeline is still drawing it.
      const live = params.hover && engaged() && pointer.seeded && interactive;
      cursor.amt += ((live ? 1 : 0) - cursor.amt) * chase(dt, 0.12);

      const k = chase(dt, params.lag);
      cursor.x += (pointer.x - cursor.x) * k;
      cursor.y += (pointer.y - cursor.y) * k;

      // The gap left behind the real pointer stands in for speed. Instant
      // attack, slow release, so the wake outlives the movement.
      const trail = Math.hypot(pointer.x - cursor.x, pointer.y - cursor.y);
      cursor.wake = Math.max(
        cursor.wake * Math.pow(0.94, dt * 60),
        clamp01(trail / (Math.max(dt, 0.001) * 2600)),
      );

      // Scaled by fit like the ring: a reach in raw px would cross two cards
      // on a small window and half of one on a large. Frequencies are not.
      uniforms.uMouse.value.set(
        cursor.x,
        cursor.y,
        cursor.amt,
        params.melt * fit,
      );
      uniforms.uMelt.value.set(
        params.meltReach * fit,
        params.wave * fit * cursor.wake * cursor.amt,
        params.waveFreq,
        params.waveSpeed,
      );
    };

    /* ------------------------------------------------------- load counter */
    // Reads whichever of the two is further behind: the art arriving, or the
    // seed's own birth. Both have to finish before there is anything to
    // launch, so counting bytes alone leaves the number sitting on 100 waiting
    // for a condition nobody told the viewer about.
    const loading = { shown: 0 };

    const tickLoader = (dt) => {
      const target = Math.min(loadProg, clamp01(state.progress));
      loading.shown += (target - loading.shown) * chase(dt, params.loaderChase);

      // Never 0%; that reads as nothing happening.
      const n = Math.min(100, Math.max(1, Math.round(loading.shown * 100)));
      if (loaderEl) loaderEl.textContent = `${n}%`;

      if (!launchReady && n >= 100) {
        launchReady = true;
        for (const fn of readyWaiters) fn();
        readyWaiters.length = 0;
      }
    };

    /* ------------------------------------------------------- the carousel */
    const travel = new Float32Array(MAX_PLANES);
    const cum = new Float32Array(MAX_PLANES);
    const order = [];
    // Where each plane would sit with no cursor near it. The honey is measured
    // off these, so hovering cannot feed back into the unfurl's geometry.
    const rest = Array.from({ length: MAX_PLANES }, () => new THREE.Vector2());

    // Per-plane response to the pointer, eased rather than recomputed from
    // where it is, so the ring trails the cursor and settles back on its own.
    const hoverF = new Float32Array(MAX_PLANES);
    const leanX = new Float32Array(MAX_PLANES);
    const leanY = new Float32Array(MAX_PLANES);
    const webF = new Float32Array(MAX_LINKS);
    // The other half of it: how much a plane is standing aside for the card
    // being pointed at. Zero on that card, zero when there isn't one.
    const sideF = new Float32Array(MAX_PLANES);
    // Where the hovered card is, latched at the end of a frame for the next
    // one. The hit test runs inside the loop and every plane needs an answer
    // before the loop reaches that card, so this is deliberately one frame
    // behind — it is eased over ten of them anyway. Not reset when the cursor
    // leaves: the direction has to stay meaningful while the push decays.
    const focusPos = new THREE.Vector2();

    const swellOf = (i) =>
      Math.max(
        0.05,
        1 + params.swell * hoverF[i] - params.sideScale * sideF[i],
      );

    // Which card is at the front, and which is under the cursor.
    let shown = -1;
    let announced = -1;
    let over = -1;
    let colorPlane = -1;
    let tagUp = false;

    const paintList = () => {
      const items = itemsRef.current;
      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        if (!el) continue;
        const on = i === shown;
        if (on) el.setAttribute("aria-current", "true");
        else el.removeAttribute("aria-current");
      }
      if (shown >= 0) setMobileShown(shown);
    };

    const layout = (dt) => {
      const count = Math.round(params.count);
      uniforms.uCount.value = count;

      const step = TAU / count;
      const spread = clamp01(state.spread);

      // Band values are picked per frame rather than latched on resize, so
      // dragging any of these sliders shows up straight away.
      const endScale = narrowNow ? params.narrowEndScale : params.endScale;
      const posX = tightNow
        ? params.tightPosX
        : narrowNow
          ? params.narrowPosX
          : params.posX;

      // The stage transform. Everything in plane-pixels goes through g, which
      // is why the window fit rides in here rather than on a dozen params.
      const shift = clamp01(state.shift);
      // On phones the stage never moves or rescales the field: the card's own
      // size carries the whole third act, so g stays at the plain window fit.
      const g = mobileNow ? fit : (1 + (endScale - 1) * shift) * fit;
      const stageCx = mobileNow ? 0 : posX * viewW * 0.5 * shift;
      const stageCy = mobileNow ? 0 : params.posY * viewH * 0.5 * shift;
      // Phone final card: 365.5 wide off the 390 artboard, top edge pinned at
      // 305 device px (Figma 947-3937). World Y is up.
      const mobileFinalW = params.mobileFinalPlaneSize * mobileFit;
      const mobileFinalCy =
        viewH * 0.5 - (params.mobileFinalCardTop + mobileFinalW / 1.6 / 2);
      const cx = mobileNow ? 0 : stageCx + params.ringOffsetX * fit * spread;
      const cy = mobileNow
        ? mobileFinalCy * shift
        : stageCy - params.ringOffsetY * fit * spread;

      // Screen-space centre, for pointer maths. World Y is up, page Y is down.
      ringCentre.x = viewW * 0.5 + cx;
      ringCentre.y = viewH * 0.5 - cy;
      // A plane faces front when the ring centre, that plane and the middle of
      // the screen line up. Before the stage move there is no front, so 3
      // o'clock stands in.
      frontAngle =
        stageCx !== 0 || stageCy !== 0
          ? Math.atan2(-stageCy, -stageCx)
          : 0;

      // Anything measured in plane long edges — hover reach, thread reach,
      // side falloff — comes off W, so the narrow bump reaches them for free.
      const entryPlane = params.entryPlaneSize * entryPlaneK;
      const basePlaneSize = entryPlane + (params.planeSize - entryPlane) * shift;
      const responsivePlaneK = 1 + (planeK - 1) * shift;
      const W = mobileNow
        ? entryPlane * fit + (mobileFinalW - entryPlane * fit) * shift
        : basePlaneSize * responsivePlaneK * g;
      const H = W / 1.6;
      uniforms.uSize.value.set(W, H);
      // Tracks the plane, not the window: a card 25% bigger with the same
      // corner is a differently shaped card, not a bigger one.
      uniforms.uRadius.value = params.radius * planeK * g;

      // Radial: the long edge points outward, so a plane's reach toward its
      // neighbour is its short axis and the facing edges are the long ones.
      const sepExtent = params.radial ? H : W;
      const faceEdge = params.radial ? W : H;

      const entryRadius = params.entryRingRadius * entryRadiusK;
      const baseRingRadius =
        entryRadius + (params.ringRadius - entryRadius) * shift;
      const responsiveRadiusK = 1 + (radiusK - 1) * shift;
      // Phone: the launch radius folds back to zero, so the seed rides from
      // its stage-2 perch on the right straight back to centre as it grows.
      const R = mobileNow
        ? entryRadius * fit * (1 - shift)
        : baseRingRadius * responsiveRadiusK * g;
      const restingGap = 2 * R * Math.sin(step / 2) - sepExtent;
      info.restingGap = Math.round((restingGap / g) * 10) / 10;
      // The whole stretch plays out across this, so it is the yardstick.
      const finalSep = Math.max(1, restingGap);

      // Every generation is in flight at once, offset by a small phase, so
      // this is one continuous unfurl and not a queue of separate pops.
      const maxN = Math.max(1, Math.abs(signedOffset(count - 1)));
      const dur = Math.max(0.1, 1 - FAN_START - params.stagger);

      // Cumulative, so an unborn plane sits exactly on top of its parent and
      // is peeled out of it one ring step at a time.
      cum[0] = 0;
      for (let n = 1; n <= maxN; n++) {
        const start = FAN_START + ((n - 1) / maxN) * params.stagger;
        const t = clamp01((spread - start) / dur);
        const e = t * t * (3 - 2 * t);
        travel[n] = e;
        cum[n] = cum[n - 1] + e;
      }

      const seedAngle = params.seed * DEG;
      // The seed is born flat at centre then rides out. Applied as the radius
      // rather than an offset on plane 0, so scrubbing the timeline stays
      // consistent — the unborn are stacked on the seed either way.
      const launch = easeInOutCubic(clamp01(state.launch));
      const Rnow = R * launch;

      order.length = 0;

      const track = cursor.amt > 0.001;
      const reach = Math.max(1, params.reach * W);
      const sideReach = Math.max(1, params.sideReach * W);
      // Asymmetric on purpose: the ring takes up a lean quickly and lets go
      // slowly. Equal rates read as a mechanism following the cursor; the gap
      // between them is what reads as something viscous.
      const kRise = chase(dt, params.grab);
      const kFall = chase(dt, params.release);

      // Nearest plane to front, in angle rather than screen distance: two
      // planes can sit equally far from the middle, but only one faces it.
      let frontI = -1;
      let frontD = 1e9;
      let frontCell = 0;

      // Art is dealt by ring slot, not plane index. Planes are numbered in fan
      // order, so dealing by index puts every other project side by side and
      // steps the column two names per slot. Negated because turning the ring
      // forward walks the front slot backwards.
      const imgOff = Math.round(params.imageOffset);
      const cellOf = (slot) =>
        imageCount > 0
          ? (((imgOff - slot) % imageCount) + imageCount) % imageCount
          : 0;

      // Which card the cursor is on. Independent of the hover falloff above:
      // turning the goo off should not take the tag with it.
      const probe = pointer.inside && pointer.seeded && interactive;
      let overI = -1;
      // Which card the rest are standing aside for, from last frame.
      const focusI = track ? over : -1;

      for (let i = 0; i < count; i++) {
        const sIdx = signedOffset(i);
        const n = Math.abs(sIdx);
        const u = i === 0 ? clamp01(state.progress) : travel[n];
        const cell = cellOf(sIdx);

        const angle = seedAngle + Math.sign(sIdx) * step * cum[n] + state.spin;
        const px = Math.cos(angle) * Rnow + cx;
        const py = Math.sin(angle) * Rnow + cy;
        rest[i].set(px, py);

        // atan2 of the difference wraps to +/-pi, so the seam costs nothing.
        const da = angle - frontAngle;
        const toFront = Math.abs(Math.atan2(Math.sin(da), Math.cos(da)));
        if (toFront < frontD) {
          frontD = toFront;
          frontI = i;
          frontCell = cell;
        }

        // Lean toward the cursor. Scaled by u so the unborn keep out of it:
        // they are stacked on their parent, and without this the whole stack
        // would lean at once and drag the seed off the ring.
        let f = 0;
        let toX = 0;
        let toY = 0;
        if (track) {
          const dx = cursor.x - px;
          const dy = cursor.y - py;
          const dist = Math.hypot(dx, dy);
          f = smoothstep(reach, reach * 0.22, dist) * cursor.amt * u;
          if (f > 0.0001 && dist > 0.0001) {
            const lean = (params.pull * fit * f) / dist;
            toX = dx * lean;
            toY = dy * lean;
          }
        }

        // One rate for the whole of a plane's response, so the swell, the lean
        // and the honey it feeds move together instead of drifting apart.
        const k = f > hoverF[i] ? kRise : kFall;
        hoverF[i] += (f - hoverF[i]) * k;
        leanX[i] += (toX - leanX[i]) * k;
        leanY[i] += (toY - leanY[i]) * k;

        // Standing aside. Measured from the hovered card, not the cursor, so
        // the response holds steady while the cursor moves around inside it.
        let sf = 0;
        if (focusI >= 0 && i !== focusI) {
          const d = Math.hypot(focusPos.x - px, focusPos.y - py);
          sf = smoothstep(sideReach, sideReach * 0.2, d) * u;
        }
        // Its own rate: a card can be letting go of a lean at the same moment
        // it is asked to back away, and sharing one would make the second
        // thing sluggish.
        sideF[i] += (sf - sideF[i]) * (sf > sideF[i] ? kRise : kFall);

        // Straight off the eased factor — sideF is already smooth, and easing
        // it twice would only add lag.
        let pushX = 0;
        let pushY = 0;
        if (sideF[i] > 0.0001) {
          const dx = px - focusPos.x;
          const dy = py - focusPos.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0.0001) {
            const away = (params.sidePush * fit * sideF[i]) / dist;
            pushX = dx * away;
            pushY = dy * away;
          }
        }

        uniforms.uPos.value[i].set(
          px + leanX[i] + pushX,
          py + leanY[i] + pushY,
        );
        uniforms.uRot.value[i] =
          (params.radial ? angle : angle + HALF_PI) * launch;

        // The seed grows over its whole birth. The others are already there,
        // merged inside their parent, so they reach full size early and spend
        // the rest of their travel pulling away.
        const sx =
          i === 0
            ? easeOutCubic(clamp01(u / 0.7))
            : easeOutCubic(clamp01(u / 0.34));
        const sy =
          i === 0
            ? easeOutCubic(clamp01((u - 0.18) / 0.74))
            : easeOutCubic(clamp01((u - 0.06) / 0.36));
        // The swell rides on the birth scale rather than uSize, so a plane
        // under the cursor grows about its own centre. On phones the seed
        // also dips while its art is swapped for another category.
        const dip =
          i === 0 && mobileNow
            ? params.mobileSwapDip + (1 - params.mobileSwapDip) * mobileSwap.t
            : 1;
        const sw = swellOf(i) * dip;
        uniforms.uScale.value[i].set(
          sx * sw,
          sy * sw,
          1 - params.sideDim * sideF[i],
          cell,
        );

        // Same box the shader draws, tested in the plane's own frame, so it
        // answers for the card as it actually is: turned, leaned and swollen.
        // Cards never overlap once formed, so the first hit is the only hit.
        if (probe && overI < 0) {
          const rot = uniforms.uRot.value[i];
          const qx = cursor.x - (px + leanX[i] + pushX);
          const qy = cursor.y - (py + leanY[i] + pushY);
          const cr = Math.cos(rot);
          const sr = Math.sin(rot);
          if (
            Math.abs(qx * cr + qy * sr) <= W * 0.5 * sx * sw &&
            Math.abs(-qx * sr + qy * cr) <= H * 0.5 * sy * sw
          ) {
            overI = i;
          }
        }

        order.push(i);
      }

      for (let i = count; i < MAX_PLANES; i++) {
        uniforms.uScale.value[i].set(0, 0, 1, 0);
        hoverF[i] = 0;
        leanX[i] = 0;
        leanY[i] = 0;
        sideF[i] = 0;
      }

      over = overI;
      const nextCursor = dragging
        ? "grabbing"
        : over >= 0 && interactive
          ? "pointer"
          : "default";
      if (nextCursor !== canvasCursor) {
        canvasCursor = nextCursor;
        renderer.domElement.style.cursor = nextCursor;
      }
      if (over >= 0) colorPlane = over;
      const hoverColor = colorPlane >= 0 ? hoverF[colorPlane] : 0;
      if (over < 0 && hoverColor < 0.001) colorPlane = -1;
      uniforms.uHoverPlane.value = colorPlane;
      uniforms.uHoverColor.value = hoverColor;
      const wantClose =
        over >= 0 && !coarse && viewW > params.cursorLabelFrom;
      if (wantClose !== tagUp) {
        tagUp = wantClose;
        if (hoverClose) {
          gsap.to(hoverClose, {
            autoAlpha: wantClose ? 1 : 0,
            duration: 0.2,
            overwrite: "auto",
          });
        }
      }
      // Off the resting centre, so a card being pushed cannot chase its own
      // shadow next frame.
      if (over >= 0) focusPos.copy(rest[over]);

      if (pointer.seeded) {
        setCloseX?.(cursor.x + viewW * 0.5 + 12);
        setCloseY?.(viewH * 0.5 - cursor.y + 12);
      }

      // The column and the meta name whatever cell the front plane is wearing,
      // read off the same deal the shader was handed rather than recomputed —
      // so the highlight cannot disagree with the art.
      if (frontI >= 0 && imageCount > 0 && frontCell !== shown) {
        shown = frontCell;
        paintList();
      }

      // 投影钉在当前正面卡片上，随圆环转动/悬停位移，而不是钉死在视口。
      if (finalShadowPin && frontI >= 0) {
        const pos = uniforms.uPos.value[frontI];
        const sc = uniforms.uScale.value[frontI];
        const rot = uniforms.uRot.value[frontI];
        const refW = (FINAL_SHADOW_BOX.width / params.refWidth) * viewW;
        const k = refW > 0.001 ? (W * sc.x) / refW : 1;
        finalShadowPin.style.transform =
          `translate(-50%, -50%) translate(${pos.x}px, ${-pos.y}px) rotate(${-rot}rad) scale(${k})`;
      }

      /* ---- honey ---- */
      // One bridge per parent/child pair, in ring order. Deliberately none
      // closing the circle while the fan is opening: those two planes were
      // never merged, so there is nothing between them to stretch.
      order.sort((a, b) => signedOffset(a) - signedOffset(b));

      const edgeHalf = faceEdge * 0.5 * params.thread;
      // Once closed the seam pair are neighbours like any other, and without a
      // link the one gap the fan never opened is the only one the cursor
      // cannot web back together.
      const closed = spread > 0.995 && count > 2;
      const linkCount = Math.min(closed ? count : count - 1, MAX_LINKS);

      for (let l = 0; l < linkCount; l++) {
        const ia = order[l];
        const ib = order[(l + 1) % count];

        const ca = uniforms.uPos.value[ia];
        const cb = uniforms.uPos.value[ib];
        const scA = uniforms.uScale.value[ia];
        const scB = uniforms.uScale.value[ib];

        // Measured between resting centres and birth scales, never hovered
        // ones. The unfurl's response to separation is ferociously steep — a
        // couple of percent of the gap is already a slab — so letting the lean
        // and the swell in turns a hover into a puzzle-piece join.
        const shrinkA = (params.radial ? scA.y : scA.x) / swellOf(ia);
        const shrinkB = (params.radial ? scB.y : scB.x) / swellOf(ib);
        const sep =
          rest[ia].distanceTo(rest[ib]) - sepExtent * 0.5 * (shrinkA + shrinkB);

        // 0 = faces still touching, 1 = landed at the resting gap.
        const v = clamp01(sep / finalSep);

        // Hover strings its own thread on its own curve, so it can be dialled
        // to a filament rather than inheriting the unfurl's slab. Taken at the
        // gap's midpoint, so the strongest pull lands between two planes.
        let fl = 0;
        if (track && params.web > 0.0001) {
          const mx = (ca.x + cb.x) * 0.5;
          const my = (ca.y + cb.y) * 0.5;
          const webReach = Math.max(1, params.webReach * W);
          const d = Math.hypot(cursor.x - mx, cursor.y - my);
          fl = smoothstep(webReach, webReach * 0.15, d) * cursor.amt;
        }
        // Eased on the same rates as the planes it hangs between, or the
        // thread would be there before the pull was.
        webF[l] += (fl - webF[l]) * (fl > webF[l] ? kRise : kFall);

        const w = Math.max(Math.pow(1 - v, params.thin), params.web * webF[l]);
        // dissolve carries the radius past zero and out of antialiasing range
        // so the thread fades instead of bottoming out as a half-covered
        // hairline. In screen px, so unlike edgeHalf it does not carry g.
        const rEnd = edgeHalf * w - params.dissolve;
        const rMid = rEnd * (1 - (1 - params.pinch) * smoothstep(0, 0.7, v));

        uniforms.uLinkA.value[l].copy(ca);
        uniforms.uLinkB.value[l].copy(cb);
        uniforms.uLinkPar.value[l].set(
          rEnd,
          rMid,
          params.sag * g * Math.pow(v, 1.5),
          // Per link, not global: with staggered generations these are all at
          // different stages. Never wider than the neck it rounds.
          Math.min(
            params.fillet * g * smoothstep(0, 0.35, v),
            Math.max(rMid, 0) * 1.5,
          ),
        );
      }
      for (let l = linkCount; l < MAX_LINKS; l++) {
        uniforms.uLinkPar.value[l].set(-100, -100, 0, 0);
      }
      uniforms.uLinkCount.value = linkCount;

      // Both are px into the distance field, so they scale with the ring or
      // the merge reads as a different material at a different window size.
      uniforms.uK.value = params.goo * planeK * fit;
      uniforms.uWobble.value =
        params.wobble * fit * (1 - smoothstep(0.2, 0.95, state.progress));

      // Gated on the seed's own cell, not on the atlas existing: the texture
      // is bound from frame one but blank, and texturing before anything is
      // painted into it draws an empty cell.
      uniforms.uTextured.value = params.textured && firstIn ? 1 : 0;
      uniforms.uBlend.value = Math.max(0.5, params.blend * planeK * g);

      const on = params.glass;
      uniforms.uBandTop.value = on ? params.bandTop * viewH : 0;
      uniforms.uBandBottom.value = on ? params.bandBottom * viewH : 0;
      uniforms.uGlass.value.set(
        params.refract,
        params.squeeze,
        params.ripple,
        params.rippleFreq,
      );
      uniforms.uFringe.value = on ? params.fringe : 0;
      uniforms.uSheen.value = on ? params.sheen : 0;
    };

    /* ------------------------------------------------------- entry timeline */
    // Bumped per build, so a hold left waiting on a run that has since been
    // replaced cannot resume a timeline nobody is watching.
    let entryGen = 0;

    const build = () => {
      stagePhase = "entry";
      ringAutoRotating = false;
      interactive = false;
      announced = -1;
      spinVel = 0;
      backgroundSpin = 0;
      layer2Spin = 0;
      ringAutoRotateElapsed = 0;
      dragging = false;
      settling = false;
      // The timeline tweens state.spin, so a pick in flight has to be off the
      // same property before it starts.
      stopPick();

      const gen = ++entryGen;
      // Only the first run has anything to wait for; a replay should not flash
      // the counter back up.
      if (loaderEl) gsap.set(loaderEl, { opacity: launchReady ? 0 : 1 });
      if (listEl) {
        gsap.set(listEl, { opacity: 0 });
        listEl.style.pointerEvents = "none";
        gsap.set(categoryWords, {
          opacity: 0,
          yPercent: 75,
          scale: 0,
          transformOrigin: "center center",
        });
      }
      if (stageBackground) gsap.set(stageBackground, { opacity: 0 });
      gsap.set(rotatingBackgroundLayers, {
        rotation: 0,
        transformOrigin: "50% 50%",
      });
      if (finalShadow) gsap.set(finalShadow, { opacity: 0, force3D: false });
      if (brandStage && brandBackground && brandText) {
        gsap.set(brandStage, { opacity: 1 });
        gsap.set(brandBackground, { clipPath: "inset(0 100% 0 0)" });
        gsap.set(brandText, { clipPath: "inset(0 100% 0 0)" });
      }

      const tl = gsap.timeline({ delay: 0.25 });

      tl.fromTo(
        state,
        { progress: 0, launch: 0, spread: 0, spin: 0, shift: 0 },
        { progress: 1, duration: 0.8, ease: "power2.out" },
      );

      // Formed and sitting at centre. It stays there until the counter lands,
      // so the ring can never unfurl into cards with nothing on them. Usually
      // there is nothing left to wait for by the time the playhead arrives —
      // the counter is paced against this same birth.
      tl.addPause(">", () => {
        whenReady(() => {
          gsap.delayedCall(params.holdAfter, () => {
            if (disposed || gen !== entryGen) return;
            tl.resume();
            if (loaderEl) {
              gsap.to(loaderEl, {
                opacity: 0,
                duration: params.loaderOut,
                ease: "power2.in",
              });
            }
          });
        });
      });

      const launchStart = tl.duration();
      tl.to(
        state,
        {
          launch: 1,
          duration: params.launchTime,
          ease: "power2.inOut",
        },
        launchStart,
      );
      if (brandStage && brandBackground && brandText) {
        const textStart =
          launchStart + params.launchTime * params.brandTextAt;
        const backgroundStart =
          textStart + params.brandTextTime * params.brandBackgroundAt;
        tl.to(
          brandText,
          {
            clipPath: "inset(0 0% 0 0)",
            duration: params.brandTextTime,
            ease: "power2.out",
          },
          textStart,
        );
        // Clip the bar, not the type: white copy sits inside so it stays
        // white wherever the black fill is, at any viewport.
        tl.to(
          brandBackground,
          {
            clipPath: "inset(0 0% 0 0)",
            duration: params.brandBackgroundTime,
            ease: "power2.inOut",
          },
          backgroundStart,
        );
      }

      // Phone: no ring. The lockup holds a beat and fades, then the seed grows
      // into the third act by itself; a downward swipe during the hold only
      // brings that forward.
      if (mobileNow) {
        params.imageOffset = INITIAL_CELL;
        mobileSwap.t = 1;
        mobileStage?.hide();
        const holdStart = tl.duration() + params.mobileHoldTime;
        if (brandStage) {
          tl.to(
            brandStage,
            { opacity: 0, duration: 0.4, ease: "power2.in" },
            holdStart,
          );
        }
        tl.call(
          () => {
            if (disposed || gen !== entryGen) return;
            stagePhase = "hold";
            transitionToFinal();
          },
          undefined,
          holdStart + 0.2,
        );
        return tl;
      }

      // Absolute positions from here, so the stage can be dropped anywhere
      // inside the spread rather than only after it.
      const spreadStart = tl.duration() - 0.15;
      tl.to(
        state,
        { spread: 1, duration: params.spreadTime, ease: params.spreadEase },
        spreadStart,
      );
      if (brandStage) {
        tl.to(
          brandStage,
          { opacity: 0, duration: 0.4, ease: "power2.in" },
          spreadStart + 0.2,
        );
      }

      const textStart = spreadStart + params.textAt * params.spreadTime;

      if (splitText.chars.length) {
        tl.fromTo(
          splitText.chars,
          { value: 0 },
          {
            value: 1,
            duration: params.textTime,
            ease: params.textEase,
            stagger: params.textStagger,
          },
          textStart,
        );
      }

      // The heading has done its job by the time the ring is in place, and
      // from then on it is behind the front card. Timed off whichever staging
      // move finishes last, so it still lands with them if either is retimed.
      if (params.textOut && splitText.fades.length) {
        const landed = spreadStart + params.spreadTime;
        tl.fromTo(
          splitText.fades,
          { value: 1 },
          {
            value: 0,
            duration: params.textOutTime,
            ease: params.textOutEase,
            stagger: params.textStagger,
          },
          Math.max(0, landed + params.textOutAt),
        );
      }

      const ringLanded = spreadStart + params.spreadTime;
      const backgroundStart = spreadStart + params.backgroundInDelay;
      // Stage 2 starts when the ring lands; background can keep fading in.
      const holdStart = ringLanded;
      if (stageBackground) {
        tl.to(
          stageBackground,
          {
            opacity: 1,
            duration: params.backgroundInTime,
            ease: "power2.out",
          },
          backgroundStart,
        );
      }
      tl.call(() => {
        if (!disposed && gen === entryGen) ringAutoRotating = true;
      }, undefined, ringLanded);
      tl.call(() => {
        if (disposed || gen !== entryGen) return;
        stagePhase = "hold";
        if (pendingGoFinal) {
          pendingGoFinal = false;
          transitionToFinal();
        }
      }, undefined, holdStart);

      return tl;
    };

    styleMeta();

    let tl = null;
    let finalTl = null;

    let pendingGoFinal = false;

    const transitionToFinal = () => {
      if (stagePhase !== "hold") return;

      stagePhase = "transitioning";
      ringAutoRotating = false;
      finalTl?.kill();
      // Entry still fades the backdrop in; kill it or stage 3 keeps the rings.
      if (stageBackground) {
        tl?.killTweensOf(stageBackground);
        gsap.killTweensOf(stageBackground);
      }
      const finalSpin = state.spin - params.spinTurns * TAU;
      finalTl = gsap.timeline({
        onComplete: () => {
          if (disposed) return;
          stagePhase = "final";
          announced = -1;
          interactive = true;
          if (listEl) listEl.style.pointerEvents = "auto";
          if (stageBackground) gsap.set(stageBackground, { opacity: 0 });
        },
      });

      // Phone: the seed grows straight into the big card — no spin, no
      // backdrop to fade — and the copy comes in word by word as it lands.
      if (mobileNow) {
        finalTl.to(
          state,
          { shift: 1, duration: params.moveTime, ease: params.moveEase },
          0,
        );
        finalTl.call(
          () => {
            if (!disposed) mobileStage?.reveal();
          },
          undefined,
          params.moveTime * params.mobileRevealAt,
        );
        return;
      }

      if (stageBackground) {
        finalTl.to(
          stageBackground,
          {
            opacity: 0,
            duration: params.backgroundOutTime,
            ease: "power2.inOut",
            overwrite: "auto",
          },
          0,
        );
      }
      finalTl.to(
        state,
        {
          spin: finalSpin,
          duration: params.spinTime,
          ease: params.spinEase,
        },
        params.spinDelay,
      );
      finalTl.to(
        state,
        {
          shift: 1,
          duration: params.moveTime,
          ease: params.moveEase,
        },
        params.moveDelay,
      );
      if (listEl) {
        const listRevealAt = Math.max(
          params.moveDelay,
          params.moveTime * 0.55,
        );
        const listWords = gsap.utils.shuffle([...categoryWords]);
        finalTl.set(listEl, { opacity: 1 }, listRevealAt);
        finalTl.fromTo(
          listWords,
          { opacity: 0, yPercent: 75, scale: 0 },
          {
            opacity: 1,
            yPercent: 0,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.05,
          },
          listRevealAt,
        );
      }
      if (finalShadow) {
        finalTl.to(
          finalShadow,
          {
            opacity: 1,
            duration: params.textTime,
            ease: params.textEase,
            force3D: false,
          },
          Math.max(params.moveDelay, params.moveTime * 0.55),
        );
      }
    };

    const handleStageScroll = (deltaY) => {
      ensureLoop();
      if (stagePhase === "transitioning") return true;
      if (deltaY <= 0 || stagePhase === "final") return false;
      if (stagePhase === "hold") {
        transitionToFinal();
        return true;
      }
      // 圆环已在转、hold 回调还没落到：记下这次下滑，落地后立刻进第三阶段
      if (ringAutoRotating) pendingGoFinal = true;
      return true;
    };

    if (scrollHandlerRef) {
      scrollHandlerRef.current = handleStageScroll;
    }

    const replay = () => {
      pendingGoFinal = false;
      finalTl?.kill();
      tl?.kill();
      tl = build();
    };

    // The entry is built once, and not until the faces are in. Every glyph
    // mask is sized by the glyph inside it, and the timeline holds direct
    // references to the uniforms those masks own — so rebuilding the text
    // later means rebuilding the timeline, which snaps state back to zero and
    // restarts the whole entry. On a warm cache fonts resolve in milliseconds
    // and that was invisible; on a cold one they arrive late and it reads as
    // the page going blank and starting over.
    const startEntry = () => {
      if (disposed || tl) return;
      splitText.build();
      styleMeta();
      ensureLoop();
      replay();
    };

    // fonts.ready is reliable, but nothing here is worth a permanently blank
    // page if it ever is not.
    const fontFallback = setTimeout(startEntry, 3000);
    (document.fonts?.ready ?? Promise.resolve())
      .then(startEntry)
      .catch(startEntry);

    /* ---------------------------------------------------------------- loop */
    const start = performance.now();
    let prevT = start;

    const step = () => {
      const now = performance.now();
      if (disposed || pausedRef.current) {
        loopOn = false;
        renderer.setAnimationLoop(null);
        prevT = now;
        return;
      }
      // Clamped, so a backgrounded tab does not resume with one huge step.
      const dt = Math.min(0.05, (now - prevT) / 1000);
      prevT = now;
      uniforms.uTime.value = (now - start) * 0.001;

      if (ringAutoRotating) {
        state.spin -= params.holdSpinSpeed * dt;
        ringAutoRotateElapsed += dt;
        backgroundSpin += params.holdSpinSpeed * dt;
        for (const layer of immediateBackgroundLayers) {
          layer.style.transform = `rotate(${backgroundSpin}rad)`;
        }
        if (
          stageLayer2 &&
          ringAutoRotateElapsed >= params.layer2SpinDelay
        ) {
          layer2Spin += params.holdSpinSpeed * dt;
          stageLayer2.style.transform = `rotate(${layer2Spin}rad)`;
        }
      }

      if (interactive && !dragging && !picking) {
        state.spin += spinVel * dt;
        spinVel *= Math.pow(params.damping, dt * 60);

        // How far off the nearest slot the ring is. Zero while snap is off,
        // which leaves the parking test below reading as it always did.
        let off = 0;

        if (params.snap) {
          const slot = TAU / Math.round(params.count);
          // Rate the damping alone bleeds velocity off at, in 1/s. What is
          // left to coast is exactly v / this.
          const decay = Math.max(0.01, -Math.log(params.damping) * 60);

          // A flick is left alone until it is nearly spent, and this is what
          // counts as nearly. Never lower than the speed that leaves half a
          // slot of coast: above that the slot it is heading for is still in
          // front of it, so the run-in can only carry on forward. Later than
          // that and it has to back up, which is the one thing that looks
          // wrong.
          const engage = Math.max(params.snapFrom, decay * slot * 0.5);
          // Half a slot down to a pixel is about 4.8 e-foldings, which is what
          // lets snapTime read back as seconds.
          const rate = 4.8 / Math.max(0.05, params.snapTime);

          if (!settling && Math.abs(spinVel) < engage) {
            // Committed from where the coast alone would have left it, so it
            // carries on to the slot it was already heading for rather than
            // pulling up short. Measured off the seed and off wherever front
            // ended up, so a plane lands facing the viewer.
            const coast = state.spin + spinVel / decay;
            const phase = params.seed * DEG - frontAngle;
            snapTo = Math.round((coast + phase) / slot) * slot - phase;
            // Never quicker than it was already going, so the run-in can only
            // slow the ring down. Floored at what the worst case it can be
            // handed needs, or committing from a standstill caps itself at
            // zero and never moves.
            snapCap = Math.max(Math.abs(spinVel), slot * 0.5 * rate);
            settling = true;
          }

          if (settling) {
            off = snapTo - state.spin;
            // Speed proportional to what is left: the ring runs in on an
            // exponential and stops dead on the slot. Tying speed to distance
            // is what makes overshoot impossible, and overshoot would read as
            // a click rather than a glide.
            const aim = Math.max(-snapCap, Math.min(snapCap, off * rate));
            spinVel += (aim - spinVel) * clamp01(rate * dt);
          }
        } else {
          settling = false;
        }

        // Parked. Left running, the last hundredth of a degree creeps on for
        // ever, so put it down exactly on the slot.
        if (Math.abs(spinVel) < 0.0015 && Math.abs(off) < 0.0008) {
          spinVel = 0;
          state.spin += off;
        }
      }

      tickLoader(dt);
      updatePointer(dt);
      layout(dt);

      // The name arrives with the card, not while one flicks past. A pick
      // drives spin by tween, so spinVel is zero throughout — without that
      // test the meta would morph as the ring passed the halfway mark.
      if (
        interactive &&
        !dragging &&
        !picking &&
        spinVel === 0 &&
        shown >= 0 &&
        shown !== announced
      ) {
        announced = shown;
        meta.show(shown);
      }

      renderer.render(scene, camera);

      const hoverBusy =
        cursor.amt > 0.02 ||
        cursor.wake > 0.02 ||
        Math.hypot(pointer.x - cursor.x, pointer.y - cursor.y) > 0.4;
      const busy =
        dragging ||
        picking ||
        settling ||
        hoverBusy ||
        Math.abs(spinVel) > 0.0015 ||
        Boolean(tl?.isActive()) ||
        Boolean(finalTl?.isActive());
      if (!busy) {
        loopOn = false;
        renderer.setAnimationLoop(null);
      }
    };

    ensureLoop = () => {
      if (disposed || pausedRef.current || loopOn) return;
      loopOn = true;
      prevT = performance.now();
      renderer.setAnimationLoop(step);
    };
    kickLoopRef.current = ensureLoop;
    ensureLoop();

    return () => {
      disposed = true;
      kickLoopRef.current = () => {};
      clearTimeout(holdTimer);
      clearTimeout(fontFallback);
      renderer.setAnimationLoop(null);

      window.removeEventListener("resize", onResize);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("click", onClick);
      container.removeEventListener("keydown", onKeyDown);

      if (scrollHandlerRef?.current === handleStageScroll) {
        scrollHandlerRef.current = null;
      }
      if (categorySelectRef.current === pickCategory) {
        categorySelectRef.current = null;
      }
      finalTl?.kill();
      tl?.kill();
      gsap.killTweensOf(splitText.chars);
      gsap.killTweensOf(splitText.fades);
      gsap.killTweensOf(listEl);
      gsap.killTweensOf(categoryWords);
      gsap.killTweensOf(hoverClose);
      meta.dispose();
      splitText.dispose();
      mesh.geometry.dispose();
      mesh.material.dispose();
      uniforms.uAtlas.value?.dispose();
      uniforms.uTagTex.value?.dispose();

      // dispose() frees GL resources but leaves the context itself alive until
      // the canvas is collected, which is not deterministic. This effect
      // re-runs on every StrictMode double mount and every hot update, so
      // without an explicit release they pile up, and once the browser's limit
      // is reached the renderer above cannot be constructed at all.
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [nameFont, onSelect, scrollHandlerRef]);

  return (
    <>
      <div
        ref={stageBackgroundRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-0 max-md:hidden"
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "max(100vw, 180vh)",
            height: "max(55.5556vw, 100vh)",
          }}
        >
          <div
            ref={stageLayer4Ref}
            className="absolute"
            style={{
              left: "40.441962%",
              top: "29.923065%",
              width: "23.971948%",
              height: "43.149628%",
            }}
          >
            <Image
              src="/archive-ga-004/background-layers/layer-04.webp"
              alt=""
              fill
              unoptimized
              sizes="40vw"
              className="object-fill"
            />
          </div>
          <div
            ref={stageLayer3Ref}
            className="absolute"
            style={{
              left: "27.16078%",
              top: "14.75%",
              width: "40.289493%",
              height: "73.495682%",
            }}
          >
            <Image
              src="/archive-ga-004/background-layers/layer-03.webp"
              alt=""
              fill
              unoptimized
              sizes="75vw"
              className="object-fill"
            />
          </div>
          <div
            ref={stageLayer2Ref}
            className="absolute"
            style={{
              left: "32.007173%",
              top: "15.237301%",
              width: "40.830936%",
              height: "72.521091%",
            }}
          >
            <Image
              src="/archive-ga-004/background-layers/layer-02.webp"
              alt=""
              fill
              unoptimized
              sizes="67vw"
              className="object-fill"
            />
          </div>
          <Image
            src="/archive-ga-004/background-layers/layer-01.webp"
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="object-fill"
          />
        </div>
      </div>

      <div
        ref={finalShadowRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] overflow-visible opacity-0 max-md:hidden"
      >
        <div
          ref={finalShadowPinRef}
          className="absolute left-1/2 top-1/2 box-border overflow-visible [--viscose-su:calc(100vw/1440)]"
          style={{
            width: su(FINAL_SHADOW_BOX.width + FINAL_SHADOW_BLEED * 2),
            height: su(FINAL_SHADOW_BOX.height + FINAL_SHADOW_BLEED * 2),
            padding: su(FINAL_SHADOW_BLEED),
          }}
        >
          <div className="relative size-full overflow-visible">
            <FinalCardShadowBlob
              left={14}
              top={245}
              width={338}
              height={61}
              blur={34}
            />
            <FinalCardShadowBlob
              left={0}
              top={0}
              width={28}
              height={258}
              blur={26}
            />
            <FinalCardShadowBlob
              right={0}
              top={28}
              width={32}
              height={222}
              blur={26}
            />
          </div>
        </div>
      </div>

      {/* touch-none, or the browser claims the gesture for panning and the
          pointermove stream dies mid-drag. Nothing here scrolls — the swipe
          is the carousel. */}
      <div
        ref={containerRef}
        tabIndex={0}
        role="application"
        aria-label="作品轮播，向下滚动展开，使用左右方向键或拖动浏览"
        className="absolute inset-0 z-[2] touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-grey-400"
      />

      <p
        ref={hoverCloseRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-20 font-bodoni text-20 font-normal uppercase leading-normal text-white opacity-0 mix-blend-difference"
      >
        {cursorLabel}
      </p>

      {/* Geometry lives in unitless custom properties so the phone artboard
          (Figma 947-726, 390 wide) swaps in with max-md: overrides. dx/dy are
          offsets in design units from --brand-anchor (50% on desktop, the
          left edge on phones) and the vertical centre. */}
      <div
        ref={brandStageRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-0 [--viscose-su:calc(100vw/1440)] [--brand-anchor:50%] [--brand-text-dx:-104] [--brand-text-dy:-11] [--brand-font:18] [--brand-line:24] [--brand-bar-dx:-172] [--brand-bar-dy:-23] [--brand-bar-w:235] [--brand-bar-h:43] max-md:[--viscose-su:calc(100vw/390)] max-md:[--brand-anchor:0%] max-md:[--brand-text-dx:54] max-md:[--brand-text-dy:-10] max-md:[--brand-font:16] max-md:[--brand-line:20] max-md:[--brand-bar-dx:0] max-md:[--brand-bar-dy:-22] max-md:[--brand-bar-w:201]"
      >
        <div
          className="absolute font-bodoni uppercase"
          style={{
            left: "calc(var(--brand-anchor) + var(--viscose-su) * var(--brand-text-dx))",
            top: "calc(50% + var(--viscose-su) * var(--brand-text-dy))",
            fontSize: "calc(var(--viscose-su) * var(--brand-font))",
            lineHeight: "calc(var(--viscose-su) * var(--brand-line))",
          }}
        >
          <span
            ref={brandTextRef}
            className="absolute left-0 top-0 w-max whitespace-nowrap text-grey-400"
          >
            Grava Design Studio
          </span>
        </div>
        <div
          ref={brandBackgroundRef}
          className="absolute overflow-hidden bg-grey-400"
          style={{
            left: "calc(var(--brand-anchor) + var(--viscose-su) * var(--brand-bar-dx))",
            top: "calc(50% + var(--viscose-su) * var(--brand-bar-dy))",
            width: "calc(var(--viscose-su) * var(--brand-bar-w))",
            height: "calc(var(--viscose-su) * var(--brand-bar-h))",
          }}
        >
          <span
            className="absolute whitespace-nowrap font-bodoni uppercase text-white"
            style={{
              left: "calc(var(--viscose-su) * (var(--brand-text-dx) - var(--brand-bar-dx)))",
              top: "calc(var(--viscose-su) * (var(--brand-text-dy) - var(--brand-bar-dy)))",
              fontSize: "calc(var(--viscose-su) * var(--brand-font))",
              lineHeight: "calc(var(--viscose-su) * var(--brand-line))",
            }}
          >
            Grava Design Studio
          </span>
        </div>
      </div>

      {/* Never takes the pointer: the canvas underneath handles the wheel and
          the drag, and the column has no business interrupting a throw that
          happens to pass under it. Sized from styleMeta, not a class, so it
          takes the narrow bump with every other label. */}
      <ul
        ref={listRef}
        aria-label="Projects"
        style={{
          right: "20px",
          top: "calc(50% - 114px)",
          width: "507px",
        }}
        className={`absolute z-10 flex flex-col items-start gap-8 leading-5 text-grey-300 opacity-0 [--viscose-su:calc(100vw/1440)] max-md:hidden ${categoryFontClass}`}
      >
        {PROJECTS.slice(0, IMAGE_FILES.length).map((p, i) => (
          <li
            key={`${p.file}-${i}`}
            ref={(el) => {
              itemsRef.current[i] = el;
            }}
            className="group relative h-5 aria-[current=true]:text-grey-400"
          >
            <span
              className="pointer-events-none absolute right-full top-1/2 mr-1 flex -translate-y-1/2 items-center"
              style={{ marginTop: "1px" }}
            >
              <span className="block size-3 bg-grey-400 opacity-0 group-aria-[current=true]:opacity-100" />
            </span>
            <FlipHoverButton
              label={`${String(i + 1).padStart(3, "0")}  ${categoryLabels[i] ?? p.listLabel}`}
              showHoverMark
              groupEntryWords
              firstTokenClassName="relative top-0.5 font-bodoni"
              markOffsetY={1}
              aria-label={categoryLabels[i] ?? p.listLabel}
              onClick={() => categorySelectRef.current?.(i)}
              className="h-5 transition-colors group-hover:text-grey-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2"
            />
          </li>
        ))}
      </ul>

      {/* Three rows per side, identical in structure and all carrying both
          words: two inside the filtered wrapper that melt into each other, and
          one outside it for words carrying over unchanged. Which row paints
          what is decided per change — see ring/meta.js.

          Hidden from the accessibility tree; a card is announced once, in
          full, from the live region below. */}
      {[
        { side: "left", justify: "flex-start" },
        { side: "right", justify: "flex-end" },
      ].map(({ side, justify }) => {
        // Baseline, not centre: the halves are set at different sizes, and a
        // shared baseline is what makes them read as one lockup.
        const row = (
          <span className="flex items-baseline whitespace-nowrap">
            <span />
            <span />
          </span>
        );
        return (
          <div
            key={side}
            ref={(el) => {
              metaRef.current[side].box = el;
            }}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 tracking-[-0.01em] text-grey-400 opacity-0"
          >
            <span
              ref={(el) => {
                metaRef.current[side].goo = el;
              }}
              className="absolute inset-0"
              // Promoted up front, so switching the goo on and off is not also
              // a compositor layer being created and thrown away.
              style={{ willChange: "filter" }}
            >
              {[0, 1].map((i) => (
                <span
                  key={i}
                  ref={(el) => {
                    metaRef.current[side].layers[i] = el;
                  }}
                  className="absolute inset-0 flex items-center"
                  style={{ justifyContent: justify }}
                >
                  {row}
                </span>
              ))}
            </span>
            <span
              ref={(el) => {
                metaRef.current[side].plain = el;
              }}
              className="absolute inset-0 flex items-center"
              style={{ justifyContent: justify }}
            >
              {row}
            </span>
          </div>
        );
      })}

      {/* 1% to 100%. Holds the entry at the seed until it gets there. */}
      <div
        ref={loaderRef}
        aria-hidden="true"
        className="pointer-events-none absolute right-[20px] z-10 tracking-[-0.01em] text-grey-400"
      />

      <div ref={liveRef} aria-live="polite" className="sr-only" />

      {/* Phone third act (Figma 947-3937). The big picture is the WebGL seed
          grown in place; this carries the heading, chips, copy and button. */}
      <ViscoseMobileStage
        ref={mobileStageRef}
        active={mobileShown}
        heading={mobileHeading ?? ""}
        categoryLabels={categoryLabels ?? []}
        works={mobileWorks ?? []}
        viewDetailsLabel={mobileViewDetails ?? ""}
        onPickCategory={(i) => categorySelectRef.current?.(i)}
        onViewDetails={(i) => onSelect?.(i)}
      />

      {/* Alpha multiplied up hard and biased down, so a pixel is either fully
          opaque or gone. That is what fuses two blurred words into one
          silhouette instead of laying them over each other. Region is
          oversized because the blur bleeds well outside the text's own box. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0"
        focusable="false"
      >
        <defs>
          <filter
            id="name-goo"
            x="-20%"
            y="-100%"
            width="140%"
            height="300%"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              ref={cutRef}
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
}

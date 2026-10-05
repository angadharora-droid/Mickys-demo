"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import {
  CHAPTERS,
  FRAME_ASPECT,
  bleedOpacity,
  phoneZoomAt,
  PHONE_MAX_WIDTH,
  PHONE_ZOOM_MAX,
  deviceWidth,
  frameUrl,
  pickDevice,
  sequenceFor,
  type Device,
  type SequenceSet,
} from "@/lib/sequence";

// A source pixel is never drawn larger than this many device pixels.
// 1 = always pixel-sharp.
const MAX_UPSCALE = 1;

// Loading plan (nothing loads that the visitor isn't about to see):
//   1. the frame for the current scroll position, then a window of frames around it (high priority);
//   2. in idle time, every COARSE-th frame of the current chapter, so a fast scroll always has a near frame;
//   3. the next chapter only once the visitor is NEXT_AT of the way through the current one;
//   4. the remaining frames of the current chapter in idle time, only after the visitor starts scrolling.
const HIGH_CONCURRENCY = 6;
const IDLE_CONCURRENCY = 2;
const COARSE = 6;
const AHEAD = 18; // frames ahead of the playhead (in the scroll direction) once scrolling
const AHEAD_AT_REST = 8; // before the first scroll: just enough for the opening
const BEHIND = 6;
const NEXT_AT = 0.4; // share of a chapter after which the next chapter starts loading
const NEXT_FILL_AT = 0.7; // …and after which all of it may fill in

type Idle = (cb: () => void) => number;
const onIdle: Idle = (cb) =>
  typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(cb, { timeout: 1200 }) : window.setTimeout(cb, 60);
const cancelIdle = (h: number) =>
  typeof window.cancelIdleCallback === "function" ? window.cancelIdleCallback(h) : window.clearTimeout(h);

export type ProductCanvasHandle = {
  /**
   * Playhead per chapter (0 = first frame, 1 = last frame). The last chapter
   * with a value above 0 is shown, so Module 1 plays until Module 2 starts.
   */
  setPlayhead: (progress: readonly number[]) => void;
  /**
   * Where a point of a frame (fractions of its width/height) sits on screen, in CSS px
   * relative to the canvas's positioned container. Accounts for the phone zoom.
   */
  framePoint: (fx: number, fy: number, chapter: number, progress: number) => { x: number; y: number };
};

type Props = {
  className?: string;
  ref?: Ref<ProductCanvasHandle>;
  /** Called with the canvas CSS size whenever it changes (for layout around the pouch). */
  onResize?: (size: { width: number; height: number }) => void;
};

type Chapter = { set: SequenceSet; images: (HTMLImageElement | undefined)[] };

type CanvasState = {
  box: { left: number; top: number; width: number; height: number; phone: boolean }; // frame area, CSS px
  device: Device | null;
  chapters: Chapter[];
  progress: number[];
  chapter: number; // chapter the scroll asks for
  index: number; // frame within that chapter
  drawn: string; // "chapter:index" currently on the canvas
  render: (force?: boolean) => void;
  plan: () => void; // re-prioritise loading around the playhead
};

const isReady = (img?: HTMLImageElement): img is HTMLImageElement =>
  !!img && img.complete && img.naturalWidth > 0;

function target(progress: readonly number[], chapters: Chapter[]) {
  let c = 0;
  for (let i = chapters.length - 1; i > 0; i--) {
    if ((progress[i] ?? 0) > 0) { c = i; break; }
  }
  const p = Math.min(Math.max(progress[c] ?? 0, 0), 1);
  return { chapter: c, index: Math.round(p * (chapters[c].set.frames - 1)) };
}

export default function ProductCanvas({ className = "", ref, onResize }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onResizeRef = useRef(onResize);
  useEffect(() => {
    onResizeRef.current = onResize;
  });
  const state = useRef<CanvasState>({
    box: { left: 0, top: 0, width: 0, height: 0, phone: false },
    device: null,
    chapters: [],
    progress: CHAPTERS.map(() => 0),
    chapter: 0,
    index: 0,
    drawn: "",
    render: () => {},
    plan: () => {},
  });

  // Scroll code calls this directly: no React state, no re-renders while scrolling.
  useImperativeHandle(
    ref,
    () => ({
      setPlayhead(progress) {
        const s = state.current;
        s.progress = [...progress];
        if (!s.chapters.length) return;
        const t = target(s.progress, s.chapters);
        if (t.chapter !== s.chapter || t.index !== s.index) {
          s.chapter = t.chapter;
          s.index = t.index;
          s.render();
          s.plan();
        }
      },
      framePoint(fx, fy, chapter, progress) {
        const b = state.current.box;
        const { zoom, centerX } = b.phone ? phoneZoomAt(chapter, progress) : { zoom: 1, centerX: 0.5 };
        const sx = Math.min(Math.max(centerX - 0.5 / zoom, 0), 1 - 1 / zoom);
        return {
          x: b.left + (fx - sx) * zoom * b.width,
          y: b.top + b.height / 2 + (fy - 0.5) * zoom * b.height,
        };
      },
    }),
    [],
  );

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!box || !canvas || !ctx) return;
    const s = state.current;
    let disposed = false;
    let high: [number, number][] = []; // needed now: rebuilt whenever the playhead moves
    let soon: [number, number][] = []; // idle: coarse passes (current and next chapter)
    let later: [number, number][] = []; // idle: fill-in
    const queued = new Set<string>();
    let active = 0;
    let idleHandle = 0;
    let engaged = false; // the visitor has started scrolling the sequence
    let lastPos = 0; // global frame position, for the scroll direction
    let dir = 1;
    let isPhone = false;
    let frameTop = 0; // device px from the canvas top to where the (unzoomed) frame starts

    // Nearest decoded frame in a chapter, or null.
    const nearest = (c: number, i: number) => {
      const ch = s.chapters[c];
      if (isReady(ch.images[i])) return i;
      for (let d = 1; d < ch.set.frames; d++) {
        if (isReady(ch.images[i - d])) return i - d;
        if (isReady(ch.images[i + d])) return i + d;
      }
      return null;
    };

    const render = (force = false) => {
      if (!s.chapters.length) return;
      let c = s.chapter;
      let i = nearest(c, s.index);
      // A later chapter that hasn't loaded yet starts where the previous one ends.
      while (i === null && c > 0) {
        c--;
        i = nearest(c, s.chapters[c].set.frames - 1);
      }
      if (i === null) return; // nothing decoded yet: leave the maroon background
      const key = `${c}:${i}`;
      if (key === s.drawn && !force) return;

      const img = s.chapters[c].images[i] as HTMLImageElement;
      const progress = i / Math.max(1, s.chapters[c].set.frames - 1);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // The frame fills the canvas width; its aspect ratio is never changed.
      const w = canvas.width;
      const h = Math.round((img.naturalHeight / img.naturalWidth) * w);
      const nw = img.naturalWidth, nh = img.naturalHeight;
      const { zoom, centerX } = isPhone ? phoneZoomAt(c, progress) : { zoom: 1, centerX: 0.5 };
      if (zoom > 1.0001) {
        // Phones: crop the empty sides and scale up evenly, around the frame's centre line.
        const sw = nw / zoom;
        const sx = Math.min(Math.max(centerX * nw - sw / 2, 0), nw - sw);
        const dh = h * zoom;
        ctx.drawImage(img, sx, 0, sw, nh, 0, Math.round(frameTop - (dh - h) / 2), w, Math.round(dh));
      } else {
        ctx.drawImage(img, 0, frameTop, w, h);
        // Bottom bleed: anything leaving the bottom of the frame (the gravy stream)
        // continues straight down to the edge of the screen. Off once the pan arrives.
        const bleed = bleedOpacity(c, progress);
        if (canvas.height > frameTop + h && bleed > 0) {
          ctx.globalAlpha = bleed;
          ctx.drawImage(img, 0, nh - 1, nw, 1, 0, frameTop + h, w, canvas.height - frameTop - h);
          ctx.globalAlpha = 1;
        }
      }
      s.drawn = key;
      canvas.dataset.chapter = String(c + 1); // handy for QA in devtools
      canvas.dataset.frame = String(i + 1);
    };
    s.render = render;

    const load = (ch: Chapter, c: number, i: number, priority = false) => {
      const img = new Image();
      img.decoding = "async";
      if (priority) img.fetchPriority = "high";
      img.src = frameUrl(ch.set, i);
      ch.images[i] = img;
      return img
        .decode()
        .then(() => {
          // A closer frame just arrived: show it.
          if (!disposed && s.chapters[c] === ch && s.drawn !== `${s.chapter}:${s.index}`) render();
        })
        .catch(() => {
          /* a failed frame is skipped; neighbours cover for it */
        });
    };

    const has = (c: number, i: number) => !!s.chapters[c]?.images[i];
    const frames = (c: number) => s.chapters[c]?.set.frames ?? 0;
    const coarse = (c: number) => {
      const n = frames(c), out: number[] = [];
      for (let i = 0; i < n; i += COARSE) out.push(i);
      if (n) out.push(n - 1);
      return out;
    };
    const outward = (c: number, from: number) => {
      const n = frames(c), out: number[] = [];
      for (let d = 0; d < n; d++) {
        const a = from + d * dir, b = from - d * dir;
        if (a >= 0 && a < n) out.push(a);
        if (d && b >= 0 && b < n) out.push(b);
      }
      return out;
    };
    const enqueue = (list: [number, number][], c: number, idx: number[], front = false) => {
      const add: [number, number][] = [];
      for (const i of idx) {
        const k = `${c}:${i}`;
        if (queued.has(k) || has(c, i)) continue;
        queued.add(k);
        add.push([c, i]);
      }
      if (front) list.unshift(...add);
      else list.push(...add);
    };

    const start = (c: number, i: number) => {
      const ch = s.chapters[c];
      if (!ch || ch.images[i]) return false;
      active++;
      load(ch, c, i).finally(() => {
        active--;
        if (!disposed) pump();
      });
      return true;
    };

    const idleWork = () => {
      idleHandle = 0;
      while (active < IDLE_CONCURRENCY && (soon.length || later.length)) {
        const [c, i] = (soon.length ? soon.shift() : later.shift()) as [number, number];
        start(c, i);
      }
    };

    const pump = () => {
      while (active < HIGH_CONCURRENCY && high.length) {
        const [c, i] = high.shift() as [number, number];
        start(c, i);
      }
      if (!high.length && (soon.length || later.length) && !idleHandle) idleHandle = onIdle(idleWork);
    };

    // Called on every playhead change: what is needed now, what can wait.
    const plan = () => {
      const n = s.chapters.length;
      if (!n) return;
      const c = s.chapter, i = s.index;
      let pos = i;
      for (let k = 0; k < c; k++) pos += frames(k);
      if (pos !== lastPos) { dir = pos > lastPos ? 1 : -1; lastPos = pos; }
      if ((s.progress[0] ?? 0) > 0 || c > 0) engaged = true;

      // 1. the window around the playhead, in the scroll direction (crossing into the neighbour chapter)
      const want: [number, number][] = [];
      const add = (cc: number, ii: number) => { if (cc >= 0 && cc < n && ii >= 0 && ii < frames(cc) && !has(cc, ii)) want.push([cc, ii]); };
      add(c, i);
      const ahead = engaged ? AHEAD : AHEAD_AT_REST;
      for (let d = 1; d <= ahead; d++) {
        const j = i + d * dir;
        if (j >= frames(c) && c + 1 < n) add(c + 1, j - frames(c));
        else if (j < 0 && c > 0) add(c - 1, frames(c - 1) + j);
        else add(c, j);
      }
      for (let d = 1; d <= BEHIND; d++) add(c, i - d * dir);
      high = want;

      // 2–4. background work
      enqueue(soon, c, coarse(c));
      const p = s.progress[c] ?? 0;
      if (c + 1 < n && p >= NEXT_AT) enqueue(soon, c + 1, coarse(c + 1), true);
      if (engaged) enqueue(later, c, outward(c, i));
      if (c + 1 < n && p >= NEXT_FILL_AT) enqueue(later, c + 1, outward(c + 1, 0));
      pump();
    };
    s.plan = plan;

    const layout = () => {
      // Phones draw at most 2x: indistinguishable on screen, ~45% fewer pixels to repaint per frame
      // than 3x, and it selects the lighter mobile frame set.
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth <= PHONE_MAX_WIDTH ? 2 : 3);

      // Largest box with the frame's aspect that fits the available area.
      let cssW = Math.min(box.clientWidth, box.clientHeight * FRAME_ASPECT);
      const device = pickDevice(window.innerWidth, cssW * dpr);

      // Never enlarge the source beyond its real resolution.
      cssW = Math.floor(Math.min(cssW, (deviceWidth(device) * MAX_UPSCALE) / dpr));
      const cssH = Math.floor(cssW / FRAME_ASPECT);

      // Centred in the box, exactly where flex centring would put it.
      const left = (box.clientWidth - cssW) / 2;
      const top = (box.clientHeight - cssH) / 2;
      // Extend the canvas down to the bottom of the scene for the bleed.
      const stage = box.offsetParent as HTMLElement | null;
      const bleed = stage ? Math.max(0, Math.ceil(stage.clientHeight - (box.offsetTop + top + cssH))) : 0;
      // Phones: headroom above and below for the Module 3 zoom (the frame itself stays put).
      isPhone = window.innerWidth <= PHONE_MAX_WIDTH;
      const zoomPad = isPhone ? Math.ceil((cssH * (PHONE_ZOOM_MAX - 1)) / 2) : 0;
      const padTop = Math.min(zoomPad, Math.max(0, Math.floor(box.offsetTop + top)));
      const padBottom = Math.max(bleed, zoomPad);

      // CSS size (layout) and backing-store size (device pixels) are set separately.
      canvas.style.left = `${left}px`;
      canvas.style.top = `${top - padTop}px`;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${padTop + cssH + padBottom}px`;
      onResizeRef.current?.({ width: cssW, height: cssH });
      s.box = { left: box.offsetLeft + left, top: box.offsetTop + top, width: cssW, height: cssH, phone: isPhone };
      const pw = Math.round(cssW * dpr);
      frameTop = Math.round(padTop * dpr);
      const ph = frameTop + Math.round(cssH * dpr) + Math.round(padBottom * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw; // resizing clears the canvas
        canvas.height = ph;
      }

      if (s.device !== device) {
        // New device set (first run or crossing a breakpoint): keep the scroll position.
        s.device = device;
        s.chapters = CHAPTERS.map((_, c) => ({ set: sequenceFor(c, device), images: [] }));
        s.drawn = "";
        const t = target(s.progress, s.chapters);
        s.chapter = t.chapter;
        s.index = t.index;
        // start over with the new set: the exact frame first, then the plan around it
        high = []; soon = []; later = []; queued.clear();
        if (idleHandle) { cancelIdle(idleHandle); idleHandle = 0; }
        load(s.chapters[t.chapter], t.chapter, t.index, true);
        plan();
      }
      render(true);
    };

    layout();

    const resizeObserver = new ResizeObserver(() => layout());
    resizeObserver.observe(box);

    // Re-layout when the window moves between Retina and non-Retina screens.
    let dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const onDprChange = () => {
      dprQuery.removeEventListener("change", onDprChange);
      dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      dprQuery.addEventListener("change", onDprChange);
      layout();
    };
    dprQuery.addEventListener("change", onDprChange);

    return () => {
      disposed = true;
      high = []; soon = []; later = [];
      if (idleHandle) cancelIdle(idleHandle);
      resizeObserver.disconnect();
      dprQuery.removeEventListener("change", onDprChange);
      s.chapters = [];
      s.device = null;
      s.drawn = "";
      s.render = () => {};
      s.plan = () => {};
    };
  }, []);

  return (
    <div ref={boxRef} className={className}>
      <canvas ref={canvasRef} role="img" aria-label="A Micky's pouch turning and pouring gravy into a pan" className="absolute block" />
    </div>
  );
}

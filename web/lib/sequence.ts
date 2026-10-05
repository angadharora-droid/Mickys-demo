// Image sequences exported from Blender (3d/export/<module>).
// Each module has three sets covering the same move; smaller sets skip frames.

export type Device = "desktop" | "tablet" | "mobile";

export type SequenceSet = {
  module: string; // folder under /public/sequences
  device: Device;
  frames: number;
  width: number; // source pixels
  height: number;
};

const SIZES: Record<Device, { width: number; height: number }> = {
  desktop: { width: 1500, height: 1350 },
  tablet: { width: 1125, height: 1012 },
  mobile: { width: 750, height: 675 },
};

// Frame counts per device, in scroll order. Each chapter's first frame is
// identical to the previous chapter's last frame.
// bleedUntil: the stream may run off the bottom of the frame, so the bottom row
// is extended to the screen edge. For Module 3 this fades out between those two
// points of the chapter (master frames 11 → 13), before the pan reaches the bottom row.
export const CHAPTERS = [
  { module: "pouch-module1", frames: { desktop: 120, tablet: 90, mobile: 60 }, bleedUntil: null, phoneZoom: null },
  { module: "pouch-module2", frames: { desktop: 100, tablet: 75, mobile: 50 }, bleedUntil: null, phoneZoom: null },
  {
    module: "pouch-module3",
    frames: { desktop: 115, tablet: 86, mobile: 58 },
    bleedUntil: [10 / 114, 12 / 114],
    // Phones only: once the pan is the subject (master frames 25 → 60), crop the empty
    // sides so the pan reads ~33% larger. centerX = crop centre as a share of frame width.
    phoneZoom: { from: 24 / 114, to: 59 / 114, zoom: 1.33, centerX: 780 / 1500 },
  },
] as const;

export const PHONE_MAX_WIDTH = 639; // below the sm breakpoint

/** Zoom and crop centre for a chapter on phones (zoom 1 = the full frame). */
export function phoneZoomAt(chapter: number, progress: number) {
  const z = CHAPTERS[chapter].phoneZoom;
  if (!z) return { zoom: 1, centerX: 0.5 };
  const t = Math.min(Math.max((progress - z.from) / (z.to - z.from), 0), 1);
  const e = t * t * (3 - 2 * t); // smoothstep
  return { zoom: 1 + (z.zoom - 1) * e, centerX: 0.5 + (z.centerX - 0.5) * e };
}

export const PHONE_ZOOM_MAX = Math.max(...CHAPTERS.map((c) => c.phoneZoom?.zoom ?? 1));

/** Opacity of the bottom-edge bleed for a chapter at a given progress (0–1). */
export function bleedOpacity(chapter: number, progress: number) {
  const until = CHAPTERS[chapter].bleedUntil;
  if (!until) return 1;
  const [a, b] = until;
  if (progress <= a) return 1;
  if (progress >= b) return 0;
  return 1 - (progress - a) / (b - a);
}

export const FRAME_ASPECT = 1500 / 1350;

export function sequenceFor(chapter: number, device: Device): SequenceSet {
  const c = CHAPTERS[chapter];
  return { module: c.module, device, frames: c.frames[device], ...SIZES[device] };
}

export function frameUrl(set: SequenceSet, index: number) {
  // index is 0-based within the set
  const n = String(index + 1).padStart(4, "0");
  return `/sequences/${set.module}/${set.device}/${n}.webp`;
}

// Pick the lightest device set that still has enough real pixels for the screen.
// Phones never get the desktop set.
export function pickDevice(viewportWidth: number, neededDevicePx: number): Device {
  if (viewportWidth >= 1024) return "desktop";
  if (neededDevicePx <= SIZES.mobile.width * 1.05) return "mobile";
  return "tablet";
}

export function deviceWidth(device: Device) {
  return SIZES[device].width;
}

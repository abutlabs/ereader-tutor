// Pen notes in the reader — the stylus writes, a finger scrolls, and a pen tap
// still taps (opens a sentence). Uses W3C pointer events (pointerType "pen" vs
// "touch"), which plugins/withPointerEvents.js turns on for Android.
//
//  • While the pen hovers over or touches the page, scrolling is switched off
//    so a stroke never drags the page; a finger switches it straight back on.
//  • A pen-down/up that barely moves is a tap: nothing is drawn and the press
//    reaches the text underneath. After a real stroke, presses are swallowed
//    for a moment so the sentence under the pen doesn't open.
//  • Strokes anchor to the sentence they start beside (see notes/store.ts).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type PointerEvent,
  type TextLayoutEventData,
  type View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { loadPageStrokes, savePageStrokes, type Anchor, type Stroke } from "./store";

const TAP_SLOP = 6; // dp of movement below which a pen down/up is a tap
const MIN_STEP = 1.2; // dp between recorded points
const ERASE_RADIUS = 14; // dp
const HOVER_GRACE = 900; // ms scrolling stays off after the pen was last seen
const PRESS_GUARD = 450; // ms after a stroke during which presses are ignored

type Mode = "pen" | "erase";
type Action = { kind: "add" | "remove"; strokes: Stroke[] };

interface Live {
  id: number;
  raw: number[]; // page coordinates
  sx: number;
  sy: number;
  moved: number;
  removed: Stroke[];
}

let seq = 0;
const newId = () => `${Date.now().toString(36)}-${(seq++).toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export interface Ink {
  columnRef: React.RefObject<View | null>;
  strokes: Stroke[];
  mode: Mode;
  setMode: (m: Mode) => void;
  fingerWrite: boolean;
  setFingerWrite: (v: boolean) => void;
  scrollEnabled: boolean;
  canUndo: boolean;
  undo: () => void;
  clearPage: () => void;
  /** True while/just after a stroke: callers skip their press handlers. */
  swallowPress: () => boolean;
  handlers: {
    onPointerDown: (e: PointerEvent) => void;
    onPointerMove: (e: PointerEvent) => void;
    onPointerUp: (e: PointerEvent) => void;
    onPointerCancel: (e: PointerEvent) => void;
    onLayout: (e: LayoutChangeEvent) => void;
  };
  /** Paragraph View layout (y within the column). */
  paragraphLayout: (pi: number) => (e: LayoutChangeEvent) => void;
  /** Paragraph Text line layout → each sentence's line. `lens` = chars per sentence. */
  paragraphLines: (
    pi: number,
    sentences: { id: string; len: number }[],
  ) => (e: NativeSyntheticEvent<TextLayoutEventData>) => void;
  canvas: React.ReactNode;
}

export function useInk(
  bookId: string | undefined,
  title: string,
  page: number | undefined,
  color: string,
): Ink {
  const [strokes, setStrokesState] = useState<Stroke[]>([]);
  const strokesRef = useRef<Stroke[]>([]);
  const [livePts, setLivePts] = useState<number[] | null>(null);
  const [mode, setMode] = useState<Mode>("pen");
  const [fingerWrite, setFingerWrite] = useState(false);
  const [penNear, setPenNear] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [layoutVer, setLayoutVer] = useState(0);
  const undoStack = useRef<Action[]>([]);
  const [canUndo, setCanUndo] = useState(false);

  const columnRef = useRef<View>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const live = useRef<Live | null>(null);
  const lastInkEnd = useRef(0);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const penNearRef = useRef(false);
  const frame = useRef<number | null>(null);
  const layoutFrame = useRef<number | null>(null);
  const paraY = useRef(new Map<number, number>());
  const sentLine = useRef(new Map<string, { pi: number; y: number }>());
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const fingerRef = useRef(fingerWrite);
  fingerRef.current = fingerWrite;
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const key = useRef({ bookId, title, page });
  key.current = { bookId, title, page };

  // ── Load / save ────────────────────────────────────────────────────────────
  useEffect(() => {
    strokesRef.current = [];
    setStrokesState([]);
    undoStack.current = [];
    setCanUndo(false);
    paraY.current.clear();
    sentLine.current.clear();
    if (!bookId || page == null) return;
    let live = true;
    loadPageStrokes(bookId, page).then((s) => {
      if (!live) return;
      strokesRef.current = s;
      setStrokesState(s);
    });
    return () => {
      live = false;
    };
  }, [bookId, page]);

  const commit = useCallback((next: Stroke[], action?: Action) => {
    strokesRef.current = next;
    setStrokesState(next);
    if (action && action.strokes.length) {
      undoStack.current.push(action);
      if (undoStack.current.length > 100) undoStack.current.shift();
      setCanUndo(true);
    }
    const k = key.current;
    if (k.bookId && k.page != null) savePageStrokes(k.bookId, k.title, k.page, next).catch(() => {});
  }, []);

  // ── Anchors ────────────────────────────────────────────────────────────────
  const bumpLayout = useCallback(() => {
    if (layoutFrame.current != null) return;
    layoutFrame.current = requestAnimationFrame(() => {
      layoutFrame.current = null;
      setLayoutVer((v) => v + 1);
    });
  }, []);

  const anchorY = useCallback((a: Anchor): number => {
    if (a.s) {
      const sl = sentLine.current.get(a.s);
      const py = sl ? paraY.current.get(sl.pi) : undefined;
      if (sl && py != null) return py + sl.y;
    }
    return paraY.current.get(a.p) ?? 0;
  }, []);

  // The sentence (else paragraph) whose line starts at or just above y.
  const anchorFor = useCallback((y: number): Anchor => {
    let best: Anchor = { p: -1 };
    let bestY = -Infinity;
    for (const [id, sl] of sentLine.current) {
      const py = paraY.current.get(sl.pi);
      if (py == null) continue;
      const ay = py + sl.y;
      if (ay <= y + 4 && ay > bestY) {
        best = { s: id, p: sl.pi };
        bestY = ay;
      }
    }
    if (bestY === -Infinity) {
      for (const [pi, py] of paraY.current) {
        if (py <= y + 4 && py > bestY) {
          best = { p: pi };
          bestY = py;
        }
      }
    }
    return best;
  }, []);

  const paragraphLayout = useCallback(
    (pi: number) => (e: LayoutChangeEvent) => {
      paraY.current.set(pi, e.nativeEvent.layout.y);
      bumpLayout();
    },
    [bumpLayout],
  );

  const paragraphLines = useCallback(
    (pi: number, sentences: { id: string; len: number }[]) =>
      (e: NativeSyntheticEvent<TextLayoutEventData>) => {
        const lines = e.nativeEvent.lines;
        if (!lines.length) return;
        let li = 0;
        let lineStart = 0;
        let off = 0;
        for (const s of sentences) {
          while (li < lines.length - 1 && lineStart + lines[li].text.length <= off) {
            lineStart += lines[li].text.length;
            li++;
          }
          sentLine.current.set(s.id, { pi, y: lines[li].y });
          off += s.len;
        }
        bumpLayout();
      },
    [bumpLayout],
  );

  // Strokes in column coordinates for the current layout.
  const rendered = useMemo(() => {
    const w = size.w;
    return strokes.map((s) => {
      const k = w > 0 ? w / s.w : 1;
      const oy = anchorY(s.a);
      const xy = new Array<number>(s.pts.length);
      for (let i = 0; i < s.pts.length; i += 2) {
        xy[i] = s.pts[i] * k;
        xy[i + 1] = oy + s.pts[i + 1] * k;
      }
      return { id: s.id, xy };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes, size.w, layoutVer, anchorY]);
  const renderedRef = useRef(rendered);
  renderedRef.current = rendered;

  // ── Pointer handling ───────────────────────────────────────────────────────
  const accepts = (type: string) => type === "pen" || type === "mouse" || (fingerRef.current && type === "touch");

  const markPenNear = useCallback(() => {
    if (!penNearRef.current) {
      penNearRef.current = true;
      setPenNear(true);
    }
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      penNearRef.current = false;
      setPenNear(false);
    }, HOVER_GRACE);
  }, []);

  const releasePen = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    penNearRef.current = false;
    setPenNear(false);
  }, []);

  useEffect(
    () => () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      if (frame.current != null) cancelAnimationFrame(frame.current);
      if (layoutFrame.current != null) cancelAnimationFrame(layoutFrame.current);
    },
    [],
  );

  const toColumn = (raw: number[]): number[] | null => {
    const o = origin.current;
    if (!o) return null;
    const out = new Array<number>(raw.length);
    for (let i = 0; i < raw.length; i += 2) {
      out[i] = raw[i] - o.x;
      out[i + 1] = raw[i + 1] - o.y;
    }
    return out;
  };

  const scheduleLive = () => {
    if (frame.current != null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const l = live.current;
      if (!l || modeRef.current === "erase" || l.moved < TAP_SLOP) return;
      setLivePts(toColumn(l.raw));
    });
  };

  const eraseAt = (px: number, py: number) => {
    const l = live.current;
    const o = origin.current;
    if (!l || !o) return;
    const x = px - o.x;
    const y = py - o.y;
    const r2 = ERASE_RADIUS * ERASE_RADIUS;
    const hit = new Set<string>();
    for (const s of renderedRef.current) {
      for (let i = 0; i < s.xy.length; i += 2) {
        const dx = s.xy[i] - x;
        const dy = s.xy[i + 1] - y;
        if (dx * dx + dy * dy <= r2) {
          hit.add(s.id);
          break;
        }
      }
    }
    if (!hit.size) return;
    const gone = strokesRef.current.filter((s) => hit.has(s.id));
    l.removed.push(...gone);
    strokesRef.current = strokesRef.current.filter((s) => !hit.has(s.id));
    setStrokesState(strokesRef.current);
  };

  const onPointerDown = (e: PointerEvent) => {
    const ne = e.nativeEvent;
    if (!accepts(ne.pointerType)) {
      if (ne.pointerType === "touch") releasePen(); // a finger: scroll right away
      return;
    }
    if (ne.pointerType !== "touch") markPenNear();
    live.current = { id: ne.pointerId, raw: [ne.pageX, ne.pageY], sx: ne.pageX, sy: ne.pageY, moved: 0, removed: [] };
    setDrawing(true);
    // The column doesn't move during a stroke (scrolling is off), so one
    // measurement maps page coordinates to column coordinates.
    columnRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
      origin.current = { x: pageX, y: pageY };
      const l = live.current;
      if (l && modeRef.current === "erase") eraseAt(l.sx, l.sy);
    });
  };

  const onPointerMove = (e: PointerEvent) => {
    const ne = e.nativeEvent;
    const l = live.current;
    if (!l || ne.pointerId !== l.id) {
      if (ne.pointerType === "pen" || ne.pointerType === "mouse") markPenNear(); // hovering
      return;
    }
    if (ne.pointerType !== "touch") markPenNear();
    const n = l.raw.length;
    const dx = ne.pageX - l.raw[n - 2];
    const dy = ne.pageY - l.raw[n - 1];
    if (dx * dx + dy * dy < MIN_STEP * MIN_STEP) return;
    l.raw.push(ne.pageX, ne.pageY);
    l.moved = Math.max(l.moved, Math.hypot(ne.pageX - l.sx, ne.pageY - l.sy));
    if (modeRef.current === "erase") eraseAt(ne.pageX, ne.pageY);
    else scheduleLive();
  };

  const finish = (e: PointerEvent) => {
    const l = live.current;
    if (!l || e.nativeEvent.pointerId !== l.id) return;
    live.current = null;
    setDrawing(false);
    setLivePts(null);
    if (l.moved >= TAP_SLOP) lastInkEnd.current = Date.now();

    if (modeRef.current === "erase") {
      if (l.removed.length) commit(strokesRef.current, { kind: "remove", strokes: l.removed });
      return;
    }
    if (l.moved < TAP_SLOP) return; // a tap — let it through to the text
    const xy = toColumn(l.raw);
    const w = sizeRef.current.w;
    if (!xy || w <= 0) return;
    const a = anchorFor(xy[1]);
    const oy = anchorY(a);
    const pts = xy.map((v, i) => Math.round((i % 2 ? v - oy : v) * 10) / 10);
    const stroke: Stroke = { id: newId(), a, w, pts, t: Date.now() };
    commit([...strokesRef.current, stroke], { kind: "add", strokes: [stroke] });
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((s) => (s.w === width && s.h === height ? s : { w: width, h: height }));
  };

  // ── Commands ───────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    const act = undoStack.current.pop();
    setCanUndo(undoStack.current.length > 0);
    if (!act) return;
    const ids = new Set(act.strokes.map((s) => s.id));
    const next =
      act.kind === "add"
        ? strokesRef.current.filter((s) => !ids.has(s.id))
        : [...strokesRef.current.filter((s) => !ids.has(s.id)), ...act.strokes].sort((a, b) => a.t - b.t);
    commit(next);
  }, [commit]);

  const clearPage = useCallback(() => {
    if (!strokesRef.current.length) return;
    commit([], { kind: "remove", strokes: strokesRef.current });
  }, [commit]);

  const swallowPress = useCallback(
    () => (live.current != null && live.current.moved >= TAP_SLOP) || Date.now() - lastInkEnd.current < PRESS_GUARD,
    [],
  );

  // ── Canvas ─────────────────────────────────────────────────────────────────
  const canvas = (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={size.w} height={size.h}>
      {rendered.map((s) => (
        <Path key={s.id} d={pathD(s.xy)} stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ))}
      {livePts ? (
        <Path d={pathD(livePts)} stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ) : null}
    </Svg>
  );

  return {
    columnRef,
    strokes,
    mode,
    setMode,
    fingerWrite,
    setFingerWrite: (v: boolean) => {
      setFingerWrite(v);
      if (!v) releasePen();
    },
    scrollEnabled: !(fingerWrite || penNear || drawing),
    canUndo,
    undo,
    clearPage,
    swallowPress,
    handlers: { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish, onLayout },
    paragraphLayout,
    paragraphLines,
    canvas,
  };
}

// Smooth path through the points (quadratic curves via midpoints).
function pathD(xy: number[]): string {
  const n = xy.length;
  if (n < 2) return "";
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(xy[0])} ${f(xy[1])}`;
  if (n === 2) return d + ` l0.1 0`;
  for (let i = 2; i < n - 2; i += 2) {
    const mx = (xy[i] + xy[i + 2]) / 2;
    const my = (xy[i + 1] + xy[i + 3]) / 2;
    d += ` Q${f(xy[i])} ${f(xy[i + 1])} ${f(mx)} ${f(my)}`;
  }
  return d + ` L${f(xy[n - 2])} ${f(xy[n - 1])}`;
}

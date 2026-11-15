// Responsive layout for phones and large tablets (BOOX Note Air6 C, 13.3",
// used both landscape and portrait). Everything is derived from the live window
// size, so rotating the device re-lays out every screen.

import { useWindowDimensions, type ViewStyle } from "react-native";

export const TOUCH = 48; // minimum touch target (dp)

export interface Layout {
  width: number;
  height: number;
  landscape: boolean;
  tablet: boolean; // shortest side ≥ 600dp
  wide: boolean; // room for two panes side by side
  type: number; // type scale: 1 on phones, larger on tablets
  /** Centered column for forms/lists, capped so lines stay readable. */
  column: ViewStyle;
  /** Usable width inside `column` (after its horizontal padding). */
  columnInner: number;
  /** Columns for card grids (library, chapters). */
  gridCols: number;
}

const PAD = 20; // spacing(5)

export function computeLayout(width: number, height: number): Layout {
  const landscape = width > height;
  const tablet = Math.min(width, height) >= 600;
  const wide = width >= 900;
  const type = tablet ? 1.2 : 1;
  const maxColumn = tablet ? (landscape ? 1180 : 900) : width;
  const colWidth = Math.min(width, maxColumn);
  const columnInner = colWidth - PAD * 2;
  const gridCols = !tablet ? 1 : Math.max(1, Math.min(3, Math.floor(columnInner / 340)));
  return {
    width,
    height,
    landscape,
    tablet,
    wide,
    type,
    column: { width: "100%", maxWidth: maxColumn, alignSelf: "center", padding: PAD },
    columnInner,
    gridCols,
  };
}

export function useLayout(): Layout {
  const { width, height } = useWindowDimensions();
  return computeLayout(width, height);
}

/** Width of one cell in a grid of `cols` columns with `gap` spacing. */
export function cellWidth(inner: number, cols: number, gap: number): number {
  return Math.floor((inner - gap * (cols - 1)) / cols);
}

/** Static centered column for forms and lists (no type scaling needed). */
export const FORM_COLUMN: ViewStyle = {
  width: "100%",
  maxWidth: 820,
  alignSelf: "center",
  padding: PAD,
};

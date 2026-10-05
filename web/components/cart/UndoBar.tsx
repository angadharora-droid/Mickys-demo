"use client";

import { useEffect } from "react";
import { dismissUndo, undoRemove, useCart } from "@/lib/cart";

/** "Removed from cart · Undo" for a few seconds after a remove. */
export default function UndoBar() {
  const { removed } = useCart();
  useEffect(() => {
    if (!removed) return;
    const t = window.setTimeout(dismissUndo, 6000);
    return () => window.clearTimeout(t);
  }, [removed]);
  if (!removed) return null;
  return (
    <div className="cart-undo" role="status">
      <span>Removed from cart <b>{removed.line.name}{removed.line.size ? ` · ${removed.line.size}` : ""}</b></span>
      <button type="button" onClick={undoRemove}>Undo</button>
    </div>
  );
}

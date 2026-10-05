"use client";

import { useId, useState } from "react";
import type { DetailRow } from "@/data/productContent";

/**
 * Expandable rows. Only verified values reach the live site (see lib/products.ts);
 * in development, pending rows appear with a marker so the structure can be reviewed.
 */
export default function ProductDetails({ rows }: { rows: DetailRow[] }) {
  const base = useId();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="pdp-details" aria-labelledby={`${base}-t`}>
      <h2 id={`${base}-t`} className="display pdp-sec-h">Product details</h2>
      <div className="pdp-rows">
        {rows.map((r, i) => {
          const on = open === i;
          const pending = r.status !== "verified";
          return (
            <div key={r.label} className={`pdp-row${on ? " is-open" : ""}${pending ? " is-pending" : ""}`} data-source={r.source}>
              <h3 className="pdp-row-h">
                <button type="button" id={`${base}-b${i}`} aria-expanded={on} aria-controls={`${base}-p${i}`} onClick={() => setOpen(on ? null : i)}>
                  <span>{r.label}</span>
                  {pending && <span className="pdp-row-tag">Pending · hidden on live site</span>}
                  <span className="pdp-row-icon" aria-hidden="true" />
                </button>
              </h3>
              <div id={`${base}-p${i}`} role="region" aria-labelledby={`${base}-b${i}`} className="pdp-row-p">
                <div className="pdp-row-in">
                  <p>{r.value ?? "Awaiting verified data."}</p>
                  {r.table && (
                    <table className="pdp-table">
                      <thead><tr>{r.table[0].map((h, j) => <th key={j} scope="col">{h}</th>)}</tr></thead>
                      <tbody>{r.table.slice(1).map((row) => <tr key={row[0]}>{row.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>)}</tbody>
                    </table>
                  )}
                  {pending && r.source && <p className="pdp-row-src">Source: {r.source}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

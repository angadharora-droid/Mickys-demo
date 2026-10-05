import Link from "next/link";
import { COMPANY } from "@/data/company";
import type { Policy } from "@/data/legal";

/** One policy page. Until approved text exists it only says the policy is being finalised. */
export default function PolicyPage({ policy }: { policy: Policy }) {
  const dev = process.env.NODE_ENV !== "production";
  return (
    <article className="policy" aria-labelledby="policy-h">
      <h1 id="policy-h" className="display policy-h">{policy.title}</h1>
      {policy.body ? (
        <>
          {policy.effective && <p className="policy-meta">Effective {policy.effective}</p>}
          <div className="policy-body">{policy.body.map((p, i) => <p key={i}>{p}</p>)}</div>
        </>
      ) : (
        <>
          <p className="policy-lede">This policy is being finalised and will be published here soon.</p>
          <p className="policy-contact">
            Questions in the meantime? <Link href="/contact">Contact us</Link>
            {COMPANY.email && <> or email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></>}.
          </p>
          {dev && (
            <p className="policy-todo">
              TODO (development only): add the approved {policy.title} text in <code>data/legal.ts</code>. Do not publish placeholder legal terms.
            </p>
          )}
        </>
      )}
    </article>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/data/nav";


/** Desktop navigation; the link for the current page is highlighted. */
export default function NavLinks() {
  const path = usePathname();
  return (
    <ul className="hidden gap-8 lg:flex">
      {NAV.map((item) => {
        const active = item.href === path || path.startsWith(`${item.href}/`);
        return (
          <li key={item.label}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={active ? "nav-active" : "opacity-85 transition-colors hover:text-yellow hover:opacity-100"}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

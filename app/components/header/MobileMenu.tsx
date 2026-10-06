"use client";

import { useState } from "react";
import { CloseIcon, MenuIcon } from "./icons";
import NavLinks from "./NavLinks";
import type { NavLink } from "./types";

export default function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="p-2 text-neutral-800"
      >
        {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="absolute inset-x-0 top-full z-40 border-t border-neutral-200 bg-[var(--header-bg)] shadow-md"
        >
          <NavLinks
            links={links}
            onNavigate={() => setOpen(false)}
            className="flex flex-col px-4 py-2"
            linkClassName="block py-3"
          />
        </nav>
      )}
    </div>
  );
}

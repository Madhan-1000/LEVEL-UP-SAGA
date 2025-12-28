"use client";

import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

export function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-page-fade">
      {children}
    </div>
  );
}

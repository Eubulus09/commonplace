"use client";

import { usePathname } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();

  return <div key={pathname} className="route-progress" aria-hidden="true" />;
}

"use client";

import { scCheck } from "@/utils/sc";
import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useEffect } from "react";

export const ScContext = createContext<string | undefined>(undefined);

export default function ScProvider({
  children,
  loaded,
}: {
  children?: ReactNode;
  loaded: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    scCheck(loaded).then((isFine) => {
      if (!isFine) {
        alert(
          `Sc'tld is outdated, I'll redirect to settings. Please, update it.`,
        );
        router.replace(`/settings`);
      }
    });
  }, []);

  return <ScContext.Provider value={loaded}>{children}</ScContext.Provider>;
}

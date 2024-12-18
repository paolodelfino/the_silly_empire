"use client";

import { scCheck } from "@/utils/sc";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useEffect, useState } from "react";

type State = { tld: string; cdn: string; outdated: boolean };

export const ScContext = createContext<State | undefined>(undefined);

export default function ScProvider({
  children,
  loaded,
}: {
  children?: ReactNode;
  loaded: string;
}) {
  const [state, setState] = useState<State>({
    tld: loaded,
    cdn: `https://cdn.streamingcommunity.${loaded}`,
    outdated: false,
  });
  const router = useRouter();

  useEffect(() => {
    scCheck(loaded).then((isFine) => {
      setState((state) => ({ ...state, outdated: !isFine }));

      if (!isFine) {
        alert(
          `Sc'tld is outdated, I'll redirect to settings. Please, update it.`,
        );
        router.replace(`/settings`);
      }
    });
  }, []);

  return <ScContext.Provider value={state}>{children}</ScContext.Provider>;
}

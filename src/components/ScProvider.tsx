"use client";

import { Dictionary } from "@/utils/dictionary";
import { scCheck } from "@/utils/sc";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useEffect, useState } from "react";

type State = { tld: string; cdn: string; outdated: boolean };

export const ScContext = createContext<State | undefined>(undefined);

export default function ScProvider({
  children,
  loaded,
  dicionary,
}: {
  children?: ReactNode;
  loaded: string;
  dicionary: Pick<Dictionary, "scTldOutdated">;
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
        alert(dicionary.scTldOutdated);
        router.replace(`/settings`);
      }
    });
  }, []);

  return <ScContext.Provider value={state}>{children}</ScContext.Provider>;
}

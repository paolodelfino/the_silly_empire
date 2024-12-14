"use client";

import { getCookie, setCookie } from "cookies-next";
import { createContext, ReactNode, useEffect, useState } from "react";

export const ScreenPredictContext = createContext<
  ReturnType<typeof useScreenPredict> | undefined
>(undefined);

export default function ScreenPredictProvider({
  children,
  loaded,
}: {
  children?: ReactNode;
  loaded?: number | undefined;
}) {
  const screenPredict = useScreenPredict(loaded);
  return (
    <ScreenPredictContext.Provider value={screenPredict}>
      {children}
    </ScreenPredictContext.Provider>
  );
}

function useScreenPredict(loaded?: number | undefined) {
  const [value, setValue] = useState<number | undefined>(loaded);

  useEffect(() => {
    const cookie = getCookie("screenPredict");
    const current = window.screen.width;

    if (cookie === undefined) {
      setValue(current);
      setCookie("screenPredict", current);
    } else {
      const cookieV = parseFloat(cookie as string);
      if (cookieV !== current) setCookie("screenPredict", current);
    }
  }, []);

  return value;
}

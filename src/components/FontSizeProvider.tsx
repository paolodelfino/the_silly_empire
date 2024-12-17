"use client";

import { getDefaultFontSize } from "@/utils/css";
import { getCookie, setCookie } from "cookies-next";
import { createContext, ReactNode, useEffect, useState } from "react";

export const FontSizeContext = createContext<
  ReturnType<typeof useFontSize> | undefined
>(undefined);

// TODO: I could also allow for loaded value from server
export default function FontSizeProvider({
  children,
}: {
  children?: ReactNode;
}) {
  const fontSize = useFontSize();
  return (
    <FontSizeContext.Provider value={fontSize}>
      {children}
    </FontSizeContext.Provider>
  );
}

function useFontSize() {
  const [value, setValue] = useState<number | undefined>();
  const [original, setOriginal] = useState<number | undefined>();

  useEffect(() => {
    const def = getDefaultFontSize();
    setOriginal(def);

    const cookie = getCookie("fontSize");
    setValue(cookie !== undefined ? parseFloat(cookie as string) : def);
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = value + "px";
  }, [value]);

  return {
    value,
    setValue: (value: number) => {
      setValue(value);
      setCookie("fontSize", value, {
        maxAge: 31536000,
        secure: true,
        httpOnly: false,
        sameSite: "lax",
      });
    },
    original,
  };
}

"use client";

import { createContext, ReactNode } from "react";

export const LanguageContext = createContext<string | undefined>(undefined);

export default function LanguageProvider({
  children,
  loaded,
}: {
  children?: ReactNode;
  loaded: string;
}) {
  return (
    <LanguageContext.Provider value={loaded}>
      {children}
    </LanguageContext.Provider>
  );
}

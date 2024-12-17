"use client";

import { SuperTitle } from "@/components/ui/SuperTitle";
import Text from "@/components/ui/Text";
import { cn } from "@/utils/cn";
import { Dictionary } from "@/utils/dictionary";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { UAParser } from "ua-parser-js";

export default function InstallPrompt({
  dictionary,
}: {
  dictionary: Dictionary["InstallPrompt"];
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const result = UAParser();
    if (
      result.device.type === "mobile" &&
      !window.matchMedia("(display-mode: standalone)").matches
    )
      setShow(true);
  }, []);

  if (show && process.env.NODE_ENV !== "development")
    return ReactDOM.createPortal(
      <div
        className={cn(
          "fixed left-0 top-0",
          "h-screen w-full pl-safe-left pr-safe-right",
          "flex items-center justify-center",
          "bg-neutral-600/40",
          "z-20",
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-2",
            "4xl:py-4 4xl:px-8 4xl:rounded max-h-[75vh] w-full max-w-4xl overflow-y-scroll",
            "bg-neutral-700",
          )}
        >
          <SuperTitle>{dictionary.title}</SuperTitle>

          <Text>{dictionary.detectMessage}</Text>

          <Text>{dictionary.installMessage}</Text>
        </div>
      </div>,
      document.body,
    );
}

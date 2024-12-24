"use client";

import { LanguageContext } from "@/components/LanguageProvider";
import { ScContext } from "@/components/ScProvider";
import { LinkButton } from "@/components/ui/Button";
import { ContinueWatchingTitle } from "@/db/db";
import { cn } from "@/utils/cn";
import { useContext } from "react";

export default function TitleCard({
  data,
  id,
}: {
  id?: string;
  data: {
    id: number;
    poster: string;
  };
}) {
  const sc = useContext(ScContext);
  const locale = useContext(LanguageContext);

  return (
    <LinkButton
      href={`/${locale!}/${data.id}`}
      className="aspect-auto h-fit w-32 shrink-0 overflow-hidden sm:w-auto [&.hover]:bg-black"
    >
      {({ className }) => (
        <img
          alt=""
          id={id}
          className={cn(className)}
          src={`${sc!.cdn}/images/${data.poster}`}
        />
      )}
    </LinkButton>
  );
}

export function TitleCardProgress({
  data,
  id,
}: {
  id?: string;
  data: ContinueWatchingTitle;
}) {
  const sc = useContext(ScContext);
  const locale = useContext(LanguageContext);

  return (
    <LinkButton
      href={`/${locale!}/${data.titleId}`}
      className="aspect-auto h-fit w-32 shrink-0 overflow-hidden sm:w-auto [&.hover]:bg-black"
    >
      {({ className }) => (
        <div className={cn(className, "relative")}>
          <img alt="" id={id} src={`${sc!.cdn}/images/${data.poster}`} />

          <div className="absolute bottom-0 left-0 h-1 w-full bg-black/40">
            <div
              className="h-full bg-red-500"
              style={{ width: `${(data.currentTime / data.maxTime) * 100}%` }}
            />
          </div>

          {data.episodeNumber !== undefined && (
            <p
              className="absolute bottom-2 right-2 rounded bg-black/40 px-2 !text-white"
              style={{ textShadow: "1px 1px 1px #000" }}
            >{`S${data.seasonNumber!} E${data.episodeNumber!}`}</p>
          )}
        </div>
      )}
    </LinkButton>
  );
}

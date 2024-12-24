"use client";

import {
  CbiDisneyPlus,
  CibImdb,
  LogosNetflix,
  SimpleIconsAppletv,
  SimpleIconsPrimevideo,
} from "@/components/icons";
import { LanguageContext } from "@/components/LanguageProvider";
import Player from "@/components/Player";
import { ScContext } from "@/components/ScProvider";
import TitleCard from "@/components/TitleCard";
import { Button, LinkButton } from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import Title from "@/components/ui/Title";
import useQueryFetchTitle from "@/stores/queries/useQueryFetchTitle";
import { cn } from "@/utils/cn";
import { Dictionary } from "@/utils/dictionary";
import { formValuesToString } from "@/utils/url.client";
import { useContext, useEffect, useMemo, useState } from "react";

export default function Page({
  params,
  dictionary,
}: {
  params: { id: number };
  dictionary: {
    genres: Record<string, string>;
  } & Pick<
    Dictionary,
    "loadingNoCache" | "fetching" | "titleStatus" | "titlePage" | "player"
  >;
}) {
  const sc = useContext(ScContext);
  const locale = useContext(LanguageContext);
  const query = useQueryFetchTitle();
  const [playerOpen, setPlayerOpen] = useState(false);

  useEffect(() => {
    query.active();

    if (params.id !== query.meta.lastId) {
      query.reset();
      query.active();
      query.setMeta({ lastId: params.id });
      query.fetch({ id: params.id });
    }

    return () => {
      query.inactive();
    };
  }, []);

  const canPlay = useMemo(
    () =>
      query.data !== undefined &&
      ((query.data.type === "movie" && query.data.scws_id !== null) ||
        (query.data.type === "tv" &&
          query.data.seasons.length > 0 &&
          query.data.seasons[0].episodes_count > 0)),
    [query.data],
  );

  const upcoming = useMemo(() => {
    if (query.data !== undefined) {
      if (query.data.type === "movie") {
        if (!canPlay)
          return (
            <Text>
              {query.data.release_date !== null
                ? dictionary.titlePage.comingOn1 + query.data.release_date
                : dictionary.titlePage.notYetAvailable1}
            </Text>
          );
      } else {
        const upcomingSeasons = query.data.seasons.filter(
          (it) => it.episodes_count <= 0,
        );
        if (upcomingSeasons.length > 0)
          return upcomingSeasons.map((it) => (
            <Text
              key={it.number}
            >{`${dictionary.titlePage.season} ${it.number} ${it.release_date !== null ? `${dictionary.titlePage.comingOn2} ${it.release_date}` : dictionary.titlePage.notYetAvailable2}`}</Text>
          ));
        else if (!canPlay)
          return <Text>{dictionary.titlePage.notYetAvailable1}</Text>;
      }
    }
  }, [canPlay, query.data]);

  if (query.data === undefined) return dictionary.loadingNoCache;
  if (query.isFetching) return dictionary.fetching;

  return (
    <div className="w-full">
      <div className="1600px:mr-4">
        <div className="relative flex h-auto w-full overflow-hidden rounded">
          <img
            src={`${sc!.cdn}/images/${query.data.background}`}
            className="w-full"
          />

          <div className="absolute bottom-0 left-0 flex h-full w-full items-end justify-between gap-4 bg-gradient-to-t from-neutral-900 p-2 sm:flex-col sm:items-start sm:justify-end sm:p-10">
            {query.data.logo !== undefined ? (
              <img
                src={`${sc!.cdn}/images/${query.data.logo}`}
                className="h-auto w-32 sm:w-48 md:w-56 1600px:w-fit"
              />
            ) : (
              <span />
            )}

            <div className="flex flex-col items-end sm:items-start">
              {upcoming}

              {canPlay && (
                <Button
                  action={() => setPlayerOpen(true)}
                  className="w-fit border-b border-red-900 bg-red-700 px-4"
                >
                  {dictionary.titlePage.play}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pl-safe-left pr-safe-right">
        <Title>{dictionary.titlePage.services}</Title>

        <div className="flex flex-wrap items-center gap-5">
          {query.data.netflix_id !== null && (
            <LinkButton
              className="[&.hover]:bg-transparent"
              href={`https://www.netflix.com/title/${query.data.netflix_id}`}
              external
            >
              {({ className }) => (
                <LogosNetflix className={cn(className, "size-20")} />
              )}
            </LinkButton>
          )}
          {query.data.apple_id !== null && (
            <LinkButton
              className="[&.hover]:bg-transparent"
              href={`https://tv.apple.com/${query.data.type === "movie" ? "movie" : "show"}/${query.data.apple_id}`}
              external
            >
              {({ className }) => (
                <SimpleIconsAppletv className={cn(className, "size-16")} />
              )}
            </LinkButton>
          )}
          {query.data.prime_id !== null && (
            <LinkButton
              className="[&.hover]:bg-transparent"
              href={`https://primevideo.com/detail/${query.data.prime_id}`}
              external
            >
              {({ className }) => (
                <SimpleIconsPrimevideo
                  className={cn(className, "size-20 text-sky-500")}
                />
              )}
            </LinkButton>
          )}
          {query.data.disney_id !== null && (
            <LinkButton
              className="[&.hover]:bg-transparent"
              href={`https://www.disneyplus.com/${locale === "en" ? "en-it" : "it-it"}/${query.data.type === "movie" ? "movies" : "series"}/dummy/${query.data.disney_id}`}
              external
            >
              {({ className }) => (
                <CbiDisneyPlus
                  className={cn(className, "size-14 text-purple-500")}
                />
              )}
            </LinkButton>
          )}
          {query.data.imdb_id !== null && (
            <LinkButton
              className="[&.hover]:bg-transparent"
              href={`https://imdb.com/title/${query.data.imdb_id}`}
              external
            >
              {({ className }) => (
                <CibImdb className={cn(className, "size-16 text-yellow-500")} />
              )}
            </LinkButton>
          )}
        </div>

        <Title>{dictionary.titlePage.status}</Title>

        <Text>{dictionary.titleStatus[query.data.status]}</Text>

        <Title>{dictionary.titlePage.genres}</Title>

        <div className="flex flex-wrap items-center gap-1">
          {query.data.genres.map((genre) => {
            return (
              <LinkButton
                key={genre}
                href={`/${locale}/query/${formValuesToString({ genre: genre })}`}
              >{`${dictionary.genres[genre!]}`}</LinkButton>
            );
          })}
        </div>

        <Title>{dictionary.titlePage.keywords}</Title>

        <div className="flex flex-wrap items-center gap-1">
          {query.data.keywords.map((keyword) => {
            return (
              <LinkButton
                key={keyword}
                href={`/${locale}/query/${formValuesToString({ search: keyword })}`}
                className="[&.hover]:scale-[1.01]"
              >{`${keyword}`}</LinkButton>
            );
          })}
        </div>

        <Title>{dictionary.titlePage.related}</Title>

        <div className="flex h-fit items-center gap-5 overflow-x-scroll pb-4 pl-[calc(0.75rem+env(safe-area-inset-left))] pr-[calc(0.75rem+env(safe-area-inset-right))] pt-3">
          {query.data.related.map((it) => (
            <TitleCard data={it} key={it.id} />
          ))}
        </div>

        {playerOpen && (
          <Player
            data={query.data}
            close={() => setPlayerOpen(false)}
            dictionary={{
              player: dictionary.player,
              fetching: dictionary.fetching,
              loadingNoCache: dictionary.loadingNoCache,
            }}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import FieldSelect, { fieldSelect } from "@/components/form_ui/FieldSelect";
import {
  CbiDisneyPlus,
  CibImdb,
  LogosNetflix,
  SimpleIconsAppletv,
  SimpleIconsPrimevideo,
} from "@/components/icons";
import { LanguageContext } from "@/components/LanguageProvider";
import { ScContext } from "@/components/ScProvider";
import TitleCard from "@/components/title/TitleCard";
import { Button, LinkButton } from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import Title from "@/components/ui/Title";
import useQueryFetchSeason from "@/stores/queries/useQueryFetchSeason";
import useQueryFetchTitle from "@/stores/queries/useQueryFetchTitle";
import { cn } from "@/utils/cn";
import { Dictionary } from "@/utils/dictionary";
import { formValuesToString } from "@/utils/url.client";
import { useContext, useEffect } from "react";

export default function Page({
  params,
  dictionary,
}: {
  params: { id: number };
  dictionary: {
    genres: Record<string, string>;
  } & Pick<
    Dictionary,
    "loadingNoCache" | "fetching" | "titleStatus" | "titlePage"
  >;
}) {
  const sc = useContext(ScContext);
  const locale = useContext(LanguageContext);
  const query = useQueryFetchTitle();
  const season = useQueryFetchSeason();

  useEffect(() => {
    query.active();
    season.active();

    if (params.id !== query.meta.lastId) {
      query.reset();
      season.reset();
      query.active();
      season.active();
      query.setMeta({ lastId: params.id });
      season.setMeta({ season: undefined });

      query.fetch({ id: params.id }).then((data) => {
        if (data.type === "tv")
          season.setMeta({
            season: fieldSelect({
              items:
                data.seasons.length > 0
                  ? data.seasons.map((it) => ({
                      content: `Season ${it.number} (${it.episodes_count})`,
                      id: it.number.toString(),
                    }))
                  : [{ content: "Not yet released", id: "not_yet_released" }],
            }),
          });
      });

      return () => {
        query.inactive();
        season.inactive();
      };
    }
  }, [params.id]);

  useEffect(() => {
    if (
      season.meta.season?.value !== undefined &&
      season.meta.season.value !== "not_yet_released" &&
      season.isActive &&
      season.meta.season.value !== season.meta.lastSeason
    ) {
      season.setMeta({ lastSeason: season.meta.season.value });
      season.fetch({
        number: Number(season.meta.season.value!),
        id: query.data!.id,
      });
    }
  }, [season.meta.season?.value]);

  if (query.data === undefined) return "loading no cache";
  if (query.isFetching) return "fetching...";

  return (
    <div className="w-full">
      <div className="1600px:mr-4">
        <div className="relative flex h-auto w-full overflow-hidden rounded border-b border-white">
          <img
            src={`${sc!.cdn}/images/${query.data.background}`}
            className="w-full"
          />

          {query.data.logo !== undefined && (
            <div className="absolute bottom-0 left-0 flex w-full flex-col items-start gap-4 bg-gradient-to-t from-neutral-700 p-10">
              <img
                src={`${sc!.cdn}/images/${query.data.logo}`}
                className="h-auto w-32 sm:w-48 md:w-56 1600px:w-fit"
              />

              <Button className="w-fit border-b border-red-900 bg-red-700 px-4">
                Play
              </Button>
            </div>
          )}
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
                href={`/${locale}/fuzzy/${formValuesToString({ search: keyword })}`}
                className="[&.hover]:scale-[1.01]"
              >{`${keyword}`}</LinkButton>
            );
          })}
        </div>

        <Title>Related</Title>

        <div className="flex h-fit items-center gap-5 overflow-x-scroll pb-4 pl-[calc(0.75rem+env(safe-area-inset-left))] pr-[calc(0.75rem+env(safe-area-inset-right))] pt-3">
          {query.data.related.map((it) => (
            <TitleCard data={it} key={it.id} />
          ))}
        </div>

        {/* {season.meta.season !== undefined && (
          <FieldSelect
            setMeta={(value) => {
              const a = { ...season.meta.season! };
              a.meta = { ...a.meta, ...value };
              season.setMeta({ season: a });
            }}
            setValue={(value) => {
              const a = { ...season.meta.season! };
              a.value = value;
              season.setMeta({ season: a });
            }}
            meta={season.meta.season.meta}
            error={season.meta.season.error}
            disabled={false}
            placeholder={"Season"}
          />
        )}

        {season.isFetching && season.data === undefined && (
          <p>loading no cache</p>
        )}
        {season.isFetching && season.data !== undefined && <p>fetching...</p>}
        {!season.isFetching &&
          season.data !== undefined &&
          season.data.episodes.length <= 0 && (
            <Text>Coming on {season.data.release_date}</Text>
          )}
        {!season.isFetching &&
          season.data !== undefined &&
          season.data.episodes.length > 0 && (
            <div>
              {season.data.episodes.map((it) => (
                <div key={it.id}>{it.number}</div>
              ))}
            </div>
          )} */}
      </div>
    </div>
  );
}

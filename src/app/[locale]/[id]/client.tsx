"use client";

import FieldSelect, { fieldSelect } from "@/components/form_ui/FieldSelect";
import { LanguageContext } from "@/components/LanguageProvider";
import { ScContext } from "@/components/ScProvider";
import { Button, LinkButton } from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import useQueryFetchSeason from "@/stores/queries/useQueryFetchSeason";
import useQueryFetchTitle from "@/stores/queries/useQueryFetchTitle";
import { cn } from "@/utils/cn";
import { useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

export default function Page({ params }: { params: { id: number } }) {
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

  const [keywordsOpen, setKeywordsOpen] = useState(false);
  const keywordsTouchDown = useRef(false);

  if (query.data === undefined) return "loading no cache";
  if (query.isFetching) return "fetching...";

  return (
    <div className="w-full">
      <div className="relative flex h-auto w-full">
        <img
          src={`${sc!.cdn}/images/${query.data.background}`}
          className="w-full rounded-t"
        />
        {query.data.logo !== undefined && (
          <div className="absolute bottom-10 left-10">
            <img
              src={`${sc!.cdn}/images/${query.data.logo}`}
              className="h-auto w-32 sm:w-48 md:w-56 1600px:w-full"
            />
          </div>
        )}
      </div>

      <div className="pl-safe-left pr-safe-right">
        <div className="flex flex-wrap gap-2 p-4">
          <Button className="rounded-full px-3">{query.data.status}</Button>
          <Button
            className="rounded-full px-3"
            action={() => setKeywordsOpen((state) => !state)}
          >
            Keywords
          </Button>
          {keywordsOpen &&
            ReactDOM.createPortal(
              <div
                className={cn(
                  "fixed left-0 top-0",
                  "h-screen w-full pl-safe-left pr-safe-right",
                  "flex items-center justify-center",
                  "bg-neutral-600/40",
                  "z-20",
                )}
                onPointerDown={(e) => {
                  if (e.target === e.currentTarget) {
                    if (e.pointerType === "mouse") setKeywordsOpen(false);
                    else keywordsTouchDown.current = true;
                  }
                }}
                onPointerUp={(e) => {
                  if (e.target === e.currentTarget) {
                    if (
                      e.pointerType === "touch" &&
                      keywordsTouchDown.current === true
                    )
                      setKeywordsOpen(false);
                  }
                }}
              >
                <div
                  className={cn(
                    "flex flex-wrap gap-2",
                    "max-h-[75vh] w-full max-w-4xl overflow-y-scroll 4xl:rounded 4xl:px-8 4xl:py-4",
                    "bg-neutral-700",
                  )}
                >
                  {query.data.keywords.map((it) => (
                    <LinkButton key={it.name}>{it.name}</LinkButton>
                  ))}
                </div>
              </div>,
              document.body,
            )}
          {query.data.imdb_id !== null && (
            <Button className="rounded-full px-3">IMDB</Button>
          )}
          {query.data.apple_id !== null && (
            <Button className="rounded-full px-3">Apple TV</Button>
          )}
          {query.data.disney_id !== null && (
            <Button className="rounded-full px-3">Disney+</Button>
          )}
          {query.data.prime_id !== null && (
            <Button className="rounded-full px-3">Prime Video</Button>
          )}
          {query.data.netflix_id !== null && (
            <Button className="rounded-full px-3">Netflix</Button>
          )}
          {query.data.now_id !== null && (
            <Button className="rounded-full px-3">Now TV</Button>
          )}
          {query.data.genres.map((genre) => {
            // TODO: Qui è un numero...
            return (
              <Button className="rounded-full px-3" key={genre.id}>
                {genre.id!.toString()}
              </Button>
            );
          })}
        </div>

        {season.meta.season !== undefined && (
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
          )}
      </div>
    </div>
  );
}

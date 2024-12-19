"use client";

import FieldSelect, { fieldSelect } from "@/components/form_ui/FieldSelect";
import { LanguageContext } from "@/components/LanguageProvider";
import { ScContext } from "@/components/ScProvider";
import { Button, LinkButton } from "@/components/ui/Button";
import { SuperTitle } from "@/components/ui/SuperTitle";
import Text from "@/components/ui/Text";
import Title from "@/components/ui/Title";
import useFormQuery__EntryDetails from "@/stores/forms/useFormQuery__EntryDetails";
import useQueryEntry from "@/stores/queries/useQueryEntry";
import useQuerySeason from "@/stores/queries/useQuerySeason";
import { cn } from "@/utils/cn";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";

export default function Page({ params }: { params: { id: number } }) {
  const sc = useContext(ScContext);
  const query = useQueryEntry();
  const form = useFormQuery__EntryDetails();
  const season = useQuerySeason();
  const locale = useContext(LanguageContext);

  useEffect(() => {
    query.active();
    season.active();
    return () => {
      query.inactive();
      season.inactive();
    };
  }, []);

  useEffect(() => {
    if (params.id !== form.meta.lastId) {
      form.setFormMeta({ lastId: params.id });
      query.fetch({ id: params.id }).then((data) => {
        if (data.type === "tv")
          form.setFormMeta({
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
    }
  }, [params.id]);

  const background = useMemo(
    () => query.data?.images.find((it) => it.type === "background"),
    [query.data],
  );
  const logo = useMemo(
    () => query.data?.images.find((it) => it.type === "logo"),
    [query.data],
  );

  const [textOpen, setTextOpen] = useState(false);
  const textTouchDown = useRef(false);

  const [nameOpen, setNameOpen] = useState(false);
  const nameTouchDown = useRef(false);

  const [keywordsOpen, setKeywordsOpen] = useState(false);
  const keywordsTouchDown = useRef(false);

  if (query.data === undefined) return "loading no cache";
  if (query.isFetching) return "fetching...";

  return (
    <div className="w-full">
      <div className="relative flex h-auto w-full">
        <img
          src={`${sc!.cdn}/images/${background!.filename}`}
          className="w-full rounded-t"
        />
        {logo !== undefined ? (
          <div className="absolute bottom-10 left-10">
            <img
              src={`${sc!.cdn}/images/${logo.filename}`}
              className="h-auto w-32 sm:w-48 md:w-56 1600px:w-full"
            />
          </div>
        ) : (
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-10">
            <SuperTitle>{query.data.original_name}</SuperTitle>
          </div>
        )}
      </div>

      <div className="pl-safe-left pr-safe-right">
        <div className="flex flex-wrap gap-2 p-4">
          <Button
            className="rounded-full px-3"
            action={() => setNameOpen((state) => !state)}
          >
            Name
          </Button>
          {nameOpen &&
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
                    if (e.pointerType === "mouse") setNameOpen(false);
                    else nameTouchDown.current = true;
                  }
                }}
                onPointerUp={(e) => {
                  if (e.target === e.currentTarget) {
                    if (
                      e.pointerType === "touch" &&
                      nameTouchDown.current === true
                    )
                      setNameOpen(false);
                  }
                }}
              >
                <div
                  className={cn(
                    "flex flex-col gap-2",
                    "max-h-[75vh] w-full max-w-4xl overflow-y-scroll 4xl:rounded 4xl:px-8 4xl:py-4",
                    "bg-neutral-700",
                  )}
                >
                  {locale === "it" && (
                    <React.Fragment>
                      <Title>Name</Title>
                      <Text>{query.data.name}</Text>
                    </React.Fragment>
                  )}

                  <Title>Original name</Title>
                  <Text>{query.data.original_name}</Text>
                </div>
              </div>,
              document.body,
            )}
          <Button className="rounded-full px-3">{query.data.status}</Button>
          {query.data.runtime !== null && (
            <Button className="rounded-full px-3">{`${query.data.runtime}min`}</Button>
          )}
          {query.data.release_date !== null && (
            <Button className="rounded-full px-3">{`${query.data.release_date.split("-")[0]}`}</Button>
          )}
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
                    "flex gap-2",
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
          <Button className="rounded-full px-3">{query.data.quality}</Button>
        </div>

        {query.data.plot !== "." && (
          <Button
            TextProps={{
              className: "line-clamp-[7] text-start text-neutral-300",
            }}
            className="m-2 1600px:ml-0 [&.hover]:scale-[1.01]"
            anim={false}
            action={() => setTextOpen((state) => !state)}
          >
            {query.data.plot}
          </Button>
        )}
        {textOpen &&
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
                  if (e.pointerType === "mouse") setTextOpen(false);
                  else textTouchDown.current = true;
                }
              }}
              onPointerUp={(e) => {
                if (e.target === e.currentTarget) {
                  if (
                    e.pointerType === "touch" &&
                    textTouchDown.current === true
                  )
                    setTextOpen(false);
                }
              }}
            >
              <div
                className={cn(
                  "flex flex-col gap-2",
                  "max-h-[75vh] w-full max-w-4xl overflow-y-scroll 4xl:rounded 4xl:px-8 4xl:py-4",
                  "bg-neutral-700",
                )}
              >
                <Text>{query.data.plot}</Text>
              </div>
            </div>,
            document.body,
          )}

        {form.meta.season !== undefined && (
          <FieldSelect
            setMeta={(value) => {
              const a = { ...form.meta.season! };
              a.meta = { ...a.meta, ...value };
              form.setFormMeta({ season: a });
            }}
            setValue={(value) => {
              if (value !== undefined && value !== "not_yet_released")
                season.fetch({ number: Number(value!), id: query.data!.id });
              const a = { ...form.meta.season! };
              a.value = value;
              form.setFormMeta({ season: a });
            }}
            meta={form.meta.season.meta}
            error={form.meta.season.error}
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
                <div key={it.id}>{it.name}</div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

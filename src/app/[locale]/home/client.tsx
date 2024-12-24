"use client";

import TitleCard, { TitleCardProgress } from "@/components/TitleCard";
import { ColoredSuperTitle } from "@/components/ui/SuperTitle";
import Title from "@/components/ui/Title";
import { db } from "@/db/db";
import useInfiniteQuery from "@/hooks/useInfiniteQuery";
import useQueryFeatured from "@/stores/queries/useQueryFeatured";
import useQueryUpcoming from "@/stores/queries/useQueryUpcoming";
import { Dictionary } from "@/utils/dictionary";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useMemo } from "react";

export default function Page({
  dictionary,
}: {
  dictionary: Pick<Dictionary, "home" | "loadingNoCache" | "fetching">;
}) {
  const featured = useQueryFeatured();

  useEffect(() => {
    featured.active();
    if (featured.data === undefined) featured.fetch();
    return () => featured.inactive();
  }, []);

  const featuredSlider = useMemo(() => {
    if (featured.data === undefined) return <p>{dictionary.loadingNoCache}</p>;
    else
      return (
        <div className="flex h-fit items-center gap-5 overflow-x-scroll pb-4 pl-[calc(0.75rem+env(safe-area-inset-left))] pr-[calc(0.75rem+env(safe-area-inset-right))] pt-3">
          {featured.data.map((it) => (
            <TitleCard data={it} key={it.id} />
          ))}

          {featured.isFetching && <p>{dictionary.fetching}</p>}
        </div>
      );
  }, [featured, dictionary]);

  const upcoming = useQueryUpcoming();

  const upcoming_id = useInfiniteQuery({
    active: upcoming.active,
    callback() {
      upcoming.fetch();
    },
    data: upcoming.data,
    fetchIfNoData: true,
    getId(item) {
      return item.id.toString();
    },
    inactive: upcoming.inactive,
    nextOffset: upcoming.nextOffset,
  });

  const upcomingSlider = useMemo(() => {
    if (upcoming.data === undefined) return <p>{dictionary.loadingNoCache}</p>;
    else if (upcoming.data.length <= 0) return null;
    else
      return (
        <div className="flex h-fit gap-5 overflow-x-scroll pb-4 pl-[calc(0.75rem+env(safe-area-inset-left))] pr-[calc(0.75rem+env(safe-area-inset-right))] pt-3">
          {upcoming.data.map((it) => (
            <TitleCard
              id={`${upcoming_id}_${it.id}`}
              data={it}
              key={`${it.id}`}
            />
          ))}

          {upcoming.isFetching && <p>{dictionary.fetching}</p>}
        </div>
      );
  }, [upcoming, dictionary]);

  const continueWatching = useLiveQuery(() => {
    return db.continueWatchingTitle.orderBy("lastUpdated").reverse().toArray();
  });

  const continueWatchingSlider = useMemo(() => {
    if (continueWatching === undefined) return <p>{dictionary.fetching}</p>;
    else if (continueWatching.length <= 0) return null;
    else
      return (
        <div className="flex h-fit gap-5 overflow-x-scroll pb-4 pl-[calc(0.75rem+env(safe-area-inset-left))] pr-[calc(0.75rem+env(safe-area-inset-right))] pt-3">
          {continueWatching.map((it) => (
            <TitleCardProgress data={it} key={it.titleId} />
          ))}
        </div>
      );
  }, [continueWatching, dictionary]);

  return (
    <div className="w-full">
      <ColoredSuperTitle className="bg-white text-black">
        {dictionary.home.title}
      </ColoredSuperTitle>

      {continueWatchingSlider !== null && (
        <React.Fragment>
          <Title>{dictionary.home.continueWatching}</Title>
          {continueWatchingSlider}
        </React.Fragment>
      )}

      <Title>{dictionary.home.featured}</Title>
      {featuredSlider}

      {upcomingSlider !== null && (
        <React.Fragment>
          <Title>{dictionary.home.upcoming}</Title>
          {upcomingSlider}
        </React.Fragment>
      )}
    </div>
  );
}

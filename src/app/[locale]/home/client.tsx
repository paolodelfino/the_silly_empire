"use client";

import TitleCard from "@/components/title/TitleCard";
import { ColoredSuperTitle } from "@/components/ui/SuperTitle";
import Title from "@/components/ui/Title";
import useInfiniteQuery from "@/hooks/useInfiniteQuery";
import useQueryFeatured from "@/stores/queries/useQueryFeatured";
import useQueryUpcoming from "@/stores/queries/useQueryUpcoming";
import { Dictionary } from "@/utils/dictionary";
import { useEffect, useMemo } from "react";

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

  return (
    <div className="w-full">
      <ColoredSuperTitle className="bg-white text-black">
        {dictionary.home.title}
      </ColoredSuperTitle>

      <Title>{dictionary.home.featured}</Title>
      {featuredSlider}

      <Title>{dictionary.home.upcoming}</Title>
      {upcomingSlider}
    </div>
  );
}

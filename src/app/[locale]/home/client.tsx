"use client";

import UIEntry__Simple from "@/components/db_ui/UIEntry__Simple";
import { ColoredSuperTitle } from "@/components/ui/SuperTitle";
import Title from "@/components/ui/Title";
import useInfiniteQuery from "@/hooks/useInfiniteQuery";
import useQueryEntry__Featured from "@/stores/queries/useQueryEntry__Featured";
import useQueryEntry__Upcoming from "@/stores/queries/useQueryEntry__Upcoming";
import { Dictionary } from "@/utils/dictionary";
import { useEffect } from "react";

export default function Page({
  dictionary,
}: {
  dictionary: Pick<Dictionary, "home" | "loadingNoCache" | "fetching">;
}) {
  const upcoming = useQueryEntry__Upcoming();
  const id = useInfiniteQuery({
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

  const featured = useQueryEntry__Featured();
  useEffect(() => {
    featured.active();
    if (featured.data === undefined) featured.fetch();
    return () => featured.inactive();
  }, []);

  return (
    <div className="w-full">
      <ColoredSuperTitle className="bg-white text-black">
        {dictionary.home.title}
      </ColoredSuperTitle>

      <Title>{dictionary.home.featured}</Title>
      {featured.data === undefined ? (
        <p>{dictionary.loadingNoCache}</p>
      ) : (
        <div className="flex h-fit gap-5 overflow-x-scroll pb-4 pl-[calc(0.75rem+env(safe-area-inset-left))] pr-[calc(0.75rem+env(safe-area-inset-right))] pt-3">
          {featured.data.map((it) => (
            <UIEntry__Simple
              id={`${id}_${it.slug}-${it.id}`}
              data={it}
              key={`${it.slug}-${it.id}`}
            />
          ))}

          {featured.isFetching && <p>{dictionary.fetching}</p>}
        </div>
      )}

      <Title>{dictionary.home.upcoming}</Title>
      {upcoming.data === undefined ? (
        <p>{dictionary.loadingNoCache}</p>
      ) : (
        <div className="flex h-fit gap-5 overflow-x-scroll pb-4 pl-[calc(0.75rem+env(safe-area-inset-left))] pr-[calc(0.75rem+env(safe-area-inset-right))] pt-3">
          {upcoming.data.map((it) => (
            <UIEntry__Simple
              id={`${id}_${it.slug}-${it.id}`}
              data={it}
              key={`${it.slug}-${it.id}`}
            />
          ))}

          {upcoming.isFetching && <p>{dictionary.fetching}</p>}
        </div>
      )}
    </div>
  );
}

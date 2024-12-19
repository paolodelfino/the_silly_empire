"use client";

import TitleCard from "@/components/title/TitleCard";
import useInfiniteQuery from "@/hooks/useInfiniteQuery";
import schemaQueryTitle from "@/schemas/schemaQueryTitle";
import useQueryTitle from "@/stores/queries/useQueryTitle";
import { Dictionary } from "@/utils/dictionary";
import { formValuesFromString } from "@/utils/url.client";
import { useEffect, useMemo } from "react";

export default function Page(props: {
  values: string;
  dictionary: Pick<Dictionary, "fetching" | "loadingNoCache">;
}) {
  const values = useMemo(
    () => schemaQueryTitle.parse(formValuesFromString(props.values)),
    [props.values],
  );

  const query = useQueryTitle();

  useEffect(() => {
    if (props.values !== query.meta.lastValues) {
      query.setMeta({ lastValues: props.values });

      query.reset();
      query.active();
      query.fetch(values);
    }
  }, [values]);

  const id = useInfiniteQuery({
    active: query.active,
    callback: () => query.fetch(query.lastArgs![0]),
    data: query.data,
    fetchIfNoData: false,
    getId(item) {
      return item.id.toString();
    },
    inactive: query.inactive,
    nextOffset: query.nextOffset,
  });

  if (query.data === undefined) return props.dictionary.loadingNoCache;

  return (
    <div className="flex h-fit gap-5 items-center overflow-x-scroll pb-4 pl-[calc(0.75rem+env(safe-area-inset-left))] pr-[calc(0.75rem+env(safe-area-inset-right))] pt-3">
      {query.data.map((it) => (
        <TitleCard id={`${id}_${it.id}`} data={it} key={it.id.toString()} />
      ))}

      {query.isFetching && <p>{props.dictionary.fetching}</p>}
    </div>
  );
}

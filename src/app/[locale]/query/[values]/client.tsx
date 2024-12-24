"use client";

import TitleCard from "@/components/TitleCard";
import { ColoredSuperTitle } from "@/components/ui/SuperTitle";
import Title from "@/components/ui/Title";
import useInfiniteQuery from "@/hooks/useInfiniteQuery";
import schemaQueryTitle from "@/schemas/schemaQueryTitle";
import useQueryFuzzyTitle from "@/stores/queries/useQueryFuzzyTitle";
import useQueryTitle from "@/stores/queries/useQueryTitle";
import { Dictionary } from "@/utils/dictionary";
import { formValuesFromString } from "@/utils/url.client";
import React, { useEffect, useMemo } from "react";

export default function Page(props: {
  values: string;
  dictionary: Pick<
    Dictionary,
    "fetching" | "loadingNoCache" | "noResult" | "queryResults"
  > & {
    title: Dictionary["toolbar"]["query"];
  };
}) {
  const values = useMemo(
    () => schemaQueryTitle.parse(formValuesFromString(props.values)),
    [props.values],
  );

  const query = useQueryTitle();
  const fuzzy = useQueryFuzzyTitle();

  useEffect(() => {
    if (props.values !== query.meta.lastValues) {
      query.setMeta({ lastValues: props.values });

      query.reset();
      fuzzy.reset();
      query.active();
      fuzzy.active();
      query.fetch(values);
      if (values.search !== undefined) fuzzy.fetch({ q: values.search });
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

  const fuzzyId = useInfiniteQuery({
    active: fuzzy.active,
    callback: () => fuzzy.fetch(fuzzy.lastArgs![0]),
    data: fuzzy.data,
    fetchIfNoData: false,
    getId(item) {
      return item.id.toString();
    },
    inactive: fuzzy.inactive,
    nextOffset: fuzzy.nextOffset,
  });

  return (
    <div className="w-full">
      <ColoredSuperTitle className="bg-red-500">
        {props.dictionary.title}
      </ColoredSuperTitle>

      <Title>{props.dictionary.queryResults.morePrecise}</Title>

      <div className="flex h-fit items-center gap-5 overflow-x-scroll pb-4 pl-[calc(0.75rem+env(safe-area-inset-left))] pr-[calc(0.75rem+env(safe-area-inset-right))] pt-3">
        {query.data === undefined && props.dictionary.loadingNoCache}

        {query.data !== undefined &&
          query.data.map((it) => (
            <TitleCard id={`${id}_${it.id}`} data={it} key={it.id.toString()} />
          ))}

        {query.data !== undefined &&
          query.data.length <= 0 &&
          props.dictionary.noResult}

        {query.data !== undefined && query.isFetching && (
          <p>{props.dictionary.fetching}</p>
        )}
      </div>

      {values.search !== undefined && (
        <React.Fragment>
          <Title>{props.dictionary.queryResults.moreFuzzy}</Title>

          <div className="flex h-fit items-center gap-5 overflow-x-scroll pb-4 pl-[calc(0.75rem+env(safe-area-inset-left))] pr-[calc(0.75rem+env(safe-area-inset-right))] pt-3">
            {fuzzy.data === undefined && props.dictionary.loadingNoCache}

            {fuzzy.data !== undefined &&
              fuzzy.data.map((it) => (
                <TitleCard
                  id={`${fuzzyId}_${it.id}`}
                  data={it}
                  key={it.id.toString()}
                />
              ))}

            {fuzzy.data !== undefined &&
              fuzzy.data.length <= 0 &&
              props.dictionary.noResult}

            {fuzzy.data !== undefined && fuzzy.isFetching && (
              <p>{props.dictionary.fetching}</p>
            )}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

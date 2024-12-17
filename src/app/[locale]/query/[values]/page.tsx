"use client";

import UIEntry__Search from "@/components/db_ui/UIEntry__Search";
import useInfiniteQuery from "@/hooks/useInfiniteQuery";
import schemaEntry__Search from "@/schemas/schemaEntry__Search";
import useFormQuery__Entry from "@/stores/forms/useFormQuery__Entry";
import useQueryEntry__Query from "@/stores/queries/useQueryEntry__Query";
import { formValuesFromString } from "@/utils/url";
import { use, useEffect, useMemo } from "react";

export default function Page(props: { params: Promise<{ values: string }> }) {
  const params = use(props.params);
  const values = useMemo(
    () => schemaEntry__Search.parse(formValuesFromString(params.values)),
    [params.values],
  );

  const form = useFormQuery__Entry();
  const query = useQueryEntry__Query();

  useEffect(() => {
    if (params.values !== form.meta.lastValues) {
      form.setFormMeta({ lastValues: params.values });

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
      return `${item.slug}-${item.id}`;
    },
    inactive: query.inactive,
    nextOffset: query.nextOffset,
  });

  if (query.data === undefined) return "loading no cache";

  return (
    <div className="flex gap-5 overflow-x-auto pb-4 pl-[calc(0.75rem+env(safe-area-inset-left))] pr-[calc(0.75rem+env(safe-area-inset-right))] pt-3">
      {query.data.map((it) => (
        <UIEntry__Search
          id={`${id}_${it.slug}-${it.id}`}
          data={it}
          key={`${it.slug}-${it.id}`}
        />
      ))}

      {query.isFetching && <p>fetching...</p>}
    </div>
  );
}

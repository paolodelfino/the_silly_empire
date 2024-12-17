"use client";

import UIEntry__Simple from "@/components/db_ui/UIEntry__Simple";
import useInfiniteQuery from "@/hooks/useInfiniteQuery";
import schemaEntry__Query__Form from "@/schemas/schemaEntry__Query__Form";
import useFormQuery__Entry from "@/stores/forms/useFormQuery__Entry";
import useQueryEntry__Query from "@/stores/queries/useQueryEntry__Query";
import { Dictionary } from "@/utils/dictionary";
import { formValuesFromString } from "@/utils/url";
import { useEffect, useMemo } from "react";

export default function Page(props: {
  values: string;
  dictionary: Pick<Dictionary, "fetching" | "loadingNoCache">;
}) {
  const values = useMemo(
    () => schemaEntry__Query__Form.parse(formValuesFromString(props.values)),
    [props.values],
  );

  const form = useFormQuery__Entry();
  const query = useQueryEntry__Query();

  useEffect(() => {
    if (props.values !== form.meta.lastValues) {
      form.setFormMeta({ lastValues: props.values });

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

  if (query.data === undefined) return props.dictionary.loadingNoCache;

  return (
    <div className="flex h-fit gap-5 overflow-x-scroll pb-4 pl-[calc(0.75rem+env(safe-area-inset-left))] pr-[calc(0.75rem+env(safe-area-inset-right))] pt-3">
      {query.data.map((it) => (
        <UIEntry__Simple
          id={`${id}_${it.slug}-${it.id}`}
          data={it}
          key={`${it.slug}-${it.id}`}
        />
      ))}

      {query.isFetching && <p>{props.dictionary.fetching}</p>}
    </div>
  );
}

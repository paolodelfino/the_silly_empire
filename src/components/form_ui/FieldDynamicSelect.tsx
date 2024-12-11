"use client";
import Button from "@/components/Button";
import FieldText from "@/components/form_ui/FieldText";
import { ArrowDown01 } from "@/components/icons";
import { FormField } from "@/utils/form";
import React, { useActionState, useEffect } from "react";
import { z } from "zod";

// TODO: Think of custom styling

type Item = {
  content: string;
  id: string;
};

type Meta = {
  selectedItems: Item[];
  showSearch: boolean;
  searchResult: Item[];
  searchQueryMeta: string;
  searchQueryValue: string;
  searchQueryError: string | undefined;
};

type Value = string[] | undefined;

export type FieldDynamicSelect__Type = FormField<Value, Meta>;

// We use undefined as the guard value assuming that undefined is equivalent to indeterminate state and nothing else for any field
export function fieldDynamicSelect(
  meta?: Partial<Meta>,
): FieldDynamicSelect__Type {
  return {
    meta: {
      selectedItems: [],
      showSearch: false,
      searchResult: [],
      searchQueryMeta: "",
      searchQueryValue: "",
      searchQueryError: undefined,
      ...meta,
    },
    value: undefined,
    default: {
      meta: {
        selectedItems: [],
        showSearch: false,
        searchResult: [],
        searchQueryMeta: "",
        searchQueryValue: "",
        searchQueryError: undefined,
        ...meta,
      },
      value: undefined,
    },
    error: undefined,
  };
}

function validate(searchQueryValue: Meta["searchQueryValue"]): Partial<Meta> {
  const schema = z.string().trim().min(1);
  const error = schema.safeParse(searchQueryValue).error?.flatten()
    .formErrors[0];

  const meta: Partial<Meta> = {};

  meta.searchQueryError = error;
  if (error === undefined) meta.searchQueryValue = searchQueryValue;

  return meta;
}

export default function FieldDynamicSelect({
  meta,
  setMeta,
  setValue,
  error,
  disabled,
  acceptIndeterminate,
  title,
  search,
  blacklist, // TODO: Exclude from search database query
}: {
  acceptIndeterminate?: boolean;
  setValue: (value: Value) => void;
  meta: Meta;
  setMeta: (meta: Partial<Meta>) => void;
  error: string | undefined;
  disabled: boolean;
  title: string; // TODO: Make React.ReactNode
  blacklist?: string[];
  search: (prevState: unknown, payload: { query: string }) => Promise<Item[]>;
}) {
  useEffect(() => {
    setValue(
      acceptIndeterminate && meta.selectedItems.length <= 0
        ? undefined
        : meta.selectedItems.map((it) => it.id),
    );
  }, [meta.selectedItems]);

  const [searchResult, searchAction, isSearching] = useActionState(
    search,
    void 0,
  );

  useEffect(() => {
    if (searchResult !== undefined)
      setMeta({
        searchResult,
      });
  }, [searchResult]);

  return (
    <div className="flex flex-col">
      <Title meta={meta} setMeta={setMeta} data={title} disabled={disabled} />

      <Error data={error} />

      <SelectedList meta={meta} setMeta={setMeta} disabled={disabled} />

      {meta.showSearch && (
        <React.Fragment>
          <SearchBar
            isSearching={isSearching}
            search={searchAction}
            meta={meta}
            setMeta={setMeta}
            disabled={disabled}
          />

          <SearchResult
            isSearching={isSearching}
            meta={meta}
            setMeta={setMeta}
            blacklist={blacklist}
            disabled={disabled}
          />
        </React.Fragment>
      )}
    </div>
  );
}

function Title({
  meta,
  setMeta,
  data,
  disabled,
}: {
  meta: Meta;
  setMeta: (meta: Partial<Meta>) => void;
  data: string;
  disabled: boolean;
}) {
  return (
    <div className="group flex w-full items-center">
      <h2
        data-disabled={disabled}
        className="py-1 pl-4 text-lg font-medium leading-10 data-[disabled=true]:opacity-50"
      >
        {data}
      </h2>
      <Button
        aria-label="Toggle search"
        disabled={disabled}
        color="ghost"
        onClick={() =>
          setMeta({
            showSearch: !meta.showSearch,
          })
        }
        classNames={{
          button: "group-hover:opacity-100 opacity-0 transition-opacity",
        }}
      >
        <ArrowDown01
          style={{
            transform: `rotate(${meta.showSearch ? 0 : 270}deg)`,
          }}
        />
      </Button>
    </div>
  );
}

function Error({ data }: { data: string | undefined }) {
  if (data !== undefined) return <span className="italic">{data}</span>;
}

function SelectedList({
  meta,
  setMeta,
  disabled,
}: {
  meta: Meta;
  setMeta: (meta: Partial<Meta>) => void;
  disabled: boolean;
}) {
  if (meta.selectedItems.length > 0)
    return (
      <div className="flex flex-wrap gap-2">
        {meta.selectedItems.map((it) => (
          <SelectedItem
            key={it.id}
            data={it}
            meta={meta}
            setMeta={setMeta}
            disabled={disabled}
          />
        ))}
      </div>
    );
}

function SelectedItem({
  meta,
  setMeta,
  data,
  disabled,
}: {
  meta: Meta;
  setMeta: (meta: Partial<Meta>) => void;
  data: Item;
  disabled: boolean;
}) {
  return (
    <Button
      title={data.content}
      disabled={disabled}
      onClick={() =>
        setMeta({
          selectedItems: meta.selectedItems.filter((it) => it.id !== data.id),
        })
      }
      classNames={{ button: "max-w-32" }}
    >
      {data.content}
    </Button>
  );
}

function SearchBar({
  meta,
  setMeta,
  isSearching,
  search,
  disabled,
}: {
  meta: Meta;
  setMeta: (meta: Partial<Meta>) => void;
  isSearching: boolean;
  disabled: boolean;
  search: (payload: { query: string }) => void;
}) {
  return (
    <FieldText
      meta={meta.searchQueryMeta}
      setMeta={(searchQueryMeta) => setMeta({ searchQueryMeta })}
      setValue={(searchQueryValue) => {
        setMeta(validate(searchQueryValue!));
      }}
      classNames={{
        container: "mt-5",
        input: 'data-[is-result="true"]:!rounded-b-none',
      }}
      data-is-result={
        meta.searchResult.length > 0 &&
        !isSearching &&
        meta.searchQueryError === undefined
      }
      error={meta.searchQueryError}
      disabled={isSearching || disabled}
      onKeyDown={(e) => {
        if (e.code === "Enter" && meta.searchQueryError === undefined)
          search({ query: meta.searchQueryValue });
      }}
    />
  );
}

function SearchResult({
  meta,
  setMeta,
  blacklist,
  isSearching,
  disabled,
}: {
  meta: Meta;
  setMeta: (meta: Partial<Meta>) => void;
  blacklist?: string[];
  isSearching: boolean;
  disabled: boolean;
}) {
  if (isSearching) return <span className="">loading</span>;

  if (meta.searchResult.length <= 0) return <span className="">empty</span>;

  return (
    <ul className="flex w-full flex-col">
      {meta.searchResult.map((it) => (
        <SearchResultItem
          key={it.id}
          data={it}
          meta={meta}
          setMeta={setMeta}
          blacklist={blacklist}
          disabled={disabled}
        />
      ))}
    </ul>
  );
}

function SearchResultItem({
  meta,
  setMeta,
  data,
  disabled,
  blacklist,
}: {
  meta: Meta;
  setMeta: (meta: Partial<Meta>) => void;
  data: Item;
  disabled: boolean;
  blacklist?: string[];
}) {
  return (
    <Button
      role="listitem"
      size="large"
      full
      multiple
      disabled={
        meta.selectedItems.findIndex((it) => it.id === data.id) !== -1 ||
        (blacklist !== undefined &&
          blacklist.findIndex((itemId) => data.id === itemId) !== -1) ||
        disabled
      }
      onClick={() =>
        setMeta({
          selectedItems: [...meta.selectedItems, data],
        })
      }
    >
      {data.content}
    </Button>
  );
}

import { isObject, PartialIfObject } from "@/utils/object";
import { create } from "zustand";

// TODO: Problema con le richieste in parallelo (ad esempio, quello dello state isFetching)
// TODO: Implementa meccanismo per bloccare fetch simultanei

export interface QueryState<Fn extends (...args: any) => any, Meta> {
  data: Awaited<ReturnType<Fn>> | undefined;
  isFresh: boolean;
  isFetching: boolean;
  lastArgs: Parameters<Fn> | undefined;
  isActive: boolean;
  meta: Meta;
  active: () => Promise<void>;
  inactive: () => void;
  fetch: (...args: Parameters<Fn>) => Promise<Awaited<ReturnType<Fn>>>;
  invalidate: () => Promise<void>;
  setMeta: (value: PartialIfObject<Meta>) => void;
  reset: () => void;
}

/**
 * Query function must not return undefined because it is a guard value
 */
export function createQuery<Fn extends (...args: any) => any, Meta>(
  fn: Fn,
  meta: Meta,
) {
  return create<QueryState<Fn, Meta>>((set, get, api) => ({
    data: undefined,
    isFresh: true,
    isFetching: false,
    lastArgs: undefined,
    isActive: false,
    meta: meta,
    async active() {
      set({ isActive: true });

      const state = get();

      if (!state.isFresh) await state.fetch(...state.lastArgs!);
    },
    inactive() {
      set({ isActive: false });
    },
    async fetch(...args) {
      const state = get();

      if (!state.isActive) throw new Error("Tried to fetch an inactive query");

      set({ isFetching: true });

      const data = await fn(...args);

      set({
        data: data,
        isFresh: true,
        lastArgs: args,
        isFetching: false,
      });

      return data;
    },
    async invalidate() {
      const state = get();

      if (state.data === undefined) return;

      if (state.isActive) await state.fetch(...state.lastArgs!);
      else set({ isFresh: false });
    },
    setMeta(value) {
      set((state) => {
        // @ts-expect-error
        return { meta: isObject(value) ? { ...state.meta, ...value } : value };
      });
    },
    reset() {
      set({
        data: undefined,
        isFresh: true,
        lastArgs: undefined,
        isActive: false,
      });
    },
  }));
}

export interface InfiniteQueryState<
  Fn extends (
    offset: number,
    limit: number,
    ...args: any
  ) => Promise<{ data: Array<any>; total: number }>,
  Meta,
> {
  data: Awaited<ReturnType<Fn>>["data"] | undefined;
  total: number;
  isFresh: boolean;
  isFetching: boolean;
  nextOffset: number | undefined;
  lastArgs:
    | undefined
    | (Fn extends (
        offset: number,
        limit: number,
        ...args: infer P
      ) => Promise<{ data: Array<any>; total: number }>
        ? P
        : []);
  isActive: boolean;
  meta: Meta;
  reset: () => void;
  active: () => Promise<void>;
  inactive: () => void;
  fetch: (
    ...args: Fn extends (
      offset: number,
      limit: number,
      ...args: infer P
    ) => Promise<{ data: Array<any>; total: number }>
      ? P
      : []
  ) => Promise<void>;
  invalidate: () => Promise<void>;
  setMeta: (value: PartialIfObject<Meta>) => void;
}

export function createInfiniteQuery<
  Fn extends (
    offset: number,
    limit: number,
    ...args: any
  ) => Promise<{ data: Array<any>; total: number }>,
  Meta,
>(limit: number, fn: Fn, meta: Meta) {
  return create<InfiniteQueryState<Fn, Meta>>((set, get, api) => {
    const fetch = async (
      offset: number,
      limit: number,
      ...args: Fn extends (
        offset: number,
        limit: number,
        ...args: infer P
      ) => Promise<{ data: Array<any>; total: number }>
        ? P
        : []
    ) => {
      const result = await fn(offset, limit, ...args);

      // const previousOffset = offset - limit >= 0 ? offset - limit : null;
      const nextOffset =
        result.data.length < limit ? undefined : offset + result.data.length;

      return {
        data: result.data as Awaited<ReturnType<Fn>>["data"],
        nextOffset,
        total: result.total,
      };
    };

    return {
      data: undefined,
      total: -1,
      isFresh: true,
      isFetching: false,
      lastArgs: undefined,
      nextOffset: 0,
      isActive: false,
      meta: meta,
      reset() {
        set({
          data: undefined,
          total: -1,
          isFresh: true,
          lastArgs: undefined,
          nextOffset: 0,
          isActive: false,
        });
      },
      async active() {
        set({ isActive: true });

        const state = get();

        if (!state.isFresh) {
          set({ isFetching: true });

          const result = await fetch(
            0,
            state.data!.length,
            ...(state.lastArgs as any),
          );

          set({
            data: result.data,
            total: result.total,
            nextOffset: result.nextOffset,
            isFetching: false,
            isFresh: true,
          });
        }
      },
      inactive() {
        set({ isActive: false });
      },
      async fetch(...args) {
        const state = get();

        if (!state.isActive)
          throw new Error("Tried to fetch an inactive query");

        if (state.nextOffset === undefined)
          throw new Error("Tried to fetch a query with no more entries");

        set({ isFetching: true });

        const result = await fetch(state.nextOffset, limit, ...(args as any));

        set({
          data:
            state.data !== undefined
              ? ([...state.data, ...result.data] as any)
              : result.data,
          total: result.total,
          nextOffset: result.nextOffset,
          isFetching: false,
          isFresh: true,
          lastArgs: args,
        });
      },
      async invalidate() {
        const state = get();

        if (state.data === undefined) return;

        if (state.isActive) {
          set({ isFetching: true });

          const result = await fetch(
            0,
            state.data.length,
            ...(state.lastArgs as any),
          );

          set({
            data: result.data,
            total: result.total,
            nextOffset: result.nextOffset,
            isFetching: false,
            isFresh: true,
          });
        } else set({ isFresh: false });
      },
      setMeta(value) {
        set((state) => {
          return {
            // @ts-expect-error
            meta: isObject(value) ? { ...state.meta, ...value } : value,
          };
        });
      },
    };
  });
}

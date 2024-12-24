import schemaFuzzyQueryTitle from "@/schemas/schemaFuzzyQueryTitle";
import { FormValues } from "@/utils/form";
import { createInfiniteQuery } from "@/utils/query";
import { scFuzzySearch } from "@/utils/sc";

const useQueryFuzzyTitle = createInfiniteQuery(
  60,
  (offset, limit, values: FormValues<typeof schemaFuzzyQueryTitle>) => {
    if (offset >= 120)
      return { data: [], total: -1 } as unknown as ReturnType<
        typeof scFuzzySearch
      >;
    return scFuzzySearch(offset, values);
  },
  undefined,
);
export default useQueryFuzzyTitle;

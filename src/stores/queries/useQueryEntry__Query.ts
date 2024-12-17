import schemaEntry__Search from "@/schemas/schemaEntry__Search";
import { FormValues } from "@/utils/form";
import { createInfiniteQuery } from "@/utils/query";
import { scSearch } from "@/utils/sc";

const useQueryEntry__Query = createInfiniteQuery(
  60,
  (offset, limit, values: FormValues<typeof schemaEntry__Search>) =>
    scSearch(offset, values),
);
export default useQueryEntry__Query;

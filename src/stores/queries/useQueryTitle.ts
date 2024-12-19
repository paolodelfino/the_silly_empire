import schemaQueryTitle from "@/schemas/schemaQueryTitle";
import { FormValues } from "@/utils/form";
import { createInfiniteQuery } from "@/utils/query";
import { scSearch } from "@/utils/sc";

const useQueryTitle = createInfiniteQuery(
  60,
  (offset, limit, values: FormValues<typeof schemaQueryTitle>) =>
    scSearch(offset, values),
  { lastValues: undefined as undefined | string },
);
export default useQueryTitle;

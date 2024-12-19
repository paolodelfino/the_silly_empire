import ActionFetchUpcoming from "@/actions/ActionFetchUpcoming";
import { createInfiniteQuery } from "@/utils/query";

const useQueryUpcoming = createInfiniteQuery(
  30,
  (offset, limit) => ActionFetchUpcoming({ offset }),
  undefined,
);
export default useQueryUpcoming;

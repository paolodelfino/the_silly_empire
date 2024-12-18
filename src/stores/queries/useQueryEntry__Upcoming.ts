import ActionFetch__Upcoming from "@/actions/ActionFetch__Upcoming";
import { createInfiniteQuery } from "@/utils/query";

const useQueryEntry__Upcoming = createInfiniteQuery(30, (offset, limit) =>
  ActionFetch__Upcoming(offset),
);
export default useQueryEntry__Upcoming;

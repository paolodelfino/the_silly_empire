import ActionFetchSeason from "@/actions/ActionFetchSeason";
import schemaSeasonFetch from "@/schemas/schemaSeasonFetch";
import { FormValues } from "@/utils/form";
import { createQuery } from "@/utils/query";

const useQuerySeason = createQuery(
  (values: FormValues<typeof schemaSeasonFetch>) => ActionFetchSeason(values),
);
export default useQuerySeason;

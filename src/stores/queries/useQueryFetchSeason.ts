import ActionFetchSeason from "@/actions/ActionFetchSeason"
import { FieldSelect__Type } from "@/components/form_ui/FieldSelect"
import schemaFetchSeason from "@/schemas/schemaFetchSeason"
import { FormValues } from "@/utils/form"
import { createQuery } from "@/utils/query"

const useQueryFetchSeason = createQuery(
  (values: FormValues<typeof schemaFetchSeason>) => ActionFetchSeason(values),
  {
    lastTitleId: undefined as undefined | number,
    seasonSelectField: undefined as undefined | FieldSelect__Type,
    lastSeasonFetched: undefined as undefined | string,
  },
);
export default useQueryFetchSeason;

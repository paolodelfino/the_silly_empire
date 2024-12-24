import ActionFetchPlaylist from "@/actions/ActionFetchPlaylist";
import schemaFetchPlaylist from "@/schemas/schemaFetchPlaylist";
import { FormValues } from "@/utils/form";
import { createQuery } from "@/utils/query";

const useQueryFetchPlaylist = createQuery(
  (values: FormValues<typeof schemaFetchPlaylist>) =>
    ActionFetchPlaylist(values),
  {
    lastSeasonNumber: undefined as undefined | number,
    lastEpisodeNumber: undefined as undefined | number,
  },
);
export default useQueryFetchPlaylist;

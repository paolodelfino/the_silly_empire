"use server";

import schemaFetchPlaylist from "@/schemas/schemaFetchPlaylist";
import { FormValues } from "@/utils/form";
import { SC_DEFAULT_TLD, scPlaylist } from "@/utils/sc";
import { cookies } from "next/headers";

export default async function ActionFetchPlaylist(
  values: FormValues<typeof schemaFetchPlaylist>,
) {
  const { scwsId, titleId, episodeId } = schemaFetchPlaylist.parse(values);
  const tld = (await cookies()).get("scTld")?.value ?? SC_DEFAULT_TLD;
  return scPlaylist(tld, scwsId, titleId, episodeId);
}

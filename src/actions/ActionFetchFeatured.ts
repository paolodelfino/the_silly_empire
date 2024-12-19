"use server";

import { SC_DEFAULT_TLD, scFeatured } from "@/utils/sc";
import { cookies } from "next/headers";

export default async function ActionFetchFeatured() {
  const tld = (await cookies()).get("scTld")?.value ?? SC_DEFAULT_TLD;
  return scFeatured(tld);
}

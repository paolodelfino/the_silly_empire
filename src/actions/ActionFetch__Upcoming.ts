"use server";

import { SC_DEFAULT_TLD, scUpcoming } from "@/utils/sc";
import { cookies } from "next/headers";

export default async function ActionFetch__Upcoming(offset: number) {
  const tld = (await cookies()).get("scTld")?.value ?? SC_DEFAULT_TLD;
  return scUpcoming(offset, tld);
}

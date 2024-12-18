"use server";

import { scUpcoming } from "@/utils/sc";

export default async function ActionFetch__Upcoming(offset: number) {
  return scUpcoming(offset);
}

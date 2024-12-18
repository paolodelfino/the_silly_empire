"use server";

import { scFeatured } from "@/utils/sc";

export default async function ActionFetch__Featured() {
  return scFeatured();
}

import { getDictionary } from "@/utils/locale";
import { headers } from "next/headers";

export default async function NotFound() {
  // TODO: Probably in these cases I should only consider locale from cookie or default
  const dictionary = (await getDictionary((await headers()).get("locale")!))[
    "404"
  ];

  return dictionary.message;
}

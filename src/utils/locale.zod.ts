import { zodCustomDictionary, zodDictionary } from "@/utils/dictionary_zod";
import i18next from "i18next";
import { z } from "zod";
import { makeZodI18nMap } from "zod-i18n-map";

export async function localeConfigureZod(locale: string) {
  const [zod, custom] = await Promise.all([
    zodDictionary[locale](),
    zodCustomDictionary[locale](),
  ]);
  i18next.init({
    lng: locale,
    resources: {
      [locale]: {
        zod: zod,
        custom: custom,
      },
    },
  });
  z.setErrorMap(makeZodI18nMap({ ns: ["zod", "custom"] }));
}

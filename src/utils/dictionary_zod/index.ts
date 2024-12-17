export type Dictionary = {
  onePredicate: string;
};

export const zodCustomDictionary: {
  [locale: string]: () => Promise<Dictionary>;
} = {
  en: () => import("./en").then((module) => module.default),
  it: () => import("./it").then((module) => module.default),
};

// TODO: Are we sure only one gets loaded?
export const zodDictionary: {
  [locale: string]: () => Promise<any>;
} = {
  en: () =>
    import("zod-i18n-map/locales/en/zod.json").then((module) => module.default),
  it: () =>
    import("zod-i18n-map/locales/it/zod.json").then((module) => module.default),
};

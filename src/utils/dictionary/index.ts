import "server-only";

export type Dictionary = {
  toolbar: {
    home: string;
    settings: string;
    query: string;
  };
  settings: {
    title: string;
    fontSize: string;
    language: string;
  };
  login: {
    key: string;
    submit: string;
  };
  installPrompt: {
    title: string;
    detectMessage: string;
    installMessage: string;
  };
  query: {
    title: string;
    name: string;
    kind: string;
    genre: string;
    year: string;
    service: string;
    age: string;
  };
  notFound: string;
  fetching: string;
  loadingNoCache: string;
};

export const dictionary: {
  [locale: string]: () => Promise<Dictionary>;
} = {
  en: () => import("./en").then((module) => module.default),
  it: () => import("./it").then((module) => module.default),
};

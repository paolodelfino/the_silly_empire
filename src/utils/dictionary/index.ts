import "server-only";

export type Dictionary = {
  Toolbar: {
    Route: {
      home: string;
      settings: string;
      query: string;
    };
  };
  "/settings": {
    title: string;
    Section: {
      FontSize: { title: string };
      Language: { title: string };
    };
  };
  "/login": {
    Field: {
      Key: { name: string };
    };
    submit: string;
  };
  InstallPrompt: {
    title: string;
    detectMessage: string;
    installMessage: string;
  };
  Query: {
    title: string;
    name: string;
    kind: string;
    genre: string;
    year: string;
    service: string;
    age: string;
  };
  "404": {
    message: string;
  };
};

export const dictionary: {
  [locale: string]: () => Promise<Dictionary>;
} = {
  en: () => import("./en").then((module) => module.default),
  it: () => import("./it").then((module) => module.default),
};

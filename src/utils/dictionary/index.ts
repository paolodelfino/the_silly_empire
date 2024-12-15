import "server-only";

export type Dictionary = {
  "/home": {
    Toolbar: {
      Route: {
        home: string;
        settings: string;
      };
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

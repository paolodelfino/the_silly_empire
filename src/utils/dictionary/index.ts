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
    sc: {
      warning: string;
      update: string;
      howTo1: string;
      howTo2: string;
      howTo3: string;
    };
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
  queryForm: {
    kind: {
      movie: string;
      tvSeries: string;
    };
    genre: {
      actionAdventure: string;
      animation: string;
      adventure: string;
      action: string;
      comedy: string;
      crime: string;
      documentary: string;
      drama: string;
      family: string;
      sciFi: string;
      fantasy: string;
      war: string;
      horror: string;
      kids: string;
      koreanDrama: string;
      mystery: string;
      music: string;
      reality: string;
      romance: string;
      sciFiFantasy: string;
      soap: string;
      history: string;
      televisionFilm: string;
      thriller: string;
      warPolitics: string;
      western: string;
    };
  };
  home: {
    title: string;
    featured: string;
    upcoming: string;
  };
  save: string;
};

export const dictionary: {
  [locale: string]: () => Promise<Dictionary>;
} = {
  en: () => import("./en").then((module) => module.default),
  it: () => import("./it").then((module) => module.default),
};

import schemaTitle from "@/schemas/schemaTitle";
import "server-only";
import { z } from "zod";

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
  titleStatus: Record<z.infer<typeof schemaTitle>["status"], string>;
  titlePage: {
    services: string;
    status: string;
    genres: string;
    keywords: string;
    related: string;
    comingOn1: string;
    comingOn2: string;
    notYetAvailable1: string;
    notYetAvailable2: string;
    season: string;
    play: string;
  };
  scTldOutdated: string;
  langReloadAfterSet: string;
  invalid: string;
  copied: string;
  couldNotCopy: string;
};

export const dictionary: {
  [locale: string]: () => Promise<Dictionary>;
} = {
  en: () => import("./en").then((module) => module.default),
  it: () => import("./it").then((module) => module.default),
};

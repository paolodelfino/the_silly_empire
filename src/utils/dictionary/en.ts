import { Dictionary } from "@/utils/dictionary";
import "server-only";

const en: Dictionary = {
  toolbar: {
    home: "Home",
    settings: "Settings",
    query: "Query",
  },
  settings: {
    title: "Settings",
    fontSize: "Font size",
    language: "Language",
  },
  login: {
    key: "Key",
    submit: "Submit",
  },
  notFound: "Not found",
  installPrompt: {
    title: "Please install the pwa",
    detectMessage:
      "I detected you're on mobile, for the best experience, install the app.",
    installMessage: "Click the share button and then add to screen.",
  },
  query: {
    title: "Query",
    name: "Name",
    kind: "Kind",
    genre: "Genre",
    year: "Year",
    service: "Service",
    age: "Age",
  },
  fetching: "fetching...",
  loadingNoCache: "loading no cache",
} satisfies Dictionary;
export default en;

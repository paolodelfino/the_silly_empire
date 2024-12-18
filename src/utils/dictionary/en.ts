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
  queryForm: {
    kind: {
      movie: "Movie",
      tvSeries: "Tv series",
    },
    genre: {
      actionAdventure: "Action & Adventure",
      animation: "Animation",
      adventure: "Adventure",
      action: "Action",
      comedy: "Comedy",
      crime: "Crime",
      documentary: "Documentary",
      drama: "Drama",
      family: "Family",
      sciFi: "Sci-Fi",
      fantasy: "Fantasy",
      war: "War",
      horror: "Horror",
      kids: "Kids",
      koreanDrama: "Korean Drama",
      mystery: "Mystery",
      music: "Music",
      reality: "Reality",
      romance: "Romance",
      sciFiFantasy: "Sci-Fi & Fantasy",
      soap: "Soap",
      history: "History",
      televisionFilm: "Television Film",
      thriller: "Thriller",
      warPolitics: "War & Politics",
      western: "Western",
    },
  },
  home: {
    title: "Home",
    featured: "Featured",
    upcoming: "Upcoming",
  },
} satisfies Dictionary;
export default en;

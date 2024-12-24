import { Dictionary } from "@/utils/dictionary";
import "server-only";

const en: Dictionary = {
  toolbar: {
    home: "Home",
    settings: "Settings",
    query: "Query",
    help: "Help",
  },
  settings: {
    title: "Settings",
    fontSize: "Font size",
    language: "Language",
    sc: {
      warning: "(Needs update -- click here for info)",
      update: "How to update sc's tld",
      howTo1: "Open Telegram, send a random message to ",
      howTo2: " and set the following part of the url ",
      howTo3: " in the input below.",
      howTo4:
        "If it still doesn't work, then try to navigate to the url, the bot sent you, using a browser and then see what's the last part of the url when the page has loaded and use it.",
    },
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
  noResult: "No result",
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
    continueWatching: "Continue watching",
  },
  save: "Save",
  titleStatus: {
    Canceled: "Canceled",
    "Post Production": "Post Production",
    "Returning Series": "Returning Series",
    Released: "Released",
    Planned: "Planned",
    "In Production": "In Production",
    Ended: "Ended",
  },
  titlePage: {
    services: "Services",
    status: "Status",
    genres: "Genres",
    keywords: "Keywords",
    related: "Related",
    comingOn1: "Coming on ",
    comingOn2: "coming on",
    notYetAvailable1: "Not yet available",
    notYetAvailable2: "not yet available",
    season: "Season",
    play: "Play",
  },
  scTldOutdated:
    "Sc'tld is outdated, I'll redirect to settings. Please, update it. If you're logging in, then update it after you logged in.",
  langReloadAfterSet: "If needed, refresh the page or reopen the app.",
  invalid: "Invalid.",
  copied: "Copied.",
  couldNotCopy: "Could not copy text.",
  queryResults: {
    morePrecise: "More precise",
    moreFuzzy: "More fuzzy",
  },
  player: {
    findPlayingEpisode: "Find playing episode",
    season: "Season",
    comingOn: "coming on",
    episodeFetching: "Fetching",
    episodePlaying: "Playing",
  },
  help: {
    title: "Help",
    rule1: "Do not share your key.",
    rule2:
      "If you abuse title watching, you'll probably ruin everyone's experience.",
    rule3: "If you have popup blockers enabled, whitelist this domain.",
    rule4: "The data is only saved on the client.",
    rule5: "Some of the things don't get translated, for example, images.",
  },
} satisfies Dictionary;
export default en;

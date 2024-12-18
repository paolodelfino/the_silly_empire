import { Dictionary } from "@/utils/dictionary";
import "server-only";

const it: Dictionary = {
  toolbar: {
    home: "Home",
    settings: "Impostazioni",
    query: "Cerca",
  },
  settings: {
    title: "Impostazioni",
    fontSize: "Grandezza del font",
    language: "Lingua",
    sc: {
      warning:
        "(Necessita di un aggiornamento -- clicca qui per le informazioni)",
      update: "Come aggiornare sc's tld",
      howTo1: "Apri Telegram, invia un messaggio casuale a ",
      howTo2: " e inserisci la seguente parte dello url ",
      howTo3: " nel campo sottostante.",
    },
  },
  login: {
    key: "Chiave",
    submit: "Invia",
  },
  notFound: "Pagina non trovata",
  installPrompt: {
    title: "Per favore scarica la pwa",
    detectMessage: "Sei su mobile, per un'esperienza migliore, scarica l'app.",
    installMessage:
      "Clicca il pulsante di condivisione e poi aggiungi allo schermo.",
  },
  query: {
    title: "Cerca",
    name: "Nome",
    kind: "Categoria",
    genre: "Genere",
    year: "Anno",
    service: "Servizio",
    age: "Restrizione di età",
  },
  fetching: "recupero...",
  loadingNoCache: "caricamento no cache",
  queryForm: {
    kind: {
      movie: "Film",
      tvSeries: "Serie tv",
    },
    genre: {
      actionAdventure: "Azione & Avventura",
      animation: "Animazione",
      adventure: "Avventura",
      action: "Azione",
      comedy: "Commedia",
      crime: "Crime",
      documentary: "Documentario",
      drama: "Dramma",
      family: "Famiglia",
      sciFi: "Fantascienza",
      fantasy: "Fantasy",
      war: "Guerra",
      horror: "Horror",
      kids: "Bambini",
      koreanDrama: "Dramma Korean",
      mystery: "Mistero",
      music: "Musica",
      reality: "Reality",
      romance: "Romanzo d'amore",
      sciFiFantasy: "Fantascienza & Fantasy",
      soap: "Soap",
      history: "Storia",
      televisionFilm: "Telefilm",
      thriller: "Thriller",
      warPolitics: "Guerra & Politica",
      western: "Western",
    },
  },
  home: {
    title: "Home",
    featured: "In primo piano",
    upcoming: "In arrivo",
  },
  save: "Salva",
} satisfies Dictionary;
export default it;

import { Dictionary } from "@/utils/dictionary";
import "server-only";

const it: Dictionary = {
  Toolbar: {
    Route: {
      home: "Home",
      settings: "Impostazioni",
    },
  },
  "/settings": {
    title: "Impostazioni",
    Section: {
      FontSize: {
        title: "Grandezza del font",
      },
      Language: {
        title: "Lingua",
      },
    },
  },
  "/login": {
    Field: {
      Key: {
        name: "Chiave",
      },
    },
    submit: "Invia",
  },
  "404": { message: "Pagina non trovata" },
  InstallPrompt: {
    title: "Per favore scarica la pwa",
    detectMessage: "Sei su mobile, per un'esperienza migliore, scarica l'app.",
    installMessage:
      "Clicca il pulsante di condivisione e poi aggiungi allo schermo.",
  },
} satisfies Dictionary;
export default it;

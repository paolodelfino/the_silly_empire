import { Dictionary } from "@/utils/dictionary";
import "server-only";

const it: Dictionary = {
  "/home": {
    Toolbar: {
      Route: {
        home: "Home",
        settings: "Impostazioni",
      },
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
} satisfies Dictionary;
export default it;

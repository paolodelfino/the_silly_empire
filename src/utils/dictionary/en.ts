import { Dictionary } from "@/utils/dictionary";
import "server-only";

const en: Dictionary = {
  "/home": {
    Toolbar: {
      Route: {
        home: "Home",
        settings: "Settings",
      },
    },
  },
  "/settings": {
    title: "Settings",
    Section: {
      FontSize: {
        title: "Font size",
      },
      Language: {
        title: "Language",
      },
    },
  },
  "/login": {
    Field: {
      Key: {
        name: "Key",
      },
    },
    submit: "Submit",
  },
  404: {
    message: "Not found",
  },
} satisfies Dictionary;
export default en;

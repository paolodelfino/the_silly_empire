import { Dictionary } from "@/utils/dictionary";
import "server-only";

const en: Dictionary = {
  Toolbar: {
    Route: {
      home: "Home",
      settings: "Settings",
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
  InstallPrompt: {
    title: "Please install the pwa",
    detectMessage:
      "I detected you're on mobile, for the best experience, install the app.",
    installMessage: "Click the share button and then add to screen.",
  },
} satisfies Dictionary;
export default en;

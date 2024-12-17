import { fieldSelect } from "@/components/form_ui/FieldSelect";
import { fieldText } from "@/components/form_ui/FieldText";
import schemaEntry__Query__Form from "@/schemas/schemaEntry__Query__Form";
import { Dictionary } from "@/utils/dictionary";
import { createForm } from "@/utils/form";

const useFormQuery__Entry = createForm(
  schemaEntry__Query__Form,
  undefined as unknown as ReturnType<typeof init__formQuery__Entry>,
  {
    lastValues: undefined as string | undefined,
  },
);
export default useFormQuery__Entry;

export function init__formQuery__Entry(dictionary: Dictionary["queryForm"]) {
  return {
    search: fieldText(),
    kind: fieldSelect({
      items: [
        {
          content: dictionary.kind.movie,
          id: "movie",
        },
        {
          content: dictionary.kind.tvSeries,
          id: "tv",
        },
      ],
    }),
    genre: fieldSelect({
      items: [
        {
          content: dictionary.genre.actionAdventure,
          id: "13",
        },
        {
          content: dictionary.genre.animation,
          id: "19",
        },
        {
          content: dictionary.genre.adventure,
          id: "11",
        },
        {
          content: dictionary.genre.action,
          id: "4",
        },
        {
          content: dictionary.genre.comedy,
          id: "12",
        },
        {
          content: dictionary.genre.crime,
          id: "2",
        },
        {
          content: dictionary.genre.documentary,
          id: "24",
        },
        {
          content: dictionary.genre.drama,
          id: "1",
        },
        {
          content: dictionary.genre.family,
          id: "16",
        },
        {
          content: dictionary.genre.sciFi,
          id: "10",
        },
        {
          content: dictionary.genre.fantasy,
          id: "8",
        },
        {
          content: dictionary.genre.war,
          id: "9",
        },
        {
          content: dictionary.genre.horror,
          id: "7",
        },
        {
          content: dictionary.genre.kids,
          id: "25",
        },
        {
          content: dictionary.genre.koreanDrama,
          id: "26",
        },
        {
          content: dictionary.genre.mystery,
          id: "6",
        },
        {
          content: dictionary.genre.music,
          id: "14",
        },
        {
          content: dictionary.genre.reality,
          id: "18",
        },
        {
          content: dictionary.genre.romance,
          id: "15",
        },
        {
          content: dictionary.genre.sciFiFantasy,
          id: "3",
        },
        {
          content: dictionary.genre.soap,
          id: "23",
        },
        {
          content: dictionary.genre.history,
          id: "22",
        },
        {
          content: dictionary.genre.televisionFilm,
          id: "21",
        },
        {
          content: dictionary.genre.thriller,
          id: "5",
        },
        {
          content: dictionary.genre.warPolitics,
          id: "17",
        },
        {
          content: dictionary.genre.western,
          id: "20",
        },
      ],
    }),
    year: fieldSelect({
      items: [
        {
          content: "2024",
          id: "2024",
        },
        {
          content: "2023",
          id: "2023",
        },
        {
          content: "2022",
          id: "2022",
        },
        {
          content: "2021",
          id: "2021",
        },
        {
          content: "2020",
          id: "2020",
        },
        {
          content: "2019",
          id: "2019",
        },
        {
          content: "2018",
          id: "2018",
        },
        {
          content: "2017",
          id: "2017",
        },
        {
          content: "2016",
          id: "2016",
        },
        {
          content: "2015",
          id: "2015",
        },
        {
          content: "2014",
          id: "2014",
        },
        {
          content: "2013",
          id: "2013",
        },
        {
          content: "2012",
          id: "2012",
        },
        {
          content: "2011",
          id: "2011",
        },
        {
          content: "2010",
          id: "2010",
        },
        {
          content: "2009",
          id: "2009",
        },
        {
          content: "2008",
          id: "2008",
        },
        {
          content: "2007",
          id: "2007",
        },
        {
          content: "2006",
          id: "2006",
        },
        {
          content: "2005",
          id: "2005",
        },
        {
          content: "2004",
          id: "2004",
        },
        {
          content: "2003",
          id: "2003",
        },
        {
          content: "2002",
          id: "2002",
        },
        {
          content: "2001",
          id: "2001",
        },
        {
          content: "2000",
          id: "2000",
        },
        {
          content: "1990",
          id: "1990",
        },
        {
          content: "1980",
          id: "1980",
        },
        {
          content: "1970",
          id: "1970",
        },
        {
          content: "1960",
          id: "1960",
        },
        {
          content: "1950",
          id: "1950",
        },
        {
          content: "1940",
          id: "1940",
        },
        {
          content: "1930",
          id: "1930",
        },
        {
          content: "1920",
          id: "1920",
        },
        {
          content: "1910",
          id: "1910",
        },
      ],
    }),
    service: fieldSelect({
      items: [
        { content: "Netflix", id: "netflix" },
        { content: "PrimeVideo", id: "prime" },
        { content: "Disney+", id: "disney" },
        { content: "AppleTV+", id: "apple" },
        { content: "NowTV", id: "now" },
      ],
    }),
    quality: fieldSelect({
      items: [
        { content: "HD", id: "hd" },
        { content: "SD", id: "sd" },
        { content: "TS", id: "ts" },
        { content: "CAM", id: "cam" },
      ],
    }),
    age: fieldSelect({
      items: [
        { content: "7+", id: "7" },
        { content: "12+", id: "12" },
        { content: "14+", id: "14" },
        { content: "16+", id: "16" },
        { content: "18+", id: "18" },
      ],
    }),
  } as const;
}

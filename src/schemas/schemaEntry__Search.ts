import { z } from "zod";

const schemaEntry__Search = z
  .object({
    search: z.string().trim().min(1).optional(),
    kind: z.enum(["tv", "movie"]).optional(),
    genre: z
      .enum([
        "13",
        "19",
        "11",
        "4",
        "12",
        "2",
        "24",
        "1",
        "16",
        "10",
        "8",
        "9",
        "7",
        "25",
        "26",
        "6",
        "14",
        "18",
        "15",
        "3",
        "23",
        "22",
        "21",
        "5",
        "17",
        "20",
      ])
      .optional(),
    year: z
      .enum([
        "2024",
        "2023",
        "2022",
        "2021",
        "2020",
        "2019",
        "2018",
        "2017",
        "2016",
        "2015",
        "2014",
        "2013",
        "2012",
        "2011",
        "2010",
        "2009",
        "2008",
        "2007",
        "2006",
        "2005",
        "2004",
        "2003",
        "2002",
        "2001",
        "2000",
        "1990",
        "1980",
        "1970",
        "1960",
        "1950",
        "1940",
        "1930",
        "1920",
        "1910",
      ])
      .optional(),
    service: z.enum(["netflix", "prime", "disney", "apple", "now"]).optional(),
    quality: z.enum(["hd", "sd", "ts", "cam"]).optional(),
    age: z.enum(["7", "12", "14", "16", "18"]).optional(),
  })
  .strict()
  .refine(
    (value) =>
      Object.entries(value).filter((entry) => entry[1] !== undefined).length >
      0, // Note: Update accordingly with above props
    "A predicate must be provided",
  );
export default schemaEntry__Search;
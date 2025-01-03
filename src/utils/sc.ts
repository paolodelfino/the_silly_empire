import schemaFuzzyQueryTitle from "@/schemas/schemaFuzzyQueryTitle";
import schemaQueryTitle from "@/schemas/schemaQueryTitle";
import schemaQueuedTitle from "@/schemas/schemaQueuedTitle";
import schemaSeason from "@/schemas/schemaSeason";
import schemaTitle from "@/schemas/schemaTitle";
import { decodeHtml, decodeUtf8 } from "@/utils/encoding";
import { FormValues } from "@/utils/form";
import { urlConnectionExists } from "@/utils/url";
import { getCookie } from "cookies-next";
import { z } from "zod";

const DATA_PAGE_REGEX = new RegExp('<div id="app" data-page="(.+)"><\/div>');
const DATA_PAGE_GROUP_INDEX = 1;
export const SC_DEFAULT_TLD = "prof";

export const genresMap = {
  "13": "actionAdventure",
  "19": "animation",
  "11": "adventure",
  "4": "action",
  "12": "comedy",
  "2": "crime",
  "24": "documentary",
  "1": "drama",
  "16": "family",
  "10": "sciFi",
  "8": "fantasy",
  "9": "war",
  "7": "horror",
  "25": "kids",
  "26": "koreanDrama",
  "6": "mystery",
  "14": "music",
  "18": "reality",
  "15": "romance",
  "3": "sciFiFantasy",
  "23": "soap",
  "22": "history",
  "21": "televisionFilm",
  "5": "thriller",
  "17": "warPolitics",
  "20": "western",
};

export async function scSearch(
  _offset: number,
  values: FormValues<typeof schemaQueryTitle>,
) {
  const tld = getCookie("scTld") ?? SC_DEFAULT_TLD;

  const offset = z.number().int().gte(0).lte(1000).parse(_offset);
  const { age, genre, kind, search, quality, service, year } =
    schemaQueryTitle.parse(values);

  const url = new URL(`https://streamingcommunity.${tld}/api/archive`);
  url.searchParams.append("sort", "created_at");
  url.searchParams.append("offset", offset.toString());

  if (age !== undefined) url.searchParams.append("age", age);

  if (genre !== undefined) url.searchParams.append("genre[]", genre);

  if (kind !== undefined) url.searchParams.append("kind", kind);

  if (search !== undefined) url.searchParams.append("search", search);

  if (quality !== undefined) url.searchParams.append("quality", quality);

  if (service !== undefined) url.searchParams.append("service", service);

  if (year !== undefined) url.searchParams.append("year", year);

  const result = await fetch(url);
  if (result.status !== 200) {
    console.log(result, await result.text());
    throw new Error("The request went bad");
  }
  const json = await result.json();

  const entries = json.titles;

  return {
    data: (entries as any[]).map(
      (it: any) =>
        ({
          id: it.id,
          poster:
            it.images.find((it: any) => it.type === "poster")?.filename ??
            it.images.find((it: any) => it.type === "cover").filename,
        }) satisfies z.infer<typeof schemaQueuedTitle> as z.infer<
          typeof schemaQueuedTitle
        >,
    ),
    total: -1,
  };
}

export async function scFuzzySearch(
  _offset: number,
  values: FormValues<typeof schemaFuzzyQueryTitle>,
) {
  const tld = getCookie("scTld") ?? SC_DEFAULT_TLD;

  const offset = z.number().int().gte(0).lte(120).parse(_offset);
  const { q } = schemaFuzzyQueryTitle.parse(values);

  const url = new URL(`https://streamingcommunity.${tld}/api/search`);
  url.searchParams.append("offset", offset.toString());

  if (q !== undefined) url.searchParams.append("q", q);

  const result = await fetch(url);
  if (result.status !== 200) {
    console.log(result, await result.text());
    throw new Error("The request went bad");
  }
  const json = await result.json();

  const entries = json.data;

  return {
    data: (entries as any[]).map(
      (it: any) =>
        ({
          id: it.id,
          poster:
            it.images.find((it: any) => it.type === "poster")?.filename ??
            it.images.find((it: any) => it.type === "cover").filename,
        }) satisfies z.infer<typeof schemaQueuedTitle> as z.infer<
          typeof schemaQueuedTitle
        >,
    ),
    total: -1,
  };
}

export async function scUpcoming(_offset: number, tld: string) {
  const offset = z.number().int().gte(0).parse(_offset);

  const url = new URL(`https://streamingcommunity.${tld}/api/sliders/fetch`);

  const body = {
    sliders: [
      {
        name: "upcoming",
        offset: offset,
      },
    ],
  };

  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const result = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: headers,
    next: { revalidate: 3600 * 24 },
  });
  if (result.status !== 200) {
    console.log(result, await result.text());
    throw new Error("The request went bad");
  }
  const json = await result.json();

  const entries = json[0].titles;

  return {
    data: (entries as any[]).map(
      (it) =>
        ({
          id: it.id,
          poster:
            it.images.find((it: any) => it.type === "poster")?.filename ??
            it.images.find((it: any) => it.type === "cover").filename,
        }) satisfies z.infer<typeof schemaQueuedTitle> as z.infer<
          typeof schemaQueuedTitle
        >,
    ),
    total: -1,
  };
}

export async function scFeatured(tld: string) {
  async function get(url: string) {
    const result = await fetch(url, {
      next: { revalidate: 3600 * 48 },
    });
    if (result.status !== 200) {
      console.log(result, await result.text());
      throw new Error("The request went bad");
    }

    const text = await result.text();
    const data = DATA_PAGE_REGEX.exec(text)![DATA_PAGE_GROUP_INDEX];

    const json = JSON.parse(decodeUtf8(decodeHtml(data!)));
    return {
      id: json.props.title.id,
      poster:
        json.props.title.images.find((it: any) => it.type === "poster")
          ?.filename ??
        json.props.title.images.find((it: any) => it.type === "cover").filename,
    } satisfies z.infer<typeof schemaQueuedTitle> as z.infer<
      typeof schemaQueuedTitle
    >;
  }

  return await Promise.all([
    get(`https://streamingcommunity.${tld}/`),
    get(`https://streamingcommunity.${tld}/serie-tv`),
    get(`https://streamingcommunity.${tld}/film`),
  ]);
}

export async function scCheck(tld: string) {
  return await urlConnectionExists(
    // `https://streamingcommunity.${tld}/api/search`,
    `https://cdn.streamingcommunity.${tld}/images/03fc83e6-2326-437f-86c9-9240f21dd625.webp`,
  );
}

export async function scTitle(tld: string, id: number) {
  const result = await fetch(
    `https://streamingcommunity.${tld}/titles/${id}-dummy`,
  );
  if (result.status !== 200) {
    console.log(result, await result.text());
    throw new Error("The request went bad");
  }

  const text = await result.text();
  const data = DATA_PAGE_REGEX.exec(text)![DATA_PAGE_GROUP_INDEX];

  const json = JSON.parse(decodeUtf8(decodeHtml(data!)));
  return {
    release_date: json.props.title.release_date,
    status: json.props.title.status,
    scws_id: json.props.title.scws_id,
    imdb_id: json.props.title.imdb_id,
    netflix_id: json.props.title.netflix_id,
    prime_id: json.props.title.prime_id,
    disney_id: json.props.title.disney_id,
    // now_id: json.props.title.now_id,
    apple_id: json.props.title.apple_id,
    // paramount_id: json.props.title.paramount_id,
    seasons: json.props.title.seasons.map(
      (it: any) =>
        ({
          id: it.id,
          number: it.number,
          episodes_count: it.episodes_count,
          release_date: it.release_date,
        }) satisfies z.infer<typeof schemaTitle>["seasons"][number] as z.infer<
          typeof schemaTitle
        >["seasons"][number],
    ),
    genres: json.props.title.genres.map((it: any) => it.id.toString()),
    keywords: json.props.title.keywords.map((it: any) => it.name),
    related: json.props.sliders[0].titles.map(
      (it: any) =>
        ({
          id: it.id,
          poster:
            it.images.find((it: any) => it.type === "poster")?.filename ??
            it.images.find((it: any) => it.type === "cover").filename,
        }) satisfies z.infer<typeof schemaTitle>["related"][number] as z.infer<
          typeof schemaTitle
        >["related"][number],
    ),
    id: json.props.title.id,
    background: json.props.title.images.find(
      (it: any) => it.type === "background",
    ).filename,
    poster:
      json.props.title.images.find((it: any) => it.type === "poster")
        ?.filename ??
      json.props.title.images.find((it: any) => it.type === "cover").filename,
    logo: json.props.title.images.find((it: any) => it.type === "logo")
      ?.filename,
    type: json.props.title.type,
  } satisfies z.infer<typeof schemaTitle> as z.infer<typeof schemaTitle>;
}

export async function scSeason(tld: string, id: number, number: number) {
  const result = await fetch(
    `https://streamingcommunity.${tld}/titles/${id}-dummy/stagione-${number}`,
  );
  if (result.status !== 200) {
    console.log(result, await result.text());
    throw new Error("The request went bad");
  }

  const text = await result.text();
  const data = DATA_PAGE_REGEX.exec(text)![DATA_PAGE_GROUP_INDEX];

  const json = JSON.parse(decodeUtf8(decodeHtml(data!)));
  return {
    id: json.props.loadedSeason.id,
    release_date: json.props.loadedSeason.release_date,
    episodes: json.props.loadedSeason.episodes.map(
      (it: any) =>
        ({
          id: it.id,
          number: it.number,
          scws_id: it.scws_id,
          cover: it.images[0].filename,
        }) satisfies z.infer<
          typeof schemaSeason
        >["episodes"][number] as z.infer<
          typeof schemaSeason
        >["episodes"][number],
    ),
  } satisfies z.infer<typeof schemaSeason> as z.infer<typeof schemaSeason>;
}

export async function scPlaylist(
  tld: string,
  scwsId: number,
  titleId: number,
  episodeId?: number,
) {
  async function get(url: string) {
    const result = await fetch(url, {
      // next: { revalidate: revalidate },
    });
    if (result.status !== 200) {
      console.log(result, await result.text());
      throw new Error("The request went bad");
    }

    const text = await result.text();
    return text;
  }

  let url = new URL(`https://streamingcommunity.${tld}/watch/${titleId}`);

  if (episodeId !== undefined)
    url.searchParams.append("e", episodeId.toString());

  let text = await get(url.toString());
  let data = new RegExp('<div id="app" data-page="(.+)">.+<\/div>').exec(text)![
    DATA_PAGE_GROUP_INDEX
  ];
  let json = JSON.parse(decodeUtf8(decodeHtml(data!)));

  let embedUrl = json.props.embedUrl;
  // console.log(embedUrl);

  text = await get(embedUrl);
  data = new RegExp('(https.+)"').exec(text)![1];

  embedUrl = data.replaceAll("&amp;", "&");
  // console.log(embedUrl);

  text = await get(embedUrl);
  // writeFileSync("what we do in the shadows s4 e1.html", text);
  const result = new RegExp(
    "token': '(.+)',\n[ ]+'expires': '(.+)',\n.+\n.+\n.+url: '(.+)',\n[ ]+}\n[ ]+window.canPlayFHD = (false|true)",
  ).exec(text)!;

  const token = result[1];
  const expires = result[2];
  url = new URL(result[3]);
  const canPlayFHD = result[4];
  const b = url.searchParams.get("b");

  url = new URL(`https://vixcloud.co/playlist/${scwsId}`);
  url.searchParams.append("token", token);
  url.searchParams.append("expires", expires);
  if (b !== null) url.searchParams.append("b", b);
  if (canPlayFHD === "true") url.searchParams.append("h", "1");

  return url.toString();
}

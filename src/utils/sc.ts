import schemaEntry__Query__DB from "@/schemas/schemaEntry__Query__DB";
import schemaEntry__Query__Form from "@/schemas/schemaEntry__Query__Form";
import schemaEntry__Upcoming from "@/schemas/schemaEntry__Upcoming";
import { decodeHtml, decodeUtf8 } from "@/utils/encoding";
import { FormValues } from "@/utils/form";
import { urlConnectionExists } from "@/utils/url";
import { getCookie } from "cookies-next";
import { z } from "zod";

export async function scSearch(
  _offset: number,
  values: FormValues<typeof schemaEntry__Query__Form>,
) {
  const tld = getCookie("scTld") ?? SC_DEFAULT_TLD;

  const offset = z.number().int().gte(0).lte(1000).parse(_offset);
  const { age, genre, kind, search, quality, service, year } =
    schemaEntry__Query__Form.parse(values);

  const url = new URL(`https://streamingcommunity.${tld}/api/archive`);
  url.searchParams.append("sort", "created_at");
  url.searchParams.append("offset", offset.toString());

  if (age !== undefined) url.searchParams.append("age", age);

  if (genre !== undefined) url.searchParams.append("genre", genre);

  if (kind !== undefined) url.searchParams.append("kind", kind);

  if (search !== undefined) url.searchParams.append("search", search);

  if (quality !== undefined) url.searchParams.append("quality", quality);

  if (service !== undefined) url.searchParams.append("service", service);

  if (year !== undefined) url.searchParams.append("year", year);

  const result = await fetch(url);
  if (result.status !== 200) {
    console.log(await result.text());
    throw new Error("The request went bad");
  }
  const json = await result.json();

  const entries = json.titles as z.infer<typeof schemaEntry__Query__DB>[];

  return { data: entries, total: -1 };
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
    console.log(await result.text());
    throw new Error("The request went bad");
  }
  const json = await result.json();

  const entries = json[0].titles as z.infer<typeof schemaEntry__Upcoming>[];

  return {
    // TODO: Temporary
    data: entries.map((it) => ({
      id: it.id,
      slug: it.slug,
      images: it.images.filter((it) => it.type === "poster"),
    })),
    total: -1,
  };
}

export async function scFeatured(tld: string) {
  async function get(url: string) {
    const result = await fetch(url, {
      next: { revalidate: 3600 * 48 },
    });
    if (result.status !== 200) {
      console.log(await result.text());
      throw new Error("The request went bad");
    }

    const text = await result.text();
    const data = DATA_PAGE_REGEX.exec(text)?.[DATA_PAGE_GROUP_INDEX];

    const json = JSON.parse(decodeUtf8(decodeHtml(data!)));
    return {
      id: json.props.title.id,
      slug: json.props.title.slug,
      images: json.props.title.images.filter((it: any) => it.type === "poster"),
    } satisfies Pick<
      z.infer<typeof schemaEntry__Query__DB>,
      "id" | "slug" | "images"
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
    `https://streamingcommunity.${tld}/api/search`,
  );
}

const DATA_PAGE_REGEX = new RegExp('<div id="app" data-page="(.+)"><\/div>');
const DATA_PAGE_GROUP_INDEX = 1;
export const SC_DEFAULT_TLD = "family";

const scwsUrl = "https://vixcloud.co";

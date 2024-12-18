import schemaEntry__Query__DB from "@/schemas/schemaEntry__Query__DB";
import schemaEntry__Query__Form from "@/schemas/schemaEntry__Query__Form";
import schemaEntry__Upcoming from "@/schemas/schemaEntry__Upcoming";
import { FormValues } from "@/utils/form";
import { z } from "zod";

export async function scSearch(
  _offset: number,
  values: FormValues<typeof schemaEntry__Query__Form>,
) {
  const offset = z.number().int().gte(0).lte(1000).parse(_offset);
  const { age, genre, kind, search, quality, service, year } =
    schemaEntry__Query__Form.parse(values);

  const url = new URL(`https://streamingcommunity.family/api/archive`);
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

export async function scUpcoming(_offset: number) {
  const offset = z.number().int().gte(0).parse(_offset);

  const url = new URL(`https://streamingcommunity.family/api/sliders/fetch`);

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
      images: it.images,
    })),
    total: -1,
  };
}

export async function scFeatured() {
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

    const json = JSON.parse(decode_utf8(decode_html(data!)));
    return {
      id: json.props.title.id,
      slug: json.props.title.slug,
      images: json.props.title.images,
    } satisfies Pick<
      z.infer<typeof schemaEntry__Query__DB>,
      "id" | "slug" | "images"
    >;
  }

  return await Promise.all([
    get(`https://streamingcommunity.family/`),
    get(`https://streamingcommunity.family/serie-tv`),
    get(`https://streamingcommunity.family/film`),
  ]);
}

const DATA_PAGE_REGEX = new RegExp('<div id="app" data-page="(.+)"><\/div>');
const DATA_PAGE_GROUP_INDEX = 1;

export function decode_utf8(utf8_encoded: string): string {
  return decode_with_table(utf8_encoded, {
    "\u00e8": "è",
    "\u0027": "'",
  });
}

export function decode_html(html_encoded: string): string {
  return decode_with_table(html_encoded, {
    "&quot;": '"',
    "&#39;": "'",
    "&#039;": "'",
    "&amp;": "&",
  });
}

function decode_with_table(s: string, table: Record<string, string>): string {
  let replace = s;
  for (const key in table) {
    replace = replace.replace(new RegExp(key, "g"), table[key]);
  }
  return replace;
}

const location = "https://streamingcommunity.family";
const scws_url = "https://vixcloud.co";
const cdn_url = "https://cdn.streamingcommunity.family";

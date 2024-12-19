import Page from "@/app/[locale]/[id]/client";
import schemaFetchTitle from "@/schemas/schemaFetchTitle";
import { getDictionary } from "@/utils/locale";
import { genresMap } from "@/utils/sc";

export default async function RootPage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;
  const values = schemaFetchTitle.parse({ id: Number(params.id) });
  const dictionary = await getDictionary(params.locale);

  return (
    <Page
      params={values}
      dictionary={{
        genres: {
          "13": dictionary.queryForm.genre[
            genresMap["13"] as keyof typeof dictionary.queryForm.genre
          ],
          "19": dictionary.queryForm.genre[
            genresMap["19"] as keyof typeof dictionary.queryForm.genre
          ],
          "11": dictionary.queryForm.genre[
            genresMap["11"] as keyof typeof dictionary.queryForm.genre
          ],
          "4": dictionary.queryForm.genre[
            genresMap["4"] as keyof typeof dictionary.queryForm.genre
          ],
          "12": dictionary.queryForm.genre[
            genresMap["12"] as keyof typeof dictionary.queryForm.genre
          ],
          "2": dictionary.queryForm.genre[
            genresMap["2"] as keyof typeof dictionary.queryForm.genre
          ],
          "24": dictionary.queryForm.genre[
            genresMap["24"] as keyof typeof dictionary.queryForm.genre
          ],
          "1": dictionary.queryForm.genre[
            genresMap["1"] as keyof typeof dictionary.queryForm.genre
          ],
          "16": dictionary.queryForm.genre[
            genresMap["16"] as keyof typeof dictionary.queryForm.genre
          ],
          "10": dictionary.queryForm.genre[
            genresMap["10"] as keyof typeof dictionary.queryForm.genre
          ],
          "8": dictionary.queryForm.genre[
            genresMap["8"] as keyof typeof dictionary.queryForm.genre
          ],
          "9": dictionary.queryForm.genre[
            genresMap["9"] as keyof typeof dictionary.queryForm.genre
          ],
          "7": dictionary.queryForm.genre[
            genresMap["7"] as keyof typeof dictionary.queryForm.genre
          ],
          "25": dictionary.queryForm.genre[
            genresMap["25"] as keyof typeof dictionary.queryForm.genre
          ],
          "26": dictionary.queryForm.genre[
            genresMap["26"] as keyof typeof dictionary.queryForm.genre
          ],
          "6": dictionary.queryForm.genre[
            genresMap["6"] as keyof typeof dictionary.queryForm.genre
          ],
          "14": dictionary.queryForm.genre[
            genresMap["14"] as keyof typeof dictionary.queryForm.genre
          ],
          "18": dictionary.queryForm.genre[
            genresMap["18"] as keyof typeof dictionary.queryForm.genre
          ],
          "15": dictionary.queryForm.genre[
            genresMap["15"] as keyof typeof dictionary.queryForm.genre
          ],
          "3": dictionary.queryForm.genre[
            genresMap["3"] as keyof typeof dictionary.queryForm.genre
          ],
          "23": dictionary.queryForm.genre[
            genresMap["23"] as keyof typeof dictionary.queryForm.genre
          ],
          "22": dictionary.queryForm.genre[
            genresMap["22"] as keyof typeof dictionary.queryForm.genre
          ],
          "21": dictionary.queryForm.genre[
            genresMap["21"] as keyof typeof dictionary.queryForm.genre
          ],
          "5": dictionary.queryForm.genre[
            genresMap["5"] as keyof typeof dictionary.queryForm.genre
          ],
          "17": dictionary.queryForm.genre[
            genresMap["17"] as keyof typeof dictionary.queryForm.genre
          ],
          "20": dictionary.queryForm.genre[
            genresMap["20"] as keyof typeof dictionary.queryForm.genre
          ],
        },
        titleStatus: dictionary.titleStatus,
        fetching: dictionary.fetching,
        loadingNoCache: dictionary.loadingNoCache,
        titlePage: dictionary.titlePage,
      }}
    />
  );
}

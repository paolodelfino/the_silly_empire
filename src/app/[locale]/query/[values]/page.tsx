import Page from "@/app/[locale]/query/[values]/client";
import { getDictionary } from "@/utils/locale";

export default async function RootPage(props: {
  params: Promise<{ locale: string; values: string }>;
}) {
  const params = await props.params;
  const dictionary = await getDictionary(params.locale);
  return (
    <Page
      values={params.values}
      dictionary={{
        fetching: dictionary.fetching,
        loadingNoCache: dictionary.loadingNoCache,
      }}
    />
  );
}

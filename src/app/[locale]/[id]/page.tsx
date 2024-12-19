import Page from "@/app/[locale]/[id]/client";
import schemaFetchTitle from "@/schemas/schemaFetchTitle";

export default async function RootPage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;
  const values = schemaFetchTitle.parse({ id: Number(params.id) });

  // const dictionary = await getDictionary(params.locale);
  return (
    <Page
      params={values}
      // params={{ id: params.id }}
      // dictionary={{
      //   home: dictionary.home,
      //   fetching: dictionary.fetching,
      //   loadingNoCache: dictionary.loadingNoCache,
      // }}
    />
  );
}

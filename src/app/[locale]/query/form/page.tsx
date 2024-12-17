import Page from "@/app/[locale]/query/form/client";
import { getDictionary } from "@/utils/locale";

export default async function RootPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const dictionary = (await getDictionary(params.locale)).Query;
  return <Page dictionary={dictionary} />;
}

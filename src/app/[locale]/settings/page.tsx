import Page from "@/app/[locale]/settings/client";
import { getDictionary } from "@/utils/locale";

export default async function RootPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const dictionary = await getDictionary(params.locale);
  return (
    <Page
      dictionary={{ settings: dictionary.settings, save: dictionary.save }}
    />
  );
}

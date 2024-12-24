import { ColoredSuperTitle } from "@/components/ui/SuperTitle";
import Text from "@/components/ui/Text";
import { getDictionary } from "@/utils/locale";

export default async function Page(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const dictionary = (await getDictionary(params.locale)).help;
  return (
    <div>
      <ColoredSuperTitle>{dictionary.title}</ColoredSuperTitle>

      <Text>{dictionary.rule1}</Text>

      <Text>{dictionary.rule2}</Text>

      <Text>{dictionary.rule3}</Text>

      <Text>{dictionary.rule4}</Text>

      <Text>{dictionary.rule5}</Text>
    </div>
  );
}

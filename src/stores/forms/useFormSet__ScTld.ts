import { fieldText } from "@/components/form_ui/FieldText";
import schemaScTld__Set from "@/schemas/schemaScTld__Set";
import { createForm } from "@/utils/form";

const useFormSet__ScTld = createForm(
  schemaScTld__Set,
  undefined as unknown as ReturnType<typeof init__formSet__ScTld>,
  { isOutdated: false },
);
export default useFormSet__ScTld;

export function init__formSet__ScTld({ scTld }: { scTld: string }) {
  return { value: fieldText(scTld) } as const;
}

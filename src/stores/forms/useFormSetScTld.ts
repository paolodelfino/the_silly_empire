import { fieldText } from "@/components/form_ui/FieldText";
import schemaSetScTld from "@/schemas/schemaSetScTld";
import { createForm } from "@/utils/form";

const useFormSetScTld = createForm(
  schemaSetScTld,
  undefined as unknown as ReturnType<typeof formSetScTld>,
  {},
);
export default useFormSetScTld;

export function formSetScTld({ scTld }: { scTld: string }) {
  return { value: fieldText(scTld) } as const; // TODO: Non possiamo semplicemente settarlo successivamente? Capisco che adesso c'è questa init feature, ma resta che non funziona sul server
}

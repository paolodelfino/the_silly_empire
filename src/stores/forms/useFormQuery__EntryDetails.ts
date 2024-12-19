import { FieldSelect__Type } from "@/components/form_ui/FieldSelect";
import { createForm } from "@/utils/form";
import { z } from "zod";

const useFormQuery__EntryDetails = createForm(
  z.object({}),
  {},
  {
    lastId: undefined as number | undefined,
    season: undefined as undefined | FieldSelect__Type,
  },
);
export default useFormQuery__EntryDetails;

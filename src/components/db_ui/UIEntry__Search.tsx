import { LinkButton } from "@/components/ui/Button";
import schemaEntry__Search__DB from "@/schemas/schemaEntry__Search__DB";
import { cn } from "@/utils/cn";
import { useMemo } from "react";
import { z } from "zod";

export default function UIEntry__Search({
  data,
  id,
}: {
  id?: string;
  data: z.infer<typeof schemaEntry__Search__DB>;
}) {
  const poster = useMemo(
    () => data.images.find((it) => it.type === "poster"),
    [data.images],
  );

  return (
    <LinkButton className="shrink-0 overflow-hidden [&.hover]:bg-black">
      {({ className }) => (
        <img
          id={id}
          className={cn(className)}
          src={`https://cdn.streamingcommunity.family/images/${poster!.filename}`}
        />
      )}
    </LinkButton>
  );
}

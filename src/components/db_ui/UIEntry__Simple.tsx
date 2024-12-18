import { ScContext } from "@/components/ScProvider";
import { LinkButton } from "@/components/ui/Button";
import schemaEntry__Query__DB from "@/schemas/schemaEntry__Query__DB";
import { cn } from "@/utils/cn";
import { useContext, useMemo } from "react";
import { z } from "zod";

export default function UIEntry__Simple({
  data,
  id,
}: {
  id?: string;
  data: Pick<z.infer<typeof schemaEntry__Query__DB>, "images">;
}) {
  const poster = useMemo(
    () => data.images.find((it) => it.type === "poster"),
    [data.images],
  );
  const sc = useContext(ScContext);

  return (
    <LinkButton className="aspect-auto w-32 shrink-0 overflow-hidden sm:w-auto [&.hover]:bg-black">
      {({ className }) => (
        <img
          alt=""
          id={id}
          className={cn(className)}
          src={`${sc!.cdn}/images/${poster!.filename}`}
        />
      )}
    </LinkButton>
  );
}

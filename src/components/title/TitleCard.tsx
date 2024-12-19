import { LanguageContext } from "@/components/LanguageProvider";
import { ScContext } from "@/components/ScProvider";
import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { useContext } from "react";

export default function TitleCard({
  data,
  id,
}: {
  id?: string;
  data: {
    poster: string;
    id: number;
  };
}) {
  const sc = useContext(ScContext);
  const locale = useContext(LanguageContext);

  return (
    <LinkButton
      href={`/${locale!}/${data.id}`}
      className="aspect-auto h-fit w-32 shrink-0 overflow-hidden sm:w-auto [&.hover]:bg-black"
    >
      {({ className }) => (
        <img
          alt=""
          id={id}
          className={cn(className)}
          src={`${sc!.cdn}/images/${data.poster}`}
        />
      )}
    </LinkButton>
  );
}

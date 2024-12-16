import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { Dictionary } from "@/utils/dictionary";

export default function Toolbar({
  variant,
  authenticated,
  dictionary,
}: {
  variant: "monitor" | "mobile";
  authenticated: boolean;
  dictionary: Dictionary["/home"]["Toolbar"];
}) {
  if (!authenticated) return undefined;

  return (
    <nav
      className={cn(
        variant === "mobile" &&
          "fixed bottom-0 w-full bg-black pb-safe-bottom pl-safe-left pr-safe-right",
        variant === "monitor" && "sticky top-0 h-full max-h-screen",
      )}
    >
      <ul
        className={cn(
          variant === "mobile" &&
            "mx-auto flex w-full max-w-4xl gap-2 overflow-x-auto overflow-y-hidden p-2",
          variant === "monitor" &&
            "flex h-full max-h-screen flex-col gap-2 overflow-y-auto p-4 pb-48",
        )}
      >
        <LinkButton
          href="/home"
          className={cn(
            variant === "monitor" && "min-w-32 text-start",
            variant === "mobile" && "shrink-0",
          )}
        >
          {dictionary.Route.home}
        </LinkButton>
        <LinkButton
          href="/settings"
          className={cn(
            variant === "monitor" && "min-w-32 text-start",
            "[&.hover]:bg-gray-500 [&.hover_p]:text-white",
            variant === "mobile" && "shrink-0",
          )}
        >
          {dictionary.Route.settings}
        </LinkButton>
        {process.env.NODE_ENV === "development" && (
          <LinkButton
            href="/test"
            className={cn(
              variant === "monitor" && "min-w-32 text-start",
              "[&.hover]:bg-blue-500 [&.hover_p]:text-white",
              variant === "mobile" && "shrink-0",
            )}
          >
            Test
          </LinkButton>
        )}
      </ul>
    </nav>
  );
}

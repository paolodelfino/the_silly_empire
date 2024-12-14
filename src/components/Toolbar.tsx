import { LinkButton2 as LinkButton } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export default function Toolbar({
  variant,
}: {
  variant: "monitor" | "mobile";
}) {
  return (
    <nav
      className={cn(
        variant === "mobile" && "fixed bottom-0 w-full bg-black",
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
          href="/"
          className={cn(variant === "monitor" && "min-w-32")}
        >
          Home
        </LinkButton>
        <LinkButton
          href="/settings"
          className={cn(
            variant === "monitor" && "min-w-32",
            "[&.hover]:bg-gray-500 [&.hover_p]:text-white",
          )}
        >
          Settings
        </LinkButton>
      </ul>
    </nav>
  );
}

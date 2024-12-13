import { cn } from "@/utils/cn";

export default function Text({
  children,
  className,
  style,
  ref,
  disabled,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLParagraphElement>;
  disabled?: boolean;
}) {
  return (
    <p
      ref={ref}
      data-disabled={disabled}
      style={style}
      className={cn(
        "hyphens-auto whitespace-pre-wrap break-words p-4 text-justify text-base text-neutral-300 transition-opacity data-[disabled=true]:opacity-50",
        className,
      )}
    >
      {children}
    </p>
  );
}

import { cn } from "@/utils/cn";

export default function SuperTitle({
  children,
  className,
  style,
  ref,
  disabled,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLHeadingElement>;
  disabled?: boolean;
}) {
  return (
    <h1
      ref={ref}
      data-disabled={disabled}
      style={style}
      className={cn(
        "pl-8 text-2xl leading-[4rem] transition-opacity data-[disabled=true]:opacity-50",
        className,
      )}
    >
      {children}
    </h1>
  );
}

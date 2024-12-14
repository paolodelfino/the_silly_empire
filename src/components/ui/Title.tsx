import { cn } from "@/utils/cn";

export default function Title({
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
    <h2
      ref={ref}
      data-disabled={disabled}
      style={style}
      className={cn(
        "pl-4 text-lg leading-[3rem] transition-opacity data-[disabled=true]:opacity-50",
        className,
      )}
    >
      {children}
    </h2>
  );
}

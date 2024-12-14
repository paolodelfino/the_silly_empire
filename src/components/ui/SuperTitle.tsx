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

export function SuperTitle2({
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
        "my-4 ml-12 w-fit text-2xl leading-[calc(100%+2rem)] transition-opacity data-[disabled=true]:opacity-50",
        "relative",
        className,
      )}
    >
      <span
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "h-full w-[calc(100%+3rem)] rounded-full",
          "bg-gray-500 mix-blend-screen",
        )}
      />
      <p>{children}</p>
    </h1>
  );
}

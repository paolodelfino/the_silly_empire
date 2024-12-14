import { cn } from "@/utils/cn";

export function SuperTitle({
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

export function ColoredSuperTitle({
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
        "my-4 ml-12 w-fit text-2xl leading-[calc(100%+1rem)] transition-opacity data-[disabled=true]:opacity-50",
        "relative",
        className,
      )}
    >
      <span
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "h-full w-[calc(100%+5rem)]",
          "bg-gray-500 mix-blend-screen",
        )}
      >
        <svg
          className={cn(
            "absolute -left-px",
            "top-1/2 -translate-y-1/2 rotate-90",
            "h-[calc(100%+1rem)]",
            "w-auto",
          )}
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 60 Q30 10 60 60 Z" fill="black" />
        </svg>
        <svg
          className={cn(
            "absolute -right-px",
            "top-1/2 -translate-y-1/2 rotate-90",
            "h-[calc(100%+1rem)]",
            "w-auto",
          )}
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0 Q30 50 60 0 Z" fill="black" />
        </svg>
      </span>
      <p>{children}</p>
    </h1>
  );
}

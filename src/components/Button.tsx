import Link, { LinkProps } from "next/link";
import { ClassValue, tv, VariantProps } from "tailwind-variants";

// TODO: Problema con il line clamp
// TODO: Forse dovremmo giocare con una inner shadow/border, così da eliminare il problema del bordo che viene trimmato fuori
export const styles = tv({
  slots: {
    button: "flex gap-2 text-start m-px",
    startContentContainer: "flex-shrink-0",
    endContentContainer: "ml-auto flex-shrink-0",
    text: "overflow-hidden text-ellipsis hyphens-auto break-words",
  },
  variants: {
    color: {
      ghost: {
        button:
          "ring-neutral-600 data-[disabled=true]:text-neutral-500 active:!bg-neutral-700 active:!ring-1 hover:bg-neutral-600 hover:ring-0 data-[disabled=true]:pointer-events-none",
      },
      default: {
        button:
          "bg-neutral-800 ring-1 ring-neutral-600 data-[disabled=true]:text-neutral-500 active:!bg-neutral-700 active:!ring-1 hover:bg-neutral-600 hover:ring-0 data-[disabled=true]:pointer-events-none",
      },
      accent: {
        button:
          "bg-blue-500 ring-1 ring-blue-300 data-[disabled=true]:text-blue-200 active:!bg-blue-300 active:!ring-1 hover:bg-blue-300 hover:ring-0 data-[disabled=true]:pointer-events-none",
      },
      danger: {
        button:
          "bg-red-800 ring-1 ring-red-600 data-[disabled=true]:text-red-500 active:!bg-red-700 active:!ring-1 hover:bg-red-600 hover:ring-0 data-[disabled=true]:pointer-events-none",
      },
    },
    size: {
      default: { button: "rounded-xl py-1 px-2" },
      large: { button: "p-3" },
    },
    multiple: {
      true: { text: "" },
      false: { text: "whitespace-nowrap" },
    },
    full: {
      // true: { button: "w-[calc(100%-1px)]" }, TODO: Perché avevo messo 1px invece di 2?
      true: { button: "w-[calc(100%-2px)]" },
      false: { button: "w-min" },
    },
  },
  compoundVariants: [
    {
      size: "default",
      color: "ghost",
      className: "rounded-none",
    },
  ],
});

export default function Button({
  color = "default",
  size = "default",
  type = "button",
  multiple = false,
  startContent,
  endContent,
  children,
  classNames,
  full = false,
  disabled,
  ...rest
}: {
  children: React.ReactNode;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  className?: never;
  classNames?: {
    [key in keyof ReturnType<typeof styles>]?: ClassValue;
  };
} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  VariantProps<typeof styles>) {
  const { button, startContentContainer, endContentContainer, text } = styles({
    color,
    size,
    multiple,
    full,
  });

  return (
    <button
      className={button({ className: classNames?.button })}
      type={type}
      disabled={disabled}
      data-disabled={disabled === undefined ? false : disabled}
      {...rest}
    >
      {startContent && (
        <div
          className={startContentContainer({
            className: classNames?.startContentContainer,
          })}
        >
          {startContent}
        </div>
      )}
      <span className={text({ className: classNames?.text })}>{children}</span>
      {endContent && (
        <div
          className={endContentContainer({
            className: classNames?.endContentContainer,
          })}
        >
          {endContent}
        </div>
      )}
    </button>
  );
}

export function ButtonLink({
  color = "default",
  size = "default",
  startContent,
  children,
  classNames,
  full = false,
  disabled,
  endContent,
  ...rest
}: {
  children: React.ReactNode;
  endContent?: React.ReactNode;
  startContent?: React.ReactNode;
  className?: never;
  classNames?: {
    [key in keyof ReturnType<typeof styles>]?: ClassValue;
  };
  disabled?: boolean;
} & React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
> &
  LinkProps &
  VariantProps<typeof styles>) {
  const { button, text, endContentContainer, startContentContainer } = styles({
    color,
    size,
    full,
  });

  return (
    <Link
      className={button({ className: classNames?.button })}
      data-disabled={disabled === undefined ? false : disabled}
      {...rest}
    >
      {startContent && (
        <div
          className={startContentContainer({
            className: classNames?.startContentContainer,
          })}
        >
          {startContent}
        </div>
      )}
      <span className={text({ className: classNames?.text })}>{children}</span>
      {endContent && (
        <div
          className={endContentContainer({
            className: classNames?.endContentContainer,
          })}
        >
          {endContent}
        </div>
      )}
    </Link>
  );
}

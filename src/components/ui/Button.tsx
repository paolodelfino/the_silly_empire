import { cn } from "@/utils/cn";

export default function IconButton({
  children,
  disabled = false,
  refs,
  sound = true,
  anim = true,
  classNames,
  styles,
  down,
  downAfter,
  leave,
  leaveAfter,
  over,
  overAfter,
}: {
  children?: string | ((className: string) => React.ReactNode);
  disabled?: boolean;
  sound?: boolean;
  anim?: boolean;
  classNames?: {
    button?: string;
    p?: string;
    span?: string;
  };
  styles?: {
    button?: React.CSSProperties;
    p?: React.CSSProperties;
    span?: React.CSSProperties;
  };
  refs?: {
    button?: React.Ref<HTMLButtonElement>;
    p?: React.Ref<HTMLParagraphElement>;
    span?: React.Ref<HTMLSpanElement>;
  };
  down?: (e: React.PointerEvent<HTMLButtonElement>) => boolean;
  downAfter?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  over?: (e: React.PointerEvent<HTMLButtonElement>) => boolean;
  overAfter?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  leave?: (e: React.PointerEvent<HTMLButtonElement>) => boolean;
  leaveAfter?: (e: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      ref={refs?.button}
      disabled={disabled}
      style={styles?.button}
      className={cn(
        "transition-opacity disabled:opacity-50",
        "size-10",
        "relative",
        "[&.hover_span]:size-[100%] [&.hover_span]:opacity-100",
        typeof children === "string"
          ? "[&.hover_p]:scale-110"
          : "[&.hover_svg]:scale-110",
      )}
      onPointerDown={(e) => {
        if (down !== undefined && !down(e)) return;

        if (sound) {
          const audio = new Audio("/sound2.ogg");
          audio.oncanplay = () => {
            audio.volume = disabled ? 0.05 : 0.5;
            // TODO: Maybe do something about the error. Also because you can catch NotAllowedError even only on the first click, which means from the second click onward it be play the sound
            audio.play().catch((e) => console.log(e));
          };
        }

        if (anim) {
          const button = e.target as HTMLButtonElement;
          button.animate(
            [{ transform: "scale(0.95)" }, { transform: "scale(1.05)" }],
            { duration: 105 },
          );
        }

        downAfter?.(e);
      }}
      onPointerOver={(e) => {
        if (over !== undefined && !over(e)) return;

        if (e.pointerType === "mouse") {
          const button = e.target as HTMLButtonElement;
          button.classList.add("hover");
        }

        overAfter?.(e);
      }}
      onPointerLeave={(e) => {
        if (leave !== undefined && !leave(e)) return;

        if (e.pointerType === "mouse") {
          const button = e.target as HTMLButtonElement;
          button.classList.remove("hover");
        }

        leaveAfter?.(e);
      }}
    >
      {typeof children === "string" ? (
        <p
          ref={refs?.p}
          style={styles?.p}
          className={cn(
            "pointer-events-none",
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "transition-transform",
            "size-8",
            "flex items-center justify-center",
            "z-0",
            "origin-bottom",
            classNames?.p,
          )}
        >
          {children}
        </p>
      ) : (
        children?.(
          cn(
            "pointer-events-none",
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "transition-transform",
            "z-[1]",
          ),
        )
      )}
      <span
        ref={refs?.span}
        style={styles?.span}
        className={cn(
          "pointer-events-none",
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "size-[50%] rounded-full bg-white opacity-0 transition-[width,height,opacity]",
          "z-0 mix-blend-difference",
          classNames?.span,
        )}
      />
    </button>
  );
}

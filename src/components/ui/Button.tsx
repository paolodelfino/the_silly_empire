"use client";

import { IcBaselineError } from "@/components/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import Text from "@/components/ui/Text";
import { cn } from "@/utils/cn";
import { Props } from "@/utils/component";
import { rem } from "@/utils/css";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export function IconButton({
  children,
  disabled = false,
  refs,
  sound = true,
  anim = true,
  classNames,
  styles,
  down,
  downAfter,
  up,
  upAfter,
  leave,
  leaveAfter,
  over,
  overAfter,
  action,
}: {
  children?: string | ((className: string) => React.ReactNode);
  disabled?: boolean;
  sound?:
    | boolean
    | ((e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean);
  anim?:
    | boolean
    | ((e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean);
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
  down?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean;
  downAfter?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => void;
  up?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean;
  upAfter?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => void;
  over?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean;
  overAfter?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => void;
  leave?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean;
  leaveAfter?: (
    e: React.PointerEvent<HTMLButtonElement> | PointerEvent,
  ) => void;
  action?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => void;
}) {
  const touchDown = useRef(false);
  const playSound = useCallback(() => {
    const audio = new Audio("/sound2.ogg");
    audio.oncanplay = () => {
      audio.volume = disabled ? 0.05 : 0.5;
      // TODO: Maybe do something about the error. Also because you can catch NotAllowedError even only on the first click, which means from the second click onward it be play the sound
      audio.play().catch((e) => console.log(e));
    };
  }, []);
  const playAnim = useCallback(
    (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => {
      const button = e.target as HTMLButtonElement;
      button.animate(
        [{ transform: "scale(0.95)" }, { transform: "scale(1.05)" }],
        { duration: 105 },
      );
    },
    [],
  );
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
        "z-[2]",
        classNames?.button,
      )}
      onPointerDown={(e) => {
        if (down !== undefined && !down(e)) return;

        if (e.target === e.currentTarget && e.button === 0) {
          if (e.pointerType === "mouse") {
            if (typeof sound === "function" ? sound(e) : sound) {
              playSound();
            }

            if (typeof anim === "function" ? anim(e) : anim) {
              playAnim(e);
            }

            action?.(e);
          } else touchDown.current = true;
        }

        downAfter?.(e);
      }}
      onPointerUp={(e) => {
        if (up !== undefined && !up(e)) return;

        if (e.target === e.currentTarget && e.button === 0) {
          if (e.pointerType === "touch" && touchDown.current === true) {
            const button = e.target as HTMLButtonElement;
            const rect = button.getBoundingClientRect();
            const intersect =
              e.clientX >= rect.x &&
              e.clientX <= rect.x + rect.width &&
              e.clientY >= rect.y &&
              e.clientY <= rect.y + rect.height;

            if (intersect) {
              if (typeof sound === "function" ? sound(e) : sound) {
                playSound();
              }

              if (typeof anim === "function" ? anim(e) : anim) {
                playAnim(e);
              }

              action?.(e);
            }
          }
        }

        upAfter?.(e);
      }}
      onPointerOver={(e) => {
        if (over !== undefined && !over(e)) return;

        if (e.target === e.currentTarget) {
          if (e.pointerType === "mouse") {
            const button = e.target as HTMLButtonElement;
            button.classList.add("hover");
          }
        }

        overAfter?.(e);
      }}
      onPointerLeave={(e) => {
        if (leave !== undefined && !leave(e)) return;

        if (e.target === e.currentTarget) {
          if (e.pointerType === "mouse") {
            const button = e.target as HTMLButtonElement;
            button.classList.remove("hover");
          }
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

export function Button({
  children,
  disabled = false,
  ref,
  sound = true,
  anim = true,
  className,
  style,
  down,
  downAfter,
  up,
  upAfter,
  leave,
  leaveAfter,
  over,
  overAfter,
  action,
  TextProps,
}: {
  children?: string | ((args: { className: string }) => React.ReactNode);
  disabled?: boolean;
  sound?:
    | boolean
    | ((e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean);
  anim?:
    | boolean
    | ((e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean);
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
  down?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean;
  downAfter?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => void;
  up?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean;
  upAfter?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => void;
  over?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean;
  overAfter?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => void;
  leave?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean;
  leaveAfter?: (
    e: React.PointerEvent<HTMLButtonElement> | PointerEvent,
  ) => void;
  action?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => void;
  TextProps?: Props<typeof Text>;
}) {
  const touchDown = useRef(false);
  const playSound = useCallback(() => {
    const audio = new Audio("/sound2.ogg");
    audio.oncanplay = () => {
      audio.volume = disabled ? 0.05 : 0.5;
      // TODO: Maybe do something about the error. Also because you can catch NotAllowedError even only on the first click, which means from the second click onward it be play the sound
      audio.play().catch((e) => console.log(e));
    };
  }, []);
  const playAnim = useCallback(
    (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => {
      const button = e.target as HTMLButtonElement;
      button.animate(
        [{ transform: "scale(0.95)" }, { transform: "scale(1.05)" }],
        { duration: 105 },
      );
    },
    [],
  );
  return (
    <button
      ref={ref}
      disabled={disabled}
      style={style}
      className={cn(
        "disabled:opacity-50",
        "rounded bg-neutral-700",
        "transition-[background-color,transform,opacity] [&.hover]:scale-105 [&.hover]:bg-white [&.hover_p]:text-black [&_p]:transition-colors",
        "z-[2]",
        className,
      )}
      onPointerDown={(e) => {
        if (down !== undefined && !down(e)) return;

        if (e.target === e.currentTarget && e.button === 0) {
          if (e.pointerType === "mouse") {
            if (typeof sound === "function" ? sound(e) : sound) {
              playSound();
            }

            if (typeof anim === "function" ? anim(e) : anim) {
              playAnim(e);
            }

            action?.(e);
          } else touchDown.current = true;
        }

        downAfter?.(e);
      }}
      onPointerUp={(e) => {
        if (up !== undefined && !up(e)) return;

        if (e.target === e.currentTarget && e.button === 0) {
          if (e.pointerType === "touch" && touchDown.current === true) {
            const button = e.target as HTMLButtonElement;
            const rect = button.getBoundingClientRect();
            const intersect =
              e.clientX >= rect.x &&
              e.clientX <= rect.x + rect.width &&
              e.clientY >= rect.y &&
              e.clientY <= rect.y + rect.height;

            if (intersect) {
              if (typeof sound === "function" ? sound(e) : sound) {
                playSound();
              }

              if (typeof anim === "function" ? anim(e) : anim) {
                playAnim(e);
              }

              action?.(e);
            }
          }
        }

        upAfter?.(e);
      }}
      onPointerOver={(e) => {
        if (over !== undefined && !over(e)) return;

        if (e.target === e.currentTarget) {
          if (e.pointerType === "mouse") {
            const button = e.target as HTMLButtonElement;
            button.classList.add("hover");
          }
        }

        overAfter?.(e);
      }}
      onPointerLeave={(e) => {
        if (leave !== undefined && !leave(e)) return;

        if (e.target === e.currentTarget) {
          if (e.pointerType === "mouse") {
            const button = e.target as HTMLButtonElement;
            button.classList.remove("hover");
          }
        }

        leaveAfter?.(e);
      }}
    >
      {typeof children === "string" ? (
        <Text
          {...TextProps}
          className={cn("pointer-events-none text-white", TextProps?.className)}
        >
          {TextProps?.children ?? children}
        </Text>
      ) : (
        children?.({ className: cn("pointer-events-none") })
      )}
    </button>
  );
}

export function LinkButton({
  href,
  external,
  action,
  actionAfter,
  over,
  overAfter,
  disabled,
  ...props
}: Omit<Props<typeof Button>, "action"> & {
  href?: string;
  external?: boolean;
  action?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean;
  actionAfter?: (
    e: React.PointerEvent<HTMLButtonElement> | PointerEvent,
  ) => void;
}) {
  const router = useRouter();
  const prefetch = useCallback(() => {
    if (href !== undefined) router.prefetch(href);
  }, [href]);
  const push = useCallback(() => {
    if (href !== undefined) router.push(href);
  }, [href]);

  const myOver = useCallback(
    (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => {
      if (over !== undefined && !over(e)) return false;

      if (e.target === e.currentTarget) {
        if (!disabled) prefetch();
      }

      return true;
    },
    [prefetch, over, disabled],
  );
  const myAction = useCallback(
    (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => {
      if (action !== undefined && !action(e)) return;

      if (!disabled) {
        if (external) window.open(href);
        else push();
      }

      actionAfter?.(e);
    },
    [action, disabled, actionAfter],
  );

  return (
    <Button
      {...props}
      className={cn("bg-black", props.className)}
      disabled={disabled}
      over={myOver}
      action={myAction}
    />
  );
}

export function ErrorButton({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [portal, setPortal] = useState<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (portal !== null) {
      const h = rem(getComputedStyle(portal).height);
      const maxH = 14;

      setPortal((portal) => {
        portal!.style.overflowY = h >= maxH ? "scroll" : "hidden";
        portal!.style.height = h - h * 0.25 + "rem";
        return portal!;
      });

      window.requestAnimationFrame(() => {
        setPortal((portal) => {
          portal!.style.height = h + "rem";
          return portal!;
        });
      });
    }
  }, [portal]);

  useEffect(() => {
    if (children === undefined && open) setOpen(false);
  }, [children]);

  if (children !== undefined)
    return (
      <Popover open={open} matchRefWidth>
        <PopoverTrigger>
          <IconButton
            action={() => setOpen((state) => !state)}
            over={() => !open}
            leave={() => !open}
          >
            {(className) => (
              <IcBaselineError className={cn(className, "text-green-500")} />
            )}
          </IconButton>
        </PopoverTrigger>

        <PopoverContent>
          <Text
            ref={(instance) => setPortal(instance)}
            className={cn(
              "max-h-56 max-w-64 overflow-y-auto rounded",
              "bg-neutral-600 italic",
              "transition-[height] duration-[105ms]",
            )}
          >
            {children}
          </Text>
        </PopoverContent>
      </Popover>
    );
}

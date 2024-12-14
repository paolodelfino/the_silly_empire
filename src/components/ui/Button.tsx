"use client";

import Text from "@/components/ui/Text";
import { cn } from "@/utils/cn";
import { Props } from "@/utils/component";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

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
  down?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean;
  downAfter?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => void;
  over?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean;
  overAfter?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => void;
  leave?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean;
  leaveAfter?: (
    e: React.PointerEvent<HTMLButtonElement> | PointerEvent,
  ) => void;
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
        classNames?.button,
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
  leave,
  leaveAfter,
  over,
  overAfter,
  TextProps,
}: {
  children?: string;
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
  over?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean;
  overAfter?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => void;
  leave?: (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => boolean;
  leaveAfter?: (
    e: React.PointerEvent<HTMLButtonElement> | PointerEvent,
  ) => void;
  TextProps?: Props<typeof Text>;
}) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      style={style}
      className={cn(
        "disabled:opacity-50",
        "rounded bg-neutral-700",
        "transition-[background-color,transform,opacity] [&.hover]:scale-105 [&.hover]:bg-white [&.hover_p]:text-black [&_p]:transition-colors",
        className,
      )}
      onPointerDown={(e) => {
        if (down !== undefined && !down(e)) return;

        if (typeof sound === "function" ? sound(e) : sound) {
          const audio = new Audio("/sound2.ogg");
          audio.oncanplay = () => {
            audio.volume = disabled ? 0.05 : 0.5;
            // TODO: Maybe do something about the error. Also because you can catch NotAllowedError even only on the first click, which means from the second click onward it be play the sound
            audio.play().catch((e) => console.log(e));
          };
        }

        if (typeof anim === "function" ? anim(e) : anim) {
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
      <Text
        {...TextProps}
        className={cn("pointer-events-none text-white", TextProps?.className)}
      >
        {TextProps?.children ?? children}
      </Text>
    </button>
  );
}

export function LinkButton({
  href,
  external,
  ...props
}: Props<typeof Button> & {
  href?: string;
  external?: boolean;
}) {
  const router = useRouter();
  const prefetch = useCallback(() => {
    if (href !== undefined) router.prefetch(href);
  }, [href]);
  const push = useCallback(() => {
    if (href !== undefined) router.push(href);
  }, [href]);

  const over = useCallback(
    (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => {
      if (props.over !== undefined && !props.over(e)) return false;

      if (!props.disabled) prefetch();

      return true;
    },
    [prefetch, props.over, props.disabled],
  );
  const down = useCallback(
    (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => {
      if (props.down !== undefined && !props.down(e)) return false;

      if (!props.disabled) {
        if (external) window.open(href);
        else push();
      }

      return true;
    },
    [push, props.down, props.disabled, external],
  );

  return (
    <Button
      {...props}
      className={cn("bg-black", props.className)}
      over={over}
      down={down}
    />
  );
}

// TODO: Experimental
export function LinkButton2({
  href,
  external,
  up,
  upAfter,
  ref,
  sound = true,
  anim = true,
  disabled,
  ...props
}: Props<typeof Button> & {
  href?: string;
  external?: boolean;
  up?: (e: PointerEvent) => boolean;
  upAfter?: (e: PointerEvent) => void;
}) {
  const router = useRouter();
  const prefetch = useCallback(() => {
    if (href !== undefined) router.prefetch(href);
  }, [href]);
  const push = useCallback(() => {
    if (href !== undefined) {
      if (external) window.open(href);
      else router.push(href);
    }
  }, [href, external]);

  const touchDown = useRef(false);

  const over = useCallback(
    (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => {
      if (props.over !== undefined && !props.over(e)) return false;

      if (!disabled) {
        prefetch();

        if (e.pointerType === "touch") touchDown.current = true;
      }

      return true;
    },
    [prefetch, props.over, disabled],
  );

  const down = useCallback(
    (e: React.PointerEvent<HTMLButtonElement> | PointerEvent) => {
      if (props.down !== undefined && !props.down(e)) return false;

      if (!disabled && e.pointerType !== "touch") push();

      return true;
    },
    [push, props.down, disabled],
  );

  const soundCallback = useCallback(() => {
    const audio = new Audio("/sound2.ogg");
    audio.oncanplay = () => {
      audio.volume = disabled ? 0.05 : 0.5;
      // TODO: Maybe do something about the error. Also because you can catch NotAllowedError even only on the first click, which means from the second click onward it be play the sound
      audio.play().catch((e) => console.log(e));
    };
  }, [disabled]);
  const animCallback = useCallback((button: HTMLButtonElement) => {
    button.animate(
      [{ transform: "scale(0.95)" }, { transform: "scale(1.05)" }],
      { duration: 105 },
    );
  }, []);

  const myUp = useCallback(
    (e: PointerEvent) => {
      if (up !== undefined && !up(e)) return;

      if (e.pointerType === "touch") {
        if (typeof sound === "function" ? sound(e) : sound) soundCallback();

        if (typeof anim === "function" ? anim(e) : anim)
          animCallback(e.target as HTMLButtonElement);

        if (!disabled && touchDown.current) push();
        touchDown.current = false;
      }

      upAfter?.(e);
    },
    [up, disabled, push, sound, soundCallback, anim, animCallback, upAfter],
  );

  const button = useCallback(
    (instance: HTMLButtonElement | null) => {
      if (ref !== undefined && ref !== null) {
        if (typeof ref === "function") ref(instance);
        else ref.current = instance;
      }

      instance?.addEventListener("pointerup", myUp);
      return () => instance?.removeEventListener("pointerup", myUp);
    },
    [myUp, ref],
  );

  return (
    <Button
      {...props}
      disabled={disabled}
      ref={button}
      className={cn("bg-black", props.className)}
      over={over}
      down={down}
      sound={(e) => e.pointerType !== "touch"}
      anim={(e) => e.pointerType !== "touch"}
    />
  );
}

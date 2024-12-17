import { cn } from "@/utils/cn";
import type { SVGProps } from "react";

export function IcBaselineError({
  className,
  ...rest
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={cn("size-8", className)}
      {...rest}
    >
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 15h-2v-2h2zm0-4h-2V7h2z"
      ></path>
    </svg>
  );
}

export function IcBaselineCloud({
  className,
  ...rest
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={cn("size-8", className)}
      {...rest}
    >
      <path
        fill="currentColor"
        d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5c0-2.64-2.05-4.78-4.65-4.96"
      ></path>
    </svg>
  );
}

export function Logo({
  className,
  ...rest
}: React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>) {
  return (
    <img
      {...rest}
      alt=""
      className={cn("size-8", className)}
      src="/favicon-196.png"
    />
  );
}

export function IcSharpLockReset({
  className,
  ...rest
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 21 18"
      className={cn("size-8", className)}
      {...rest}
    >
      <path
        fill="currentColor"
        id="9b9065b3"
        d="M12 0C9.61305 0 7.32387 0.948211 5.63604 2.63604C3.94821 4.32387 3 6.61305 3 9H0L4 13L8 9H5C5 5.14 8.14 2 12 2C15.86 2 19 5.14 19 9C19 12.86 15.86 16 12 16C10.1 16 8.38 15.24 7.12 14.01L5.7 15.42C7.37998 17.0735 9.64277 18.0002 12 18C14.3869 18 16.6761 17.0518 18.364 15.364C20.0518 13.6761 21 11.3869 21 9C21 6.61305 20.0518 4.32387 18.364 2.63604C16.6761 0.948211 14.3869 3.55683e-08 12 0Z"
      ></path>
    </svg>
  );
}

export function IcBaselineSearch({
  className,
  ...rest
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={cn("size-8", className)}
      {...rest}
    >
      <path
        fill="currentColor"
        d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14"
      ></path>
    </svg>
  );
}

"use client";

import { ButtonLink } from "@/components/Button";
import {
  Add02,
  FilterMailSquare,
  InkStroke20Filled,
  SearchSquare,
  Square,
} from "@/components/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { cn } from "@/utils/cn";

export default function Toolbar({
  variant,
}: {
  variant: "monitor" | "mobile";
}) {
  return (
    <nav
      className={cn(
        variant === "mobile" &&
          "fixed bottom-0 left-1/2 h-16 w-full max-w-4xl -translate-x-1/2 overflow-x-auto bg-black scrollbar-hidden",
        variant === "monitor" && "flex-1",
      )}
    >
      <ul className={cn(variant === "mobile" && "flex h-16")}>
        <ButtonLink
          href="/"
          role="listitem"
          color="ghost"
          size="large"
          classNames={{ button: "py-5", text: "text-neutral-300" }}
          full={variant === "monitor"}
          startContent={<FilterMailSquare />}
        >
          Queries
        </ButtonLink>
        <Popover placement="left-start">
          <PopoverTrigger
            role="listitem"
            color="ghost"
            size="large"
            classNames={{ button: "py-5", text: "text-neutral-300" }}
            full={variant === "monitor"}
            startContent={<Add02 />}
          >
            Create
          </PopoverTrigger>
          <PopoverContent
            className="z-20 flex min-w-16 max-w-[160px] flex-col"
            role="list"
          >
            <ButtonLink
              classNames={{ text: "text-neutral-300" }}
              full
              href="/create/big_paint"
              // target="_blank"
              role="listitem"
              size="large"
              startContent={<Square />}
            >
              BigPaint
            </ButtonLink>
            <ButtonLink
              classNames={{ text: "text-neutral-300" }}
              full
              href="/create/inspiration"
              // target="_blank"
              role="listitem"
              size="large"
              startContent={<InkStroke20Filled />}
            >
              Inspiration
            </ButtonLink>
            <Popover placement="right-end">
              <PopoverTrigger
                role="listitem"
                classNames={{ text: "text-neutral-300" }}
                full
                size="large"
                startContent={<FilterMailSquare />}
              >
                Query
              </PopoverTrigger>
              <PopoverContent
                className="z-20 flex min-w-16 max-w-[160px] flex-col"
                role="list"
              >
                <ButtonLink
                  classNames={{ text: "text-neutral-300" }}
                  full
                  href="/create/query/big_paint"
                  role="listitem"
                  size="large"
                  startContent={<Square />}
                >
                  BigPaint
                </ButtonLink>
                <ButtonLink
                  classNames={{ text: "text-neutral-300" }}
                  full
                  href="/create/query/inspiration"
                  role="listitem"
                  size="large"
                  startContent={<InkStroke20Filled />}
                >
                  Inspiration
                </ButtonLink>
              </PopoverContent>
            </Popover>
          </PopoverContent>
        </Popover>
      </ul>
    </nav>
  );
}

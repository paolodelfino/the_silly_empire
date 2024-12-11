"use client";

import Button from "@/components/Button";
import {
  ArrowLeft01,
  ArrowRight01,
  Cloud,
  InformationCircle,
} from "@/components/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { cn } from "@/utils/cn";
import { dateFromDatetime, dateToString, Time } from "@/utils/date";
import { FormField } from "@/utils/form";
import React, { useCallback, useEffect, useState } from "react";

type Meta = {
  date: Date | undefined;
  time: Time | undefined;
};

type Value = Date | undefined;

// Must use another name that's why "__Type" because language server marks as duplicate FieldDate() and FieldDate, just saying
export type FieldDate__Type = FormField<Value, Meta>;

// We use undefined as the guard value assuming that undefined is equivalent to indeterminate state and nothing else for any field
export function fieldDate(meta?: Partial<Meta>): FieldDate__Type {
  return {
    meta: {
      date: undefined,
      time: undefined,
      ...meta,
    },
    value: undefined,
    default: {
      meta: {
        date: undefined,
        time: undefined,
        ...meta,
      },
      value: undefined,
    },
    error: undefined,
  };
}

// TODO: Usa il dialog su schermi piccoli (fai riferimento alla grandezza massima del picker)
export default function FieldDate({
  meta,
  setMeta,
  setValue,
  error,
  disabled,
  acceptIndeterminate,
  placeholder,
}: {
  acceptIndeterminate?: boolean;
  setValue: (value: Value) => void;
  meta: Meta;
  setMeta: (meta: Partial<Meta>) => void;
  error: string | undefined;
  disabled: boolean;
  placeholder: string;
}) {
  useEffect(() => {
    if (meta.date === undefined || meta.time === undefined) setValue(undefined);
    else setValue(dateFromDatetime(meta.date, meta.time));
  }, [meta]);

  return (
    <div className="flex gap-1">
      <Popover>
        <PopoverTrigger
          disabled={disabled}
          title={placeholder}
          classNames={{
            button: cn(
              (meta.date === undefined || meta.time === undefined) &&
                "text-neutral-400 bg-neutral-700",
            ),
          }}
        >
          {meta.date === undefined || meta.time === undefined
            ? placeholder
            : dateToString(dateFromDatetime(meta.date, meta.time))}
        </PopoverTrigger>
        <PopoverContent className="w-full max-w-md rounded-lg border bg-neutral-700 p-4">
          <Calendar
            defaultValue={meta.date}
            onChange={(date) => setMeta({ date })}
          />
          <TimePicker
            defaultValue={meta.time}
            onChange={(time) => setMeta({ time })}
          />
        </PopoverContent>
      </Popover>

      {error !== undefined && (
        <Popover>
          <PopoverTrigger color="danger" disabled={disabled}>
            <InformationCircle />
          </PopoverTrigger>
          <PopoverContent className="rounded border bg-neutral-700 p-4 italic">
            {error}
          </PopoverContent>
        </Popover>
      )}

      {acceptIndeterminate === true &&
        meta.date !== undefined &&
        meta.time !== undefined && (
          <Button
            aria-label="Clear"
            disabled={disabled}
            color="ghost"
            onClick={() =>
              setMeta({
                date: undefined,
                time: undefined,
              })
            }
          >
            <Cloud />
          </Button>
        )}
    </div>
  );
}

interface CalendarProps {
  onChange?: (date: Date) => void;
  defaultValue?: Date;
}

function Calendar({ onChange, defaultValue }: CalendarProps = {}) {
  const [currentDate, setCurrentDate] = useState(defaultValue || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    defaultValue || null,
  );

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const generateCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        i,
      );
      const isCurrentDate =
        i === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();
      const isSelected =
        selectedDate &&
        i === selectedDate.getDate() &&
        currentDate.getMonth() === selectedDate.getMonth() &&
        currentDate.getFullYear() === selectedDate.getFullYear();

      days.push(
        <Button
          key={i}
          color={isCurrentDate ? "accent" : isSelected ? "default" : "ghost"}
          onClick={() => handleDateClick(date)}
          classNames={{
            button: "h-10 w-10 justify-center items-center",
          }}
        >
          {i}
        </Button>,
      );
    }

    return days;
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(
      (prevDate) =>
        new Date(prevDate.getFullYear(), prevDate.getMonth() + increment, 1),
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onChange) {
      onChange(date);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <Button color="ghost" onClick={() => changeMonth(-1)}>
          <ArrowLeft01 />
        </Button>
        <h2 className="text-xl font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <Button color="ghost" onClick={() => changeMonth(1)}>
          <ArrowRight01 />
        </Button>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center font-medium">
        <div className="text-muted-foreground">Sun</div>
        <div className="text-muted-foreground">Mon</div>
        <div className="text-muted-foreground">Tue</div>
        <div className="text-muted-foreground">Wed</div>
        <div className="text-muted-foreground">Thu</div>
        <div className="text-muted-foreground">Fri</div>
        <div className="text-muted-foreground">Sat</div>
      </div>
      <div className="grid grid-cols-7 gap-1">{generateCalendarDays()}</div>
    </div>
  );
}

interface TimePickerProps {
  defaultValue?: Time;
  onChange?: (time: Time) => void;
}

function TimePicker({ onChange, defaultValue }: TimePickerProps) {
  const [time, setTime] = useState(
    defaultValue !== undefined
      ? {
          hours: defaultValue.hours.toString().padStart(2, "0"),
          minutes: defaultValue.minutes.toString().padStart(2, "0"),
          seconds: defaultValue.seconds.toString().padStart(2, "0"),
          milliseconds: defaultValue.milliseconds.toString().padStart(3, "0"),
        }
      : {
          hours: "00",
          minutes: "00",
          seconds: "00",
          milliseconds: "000",
        },
  );

  useEffect(() => {
    updateParent(time);
  }, [time]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      let formattedValue = value;

      switch (name) {
        case "hours":
          formattedValue = Math.min(23, Math.max(0, parseInt(value) || 0))
            .toString()
            .padStart(2, "0");
          break;
        case "minutes":
        case "seconds":
          formattedValue = Math.min(59, Math.max(0, parseInt(value) || 0))
            .toString()
            .padStart(2, "0");
          break;
        case "milliseconds":
          formattedValue = Math.min(999, Math.max(0, parseInt(value) || 0))
            .toString()
            .padStart(3, "0");
          break;
      }

      setTime((prev) => {
        const newTime = { ...prev, [name]: formattedValue };
        return newTime;
      });
    },
    [],
  );

  const incrementValue = useCallback((field: keyof typeof time) => {
    setTime((prev) => {
      let value = parseInt(prev[field]);
      let newTime = { ...prev };
      switch (field) {
        case "hours":
          value = (value + 1) % 24;
          newTime[field] = value.toString().padStart(2, "0");
          break;
        case "minutes":
        case "seconds":
          value = (value + 1) % 60;
          newTime[field] = value.toString().padStart(2, "0");
          break;
        case "milliseconds":
          value = (value + 1) % 1000;
          newTime[field] = value.toString().padStart(3, "0");
          break;
      }
      return newTime;
    });
  }, []);

  const decrementValue = useCallback((field: keyof typeof time) => {
    setTime((prev) => {
      let value = parseInt(prev[field]);
      let newTime = { ...prev };
      switch (field) {
        case "hours":
          value = (value - 1 + 24) % 24;
          newTime[field] = value.toString().padStart(2, "0");
          break;
        case "minutes":
        case "seconds":
          value = (value - 1 + 60) % 60;
          newTime[field] = value.toString().padStart(2, "0");
          break;
        case "milliseconds":
          value = (value - 1 + 1000) % 1000;
          newTime[field] = value.toString().padStart(3, "0");
          break;
      }
      return newTime;
    });
  }, []);

  const updateParent = useCallback(
    (newTime: typeof time) => {
      if (onChange) {
        const timeObject: Time = {
          hours: parseInt(newTime.hours),
          minutes: parseInt(newTime.minutes),
          seconds: parseInt(newTime.seconds),
          milliseconds: parseInt(newTime.milliseconds),
        };
        onChange(timeObject);
      }
    },
    [onChange],
  );

  return (
    <div className="mx-auto mt-6 flex w-full max-w-xs flex-col p-3">
      <div className="flex">
        {Object.entries(time).map(([field, value]) => (
          <React.Fragment key={field}>
            {(field === "seconds" || field === "minutes") && (
              <div className="mt-[34px] flex h-11 items-center bg-neutral-900">
                :
              </div>
            )}
            {field === "milliseconds" && (
              <div className="mt-[34px] flex h-11 items-center bg-neutral-900">
                .
              </div>
            )}

            <div className="flex flex-col items-center">
              <Button
                full
                color="ghost"
                onClick={() => incrementValue(field as keyof typeof time)}
                classNames={{ button: "justify-center items-center" }}
              >
                ▲
              </Button>
              <input
                type="text"
                name={field}
                value={value}
                onChange={handleInputChange}
                className={cn(
                  "h-11 w-full rounded-e-none rounded-s-none bg-neutral-900 text-center",
                  field === "hours" && "rounded-s",
                  field === "milliseconds" && "rounded-e",
                )}
              />
              <Button
                full
                color="ghost"
                onClick={() => decrementValue(field as keyof typeof time)}
                classNames={{ button: "justify-center items-center" }}
              >
                ▼
              </Button>
            </div>
          </React.Fragment>
        ))}
      </div>
      {/* {Object.entries(time).map(([field, value]) => (
        <div key={field} className="flex flex-col items-center">
          <label htmlFor={field} className="mb-1 capitalize">
            {field}
          </label>
          <div className="flex flex-col items-center">
            <Button
              full
              color="ghost"
              onClick={() => incrementValue(field as keyof typeof time)}
              classNames={{ button: "justify-center items-center" }}
            >
              ▲
            </Button>
            <input
              type="text"
              id={field}
              name={field}
              value={value}
              onChange={handleInputChange}
              className={cn(
                "h-11 w-full bg-neutral-900 text-center",
                field === "hours" && "rounded-s",
                field === "milliseconds" && "rounded-e",
              )}
            />
            <Button
              full
              color="ghost"
              onClick={() => decrementValue(field as keyof typeof time)}
              classNames={{ button: "justify-center items-center" }}
            >
              ▼
            </Button>
          </div>
        </div>
      ))} */}
    </div>
  );
}

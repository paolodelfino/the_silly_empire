import Button from "@/components/Button";
import { cn } from "@/utils/cn";
import {
  flip as _flip,
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  Placement,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useMergeRefs,
  useRole,
} from "@floating-ui/react";
import * as React from "react";

interface PopoverOptions {
  initialOpen?: boolean;
  placement?: Placement;
  modal?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  targetRef?: React.RefObject<HTMLElement | null>;
  matchRefWidth?: boolean;
  offset?: number;
  flip?: boolean;
}

export function usePopover({
  initialOpen = false,
  placement = "bottom",
  modal,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  targetRef,
  matchRefWidth = true,
  offset: offsetValue = 5,
  flip = true,
}: PopoverOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);
  const [labelId, setLabelId] = React.useState<string | undefined>();
  const [descriptionId, setDescriptionId] = React.useState<
    string | undefined
  >();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(offsetValue),
      flip
        ? _flip({
            crossAxis: placement.includes("-"),
            fallbackAxisSideDirection: "end",
            padding: 5,
          })
        : undefined,
      shift({ padding: 5 }),
      matchRefWidth
        ? size({
            apply({ rects, elements }) {
              Object.assign(elements.floating.style, {
                minWidth: `${rects.reference.width}px`,
              });
            },
          })
        : undefined,
    ],
    elements: {
      reference: targetRef?.current, // Use targetRef if provided
    },
  });

  const context = data.context;

  const click = useClick(context, {
    enabled: controlledOpen == null,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const interactions = useInteractions([click, dismiss, role]);

  return React.useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      modal,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId,
    }),
    [open, setOpen, interactions, data, modal, labelId, descriptionId],
  );
}

type ContextType =
  | (ReturnType<typeof usePopover> & {
      setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
      setDescriptionId: React.Dispatch<
        React.SetStateAction<string | undefined>
      >;
    })
  | null;

const PopoverContext = React.createContext<ContextType>(null);

export const usePopoverContext = () => {
  const context = React.useContext(PopoverContext);

  if (context == null) {
    throw new Error("Popover components must be wrapped in <Popover />");
  }

  return context;
};

export function Popover({
  children,
  modal = false,
  ...restOptions
}: {
  children: React.ReactNode;
} & PopoverOptions) {
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const popover = usePopover({ modal, ...restOptions });
  return (
    <PopoverContext.Provider value={popover}>
      {children}
    </PopoverContext.Provider>
  );
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function PopoverTrigger({
  children,
  asChild = false,
  ref,
  color,
  size,
  ...rest
}: PopoverTriggerProps &
  (
    | ({ asChild?: false } & Parameters<typeof Button>["0"])
    | ({ asChild?: true } & {
        color?: never;
        size?: never;
        ref?: React.Ref<HTMLElement>;
      })
  )) {
  const context = usePopoverContext();
  const childrenRef = (children as any).ref;
  // eslint-disable-next-line react-compiler/react-compiler
  const mergedRef = useMergeRefs([context.refs.setReference, ref, childrenRef]);

  // `asChild` allows the user to pass any element as the anchor
  if (asChild) {
    if (React.isValidElement(children))
      return React.cloneElement(
        children,
        context.getReferenceProps({
          ref: mergedRef,
          ...rest,
          ...(children.props as any),
          "data-state": context.open ? "open" : "closed",
        }),
      );
    throw new Error("Children is not a valid react element");
  }

  return (
    <Button
      ref={mergedRef}
      // The user can style the trigger based on the state
      data-state={context.open ? "open" : "closed"}
      color={color}
      size={size}
      {...context.getReferenceProps(rest)}
    >
      {children}
    </Button>
  );
}

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(function PopoverContent({ style, ...props }, propRef) {
  const { context: floatingContext, ...context } = usePopoverContext();
  // eslint-disable-next-line react-compiler/react-compiler
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  if (!floatingContext.open) return null;

  return (
    <FloatingPortal>
      <FloatingFocusManager context={floatingContext} modal={context.modal}>
        <div
          ref={ref}
          style={{ ...context.floatingStyles, ...style }}
          aria-labelledby={context.labelId}
          aria-describedby={context.descriptionId}
          {...context.getFloatingProps(props)}
          className={cn("z-10", props.className)}
        >
          {props.children}
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
});

export const PopoverHeading = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLProps<HTMLHeadingElement>
>(function PopoverHeading(props, ref) {
  const { setLabelId } = usePopoverContext();
  const id = useId();

  // Only sets `aria-labelledby` on the Popover root element
  // if this component is mounted inside it.
  React.useLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  return (
    <h2 {...props} ref={ref} id={id}>
      {props.children}
    </h2>
  );
});

export const PopoverDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLProps<HTMLParagraphElement>
>(function PopoverDescription(props, ref) {
  const { setDescriptionId } = usePopoverContext();
  const id = useId();

  // Only sets `aria-describedby` on the Popover root element
  // if this component is mounted inside it.
  React.useLayoutEffect(() => {
    setDescriptionId(id);
    return () => setDescriptionId(undefined);
  }, [id, setDescriptionId]);

  return <p {...props} ref={ref} id={id} />;
});

export function PopoverClose(props: Parameters<typeof Button>["0"]) {
  const { setOpen } = usePopoverContext();
  return (
    <Button
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        setOpen(false);
      }}
    />
  );
}

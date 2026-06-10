import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { IconCheck, IconChevronDown, IconX } from "@tabler/icons-react";
import { Button } from "#/components/ui/button.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "#/components/ui/input-group.tsx";
import { cn } from "#/lib/utils.ts";
import { useRef } from "react";

const Combobox = ComboboxPrimitive.Root;

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value {...props} data-slot="combobox-value" />;
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      {...props}
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      data-slot="combobox-trigger"
    >
      {children}
      <IconChevronDown className="pointer-events-none size-4 text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
  );
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      {...props}
      className={cn(className)}
      data-slot="combobox-clear"
      render={<InputGroupButton size="icon-xs" variant="ghost" />}
    >
      <IconX className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  );
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean;
  showClear?: boolean;
}) {
  return (
    <InputGroup className={cn("w-auto", className)}>
      <ComboboxPrimitive.Input
        {...props}
        render={<InputGroupInput disabled={disabled} />}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            data-slot="input-group-button"
            disabled={disabled}
            render={<ComboboxTrigger />}
            size="icon-xs"
            variant="ghost"
          />
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <ComboboxPrimitive.Popup
          {...props}
          className={cn(
            "group/combobox-content data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 relative max-h-(--available-height) w-(--anchor-width) min-w-[calc(var(--anchor-width)+(--spacing(7)))] max-w-(--available-width) origin-(--transform-origin) animate-none! overflow-hidden rounded-lg bg-popover/70 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150 data-[chips=true]:min-w-(--anchor-width) data-closed:animate-out data-open:animate-in **:data-[slot$=-item]:data-highlighted:bg-foreground/10 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 **:data-[slot$=-separator]:bg-foreground/5 *:data-[slot=input-group]:bg-input/30 **:data-[variant=destructive]:**:text-accent-foreground! **:data-[variant=destructive]:text-accent-foreground! *:data-[slot=input-group]:shadow-none **:data-[slot$=-trigger]:aria-expanded:bg-foreground/10! **:data-[slot$=-item]:focus:bg-foreground/10 **:data-[slot$=-trigger]:focus:bg-foreground/10 **:data-[variant=destructive]:focus:bg-foreground/10!",
            className
          )}
          data-chips={!!anchor}
          data-slot="combobox-content"
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      {...props}
      className={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)-(--spacing(9))),calc(var(--available-height)-(--spacing(9))))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        className
      )}
      data-slot="combobox-list"
    />
  );
}

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      {...props}
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50 not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="combobox-item"
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <IconCheck className="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      {...props}
      className={cn(className)}
      data-slot="combobox-group"
    />
  );
}

function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      {...props}
      className={cn("px-2 py-1.5 text-muted-foreground text-xs", className)}
      data-slot="combobox-label"
    />
  );
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return (
    <ComboboxPrimitive.Collection {...props} data-slot="combobox-collection" />
  );
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      {...props}
      className={cn(
        "hidden w-full justify-center py-2 text-center text-muted-foreground text-sm group-data-empty/combobox-content:flex",
        className
      )}
      data-slot="combobox-empty"
    />
  );
}

function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
    {...props}
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      data-slot="combobox-separator"
    />
  );
}

function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
    {...props}
      className={cn(
        "flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-data-[slot=combobox-chip]:px-1 has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
        className
      )}
      data-slot="combobox-chips"
    />
  );
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean;
}) {
  return (
    <ComboboxPrimitive.Chip
    {...props}
      className={cn(
        "flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 whitespace-nowrap rounded-sm bg-muted px-1.5 font-medium text-foreground text-xs has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-data-[slot=combobox-chip-remove]:pr-0 has-disabled:opacity-50",
        className
      )}
      data-slot="combobox-chip"
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          className="-ml-1 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
          render={<Button size="icon-xs" variant="ghost" />}
        >
          <IconX className="pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  );
}

function ComboboxChipsInput({
  className,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      {...props}
      className={cn("min-w-16 flex-1 outline-none", className)}
      data-slot="combobox-chip-input"
    />
  );
}

function useComboboxAnchor() {
  return useRef<HTMLDivElement | null>(null);
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};

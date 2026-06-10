import { cn } from "#/lib/utils.ts";

function AspectRatio({
  ratio,
  className,
  ...props
}: React.ComponentProps<"div"> & { ratio: number }) {
  return (
    <div
      {...props}
      className={cn("relative aspect-(--ratio)", className)}
      data-slot="aspect-ratio"
      style={
        {
          "--ratio": ratio,
        } as React.CSSProperties
      }
    />
  );
}

export { AspectRatio };

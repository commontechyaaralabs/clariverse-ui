"use client";

import * as React from "react";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { className = "", viewportClassName = "", children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <div className={`h-full w-full overflow-y-auto ${viewportClassName}`}>{children}</div>
    </div>
  );
});

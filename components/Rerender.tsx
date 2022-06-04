import { forwardRef, ReactNode, useImperativeHandle, useState } from "react";

export type RerenderHandle = { rerender: () => void };

// eslint-disable-next-line react/display-name
export const Rerender = forwardRef<RerenderHandle, { children: ReactNode }>(
  ({ children }, ref) => {
    const [render, setRender] = useState(true);

    useImperativeHandle(ref, () => ({
      rerender: () => {
        setRender(false);
        setTimeout(() => setRender(true), 0);
      },
    }));

    return render ? <>{children}</> : null;
  }
);

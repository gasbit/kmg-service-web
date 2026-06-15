import type { HTMLAttributes } from "react";

type DialogProps = HTMLAttributes<HTMLDivElement>;

export function Dialog(props: DialogProps) {
  return <div role="dialog" {...props} />;
}

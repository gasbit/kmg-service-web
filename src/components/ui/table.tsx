import type { TableHTMLAttributes } from "react";

type TableProps = TableHTMLAttributes<HTMLTableElement>;

export function Table(props: TableProps) {
  return <table {...props} />;
}

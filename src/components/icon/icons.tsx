import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      {children}
    </svg>
  );
}

const stroke = {
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.8,
};

export function HomeIcon(props: IconProps) {
  return <Icon {...props}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" {...stroke} /></Icon>;
}

export function ReceiptIcon(props: IconProps) {
  return <Icon {...props}><path d="M6 3h12a2 2 0 0 1 2 2v16l-3-2-2 2-3-2-3 2-2-2-3 2V5a2 2 0 0 1 2-2Zm3 5h6m-6 4h6" {...stroke} /></Icon>;
}

export function TruckIcon(props: IconProps) {
  return <Icon {...props}><path d="M3 5h11v12H3V5Zm11 5h4l3 3v4h-7v-7ZM7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" {...stroke} /></Icon>;
}

export function BoxesIcon(props: IconProps) {
  return <Icon {...props}><path d="m12 3 8 4-8 4-8-4 8-4Zm-8 4v10l8 4 8-4V7M12 11v10" {...stroke} /></Icon>;
}

export function ProductIcon(props: IconProps) {
  return <Icon {...props}><path d="M8 3h8l1 4v3c0 1.1-.9 2-2 2H9a2 2 0 0 1-2-2V7l1-4Zm1 9v9h6v-9M7 7h10" {...stroke} /></Icon>;
}

export function LoanIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 4h14v16H5V4Zm4 4h6m-6 4h6m-6 4h3" {...stroke} /></Icon>;
}

export function HistoryIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6M4 4v4.6h4.6M12 8v4l3 2" {...stroke} /></Icon>;
}

export function ChevronDownIcon(props: IconProps) {
  return <Icon {...props}><path d="m7 9.5 5 5 5-5" {...stroke} /></Icon>;
}

export function MenuIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 7h16M4 12h16M4 17h16" {...stroke} /></Icon>;
}

export function CloseIcon(props: IconProps) {
  return <Icon {...props}><path d="m6 6 12 12M18 6 6 18" {...stroke} /></Icon>;
}

export function BellIcon(props: IconProps) {
  return <Icon {...props}><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4" {...stroke} /></Icon>;
}

export function CalendarIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Zm2-2v4m10-4v4M3 9h18m-14 4h3m4 0h3m-10 4h3" {...stroke} /></Icon>;
}

export function UserIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 1 0-14 0" {...stroke} /></Icon>;
}

export function FlameIcon(props: IconProps) {
  return <Icon {...props}><path d="M13.5 2.5c.7 4-2.4 4.8-1.8 8.2.5-1.4 1.5-2.2 2.8-3 2.2 2 3.5 4.2 3.5 6.8a6 6 0 0 1-12 0c0-3.8 2.2-7.7 7.5-12Z" {...stroke} /></Icon>;
}

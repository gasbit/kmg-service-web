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

export function SearchIcon(props: IconProps) { return <Icon {...props}><circle cx="11" cy="11" r="7" {...stroke} /><path d="m20 20-4-4" {...stroke} /></Icon>; }
export function PlusIcon(props: IconProps) { return <Icon {...props}><path d="M12 5v14M5 12h14" {...stroke} /></Icon>; }
export function RefreshIcon(props: IconProps) { return <Icon {...props}><path d="M20 7v5h-5M4 17v-5h5M6.1 8a7 7 0 0 1 11.5-2.2L20 8M4 16l2.4 2.2A7 7 0 0 0 17.9 16" {...stroke} /></Icon>; }
export function EditIcon(props: IconProps) { return <Icon {...props}><path d="m4 20 4.2-1 10.6-10.6a2 2 0 0 0-2.8-2.8L5.4 16.2 4 20Zm10.5-13 2.8 2.8" {...stroke} /></Icon>; }
export function TrashIcon(props: IconProps) { return <Icon {...props}><path d="M4 7h16M9 7V4h6v3m-9 0 1 14h10l1-14M10 11v6m4-6v6" {...stroke} /></Icon>; }
export function PackageIcon(props: IconProps) { return <Icon {...props}><path d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10" {...stroke} /></Icon>; }
export function CheckCircleIcon(props: IconProps) { return <Icon {...props}><circle cx="12" cy="12" r="9" {...stroke} /><path d="m8 12 2.5 2.5L16 9" {...stroke} /></Icon>; }
export function PauseCircleIcon(props: IconProps) { return <Icon {...props}><circle cx="12" cy="12" r="9" {...stroke} /><path d="M10 9v6m4-6v6" {...stroke} /></Icon>; }
export function ArrowLeftIcon(props: IconProps) { return <Icon {...props}><path d="m15 18-6-6 6-6" {...stroke} /></Icon>; }
export function ArrowRightIcon(props: IconProps) { return <Icon {...props}><path d="m9 18 6-6-6-6" {...stroke} /></Icon>; }
export function MinusIcon(props: IconProps) { return <Icon {...props}><path d="M5 12h14" {...stroke} /></Icon>; }
export function InfoIcon(props: IconProps) { return <Icon {...props}><circle cx="12" cy="12" r="9" {...stroke} /><path d="M12 11v5m0-8h.01" {...stroke} /></Icon>; }
export function MapPinIcon(props: IconProps) { return <Icon {...props}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" {...stroke} /><circle cx="12" cy="10" r="2.5" {...stroke} /></Icon>; }
export function UsersIcon(props: IconProps) { return <Icon {...props}><path d="M16 20v-1.5a4.5 4.5 0 0 0-9 0V20m4.5-8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm6-4a3 3 0 0 1 0 6m1.5 1c1.7.8 2.5 2 2.5 4" {...stroke} /></Icon>; }
export function StorefrontIcon(props: IconProps) { return <Icon {...props}><path d="M4 9v11h16V9M3 9l2-5h14l2 5M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M9 20v-6h6v6" {...stroke} /></Icon>; }
export function CartIcon(props: IconProps) { return <Icon {...props}><path d="M3 4h2l2 11h10l3-8H6m3 12h.01M17 19h.01" {...stroke} /></Icon>; }
export function UploadIcon(props: IconProps) { return <Icon {...props}><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" {...stroke} /></Icon>; }
export function ImageIcon(props: IconProps) { return <Icon {...props}><rect height="16" rx="2" width="18" x="3" y="4" {...stroke} /><circle cx="8.5" cy="9" r="1.5" {...stroke} /><path d="m5 18 4.5-4.5 3 3 2-2L19 18" {...stroke} /></Icon>; }

export function UserIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 1 0-14 0" {...stroke} /></Icon>;
}

export function FlameIcon(props: IconProps) {
  return <Icon {...props}><path d="M13.5 2.5c.7 4-2.4 4.8-1.8 8.2.5-1.4 1.5-2.2 2.8-3 2.2 2 3.5 4.2 3.5 6.8a6 6 0 0 1-12 0c0-3.8 2.2-7.7 7.5-12Z" {...stroke} /></Icon>;
}

export function LockIcon(props: IconProps) {
  return <Icon {...props}><path d="M7 10V8a5 5 0 0 1 10 0v2m-9 0h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" {...stroke} /></Icon>;
}

export function EyeIcon(props: IconProps) {
  return <Icon {...props}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" {...stroke} /><circle cx="12" cy="12" r="3" {...stroke} /></Icon>;
}

export function EyeOffIcon(props: IconProps) {
  return <Icon {...props}><path d="m3 3 18 18M10.6 10.6a3 3 0 0 0 3.8 3.8M9.4 5.5A10 10 0 0 1 12 5c6 0 9.5 7 9.5 7a15.5 15.5 0 0 1-2.8 3.8M6.6 6.9C3.9 8.7 2.5 12 2.5 12s3.5 7 9.5 7c1.5 0 2.9-.4 4.1-1" {...stroke} /></Icon>;
}

export function ShieldLockIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 2.5 5 5.4v6c0 4.3 2.9 8.2 7 9.6 4.1-1.4 7-5.3 7-9.6v-6L12 2.5Z" {...stroke} /><path d="M9 12h6v5H9v-5Zm1.6 0v-1.6a1.4 1.4 0 0 1 2.8 0V12" {...stroke} /></Icon>;
}

export function ShieldCheckIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 2.5 5 5.4v6c0 4.3 2.9 8.2 7 9.6 4.1-1.4 7-5.3 7-9.6v-6L12 2.5Z" {...stroke} /><path d="m8.5 12.2 2.3 2.3 4.9-5" {...stroke} /></Icon>;
}

export function SpeedIcon(props: IconProps) {
  return <Icon {...props}><path d="M4.8 18.2A9 9 0 1 1 19.2 18M12 5v2M3 14h2m14 0h2M5.6 7.6 7 9m10-1.4L15.6 9M12 14l4-3" {...stroke} /></Icon>;
}

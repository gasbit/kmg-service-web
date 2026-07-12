import type { AuthUser } from "@/features/auth/auth.types";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

type TopBarProps = {
  user: AuthUser | null;
};

export function TopBar({ user }: TopBarProps) {
  return (
    <header
      aria-label="Top bar"
      className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4"
    >
      <div>
        <p className="text-sm font-bold text-slate-900">ร้านขวัญเมืองแก๊ส</p>
        <p className="text-xs font-medium text-slate-500">{user ? `${user.name} (${user.role.code})` : "Admin"}</p>
      </div>
      <form action={logoutAction}>
        <Button size="sm" type="submit" variant="secondary">
          ออกจากระบบ
        </Button>
      </form>
    </header>
  );
}

import { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useSetUserRoles } from './hooks/use-users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { UserPlus, Search, Shield, ShieldOff } from 'lucide-react';
import type { Role } from '@/types/user';

const ALL_ROLES: { value: Role; label: string }[] = [
  { value: 'employee', label: 'Mitarbeiter' },
  { value: 'manager', label: 'Manager' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'event_admin', label: 'Event-Admin' },
];

const ROLE_COLORS: Record<string, string> = {
  employee: 'bg-slate-100 text-slate-700 border-slate-200',
  manager: 'bg-blue-100 text-blue-700 border-blue-200',
  marketing: 'bg-purple-100 text-purple-700 border-purple-200',
  event_admin: 'bg-teal-100 text-teal-700 border-teal-200',
};

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [rolesDialogUser, setRolesDialogUser] = useState<{
    id: string;
    displayName: string;
    roles: string[];
  } | null>(null);

  const { data: users, isLoading } = useUsers(search || undefined);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const setUserRoles = useSetUserRoles();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Benutzerverwaltung</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Neuer Benutzer
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suchen nach Name oder E-Mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* User list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {users?.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.displayName}</span>
                    {!user.isActive && (
                      <Badge variant="destructive" className="text-xs">
                        Deaktiviert
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="flex gap-1.5 pt-1">
                    {user.roles.map((role) => (
                      <Badge
                        key={role}
                        variant="outline"
                        className={ROLE_COLORS[role] ?? ''}
                      >
                        {ALL_ROLES.find((r) => r.value === role)?.label ?? role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setRolesDialogUser({
                        id: user.id,
                        displayName: user.displayName,
                        roles: [...user.roles],
                      })
                    }
                  >
                    Rollen
                  </Button>
                  <Button
                    variant={user.isActive ? 'outline' : 'default'}
                    size="sm"
                    onClick={() =>
                      updateUser.mutate({ id: user.id, isActive: !user.isActive })
                    }
                  >
                    {user.isActive ? (
                      <>
                        <ShieldOff className="mr-1 h-3 w-3" />
                        Deaktivieren
                      </>
                    ) : (
                      <>
                        <Shield className="mr-1 h-3 w-3" />
                        Aktivieren
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {users?.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">Keine Benutzer gefunden.</p>
          )}
        </div>
      )}

      {/* Create user dialog */}
      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(data) => {
          createUser.mutate(data, { onSuccess: () => setCreateOpen(false) });
        }}
        isPending={createUser.isPending}
      />

      {/* Edit roles dialog */}
      {rolesDialogUser && (
        <RolesDialog
          user={rolesDialogUser}
          onOpenChange={(open) => {
            if (!open) setRolesDialogUser(null);
          }}
          onSubmit={(roles) => {
            setUserRoles.mutate(
              { id: rolesDialogUser.id, roles },
              { onSuccess: () => setRolesDialogUser(null) },
            );
          }}
          isPending={setUserRoles.isPending}
        />
      )}
    </div>
  );
}

// --- Create User Dialog ---

function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { email: string; displayName: string; password: string; roles: Role[] }) => void;
  isPending: boolean;
}) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState<Role[]>(['employee']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, displayName, password, roles });
  };

  const toggleRole = (role: Role) => {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setEmail('');
          setDisplayName('');
          setPassword('');
          setRoles(['employee']);
        }
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuen Benutzer anlegen</DialogTitle>
          <DialogDescription>
            Der Benutzer kann sich anschließend mit den Zugangsdaten anmelden.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Rollen</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => toggleRole(r.value)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    roles.includes(r.value)
                      ? ROLE_COLORS[r.value]
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending || roles.length === 0}>
              {isPending ? 'Wird angelegt...' : 'Benutzer anlegen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Roles Dialog ---

function RolesDialog({
  user,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  user: { id: string; displayName: string; roles: string[] };
  onOpenChange: (open: boolean) => void;
  onSubmit: (roles: Role[]) => void;
  isPending: boolean;
}) {
  const [roles, setRoles] = useState<Role[]>(user.roles as Role[]);

  const toggleRole = (role: Role) => {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rollen für {user.displayName}</DialogTitle>
          <DialogDescription>
            Wählen Sie die Rollen, die dieser Benutzer haben soll.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2 py-4">
          {ALL_ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => toggleRole(r.value)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                roles.includes(r.value)
                  ? ROLE_COLORS[r.value]
                  : 'border-border bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button
            onClick={() => onSubmit(roles)}
            disabled={isPending || roles.length === 0}
          >
            {isPending ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

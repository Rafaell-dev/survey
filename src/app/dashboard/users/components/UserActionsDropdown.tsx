import { useState } from 'react';
import { UserDTO } from '@/domain/user.types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, KeyRound, ShieldAlert, ShieldCheck, UserCog } from 'lucide-react';
import { ResetPasswordModal } from './ResetPasswordModal';
import { ChangeRoleModal } from './ChangeRoleModal';
import { AccessControlModal } from './AccessControlModal';

interface Props {
  user: UserDTO;
  onUpdate: () => void;
}

export function UserActionsDropdown({ user, onUpdate }: Props) {
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [accessControlOpen, setAccessControlOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setResetPasswordOpen(true)} className="cursor-pointer">
            <KeyRound className="mr-2 h-4 w-4" />
            Redefinir senha
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setChangeRoleOpen(true)} className="cursor-pointer">
            <UserCog className="mr-2 h-4 w-4" />
            Alterar tipo
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setAccessControlOpen(true)} className="cursor-pointer text-destructive focus:text-destructive">
            {user.status === 'BLOCKED' ? (
              <><ShieldCheck className="mr-2 h-4 w-4" /> Liberar acesso</>
            ) : (
              <><ShieldAlert className="mr-2 h-4 w-4" /> Bloquear acesso</>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ResetPasswordModal 
        user={user} 
        isOpen={resetPasswordOpen} 
        onClose={() => setResetPasswordOpen(false)} 
        onSuccess={onUpdate}
      />
      <ChangeRoleModal 
        user={user} 
        isOpen={changeRoleOpen} 
        onClose={() => setChangeRoleOpen(false)} 
        onSuccess={onUpdate}
      />
      <AccessControlModal 
        user={user} 
        isOpen={accessControlOpen} 
        onClose={() => setAccessControlOpen(false)} 
        onSuccess={onUpdate}
      />
    </>
  );
}

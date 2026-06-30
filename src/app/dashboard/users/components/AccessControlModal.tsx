import { useState } from 'react';
import { UserDTO } from '@/domain/user.types';
import { userService } from '@/services/user.service';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  user: UserDTO;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AccessControlModal({ user, isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBlocked = user.status === 'BLOCKED';
  const newStatus = isBlocked ? 'ACTIVE' : 'BLOCKED';

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await userService.updateAccessStatus(user.id, { status: newStatus });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao alterar o acesso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Liberar/Bloquear acesso</DialogTitle>
          <DialogDescription>
            {isBlocked 
              ? `Tem certeza que deseja liberar o acesso para ${user.email}? Eles poderão fazer login na plataforma.`
              : `Atenção: Usuário bloqueado não poderá acessar a plataforma. Tem certeza que deseja bloquear ${user.email}?`
            }
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant={isBlocked ? "default" : "destructive"} 
            onClick={handleConfirm} 
            disabled={loading}
          >
            {loading ? 'Processando...' : isBlocked ? 'Liberar Acesso' : 'Bloquear Acesso'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

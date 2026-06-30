"use client";

import { useEffect, useState } from 'react';
import { UserDTO } from '@/domain/user.types';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserActionsDropdown } from './components/UserActionsDropdown';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UsersManagement() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const authUser = useAuthStore(state => state.user);
  const router = useRouter();

  useEffect(() => {
    if (authUser && authUser.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [authUser, router]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao carregar os usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser?.role === 'ADMIN') {
      loadUsers();
    }
  }, [authUser]);

  if (!authUser || authUser.role !== 'ADMIN') return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h2>
        <p className="text-muted-foreground mt-2">
          Administre contas, controle acessos e defina permissões.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contas Registradas</CardTitle>
          <CardDescription>Gerencie todos os usuários que acessam a plataforma LingSurvey.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8 text-muted-foreground">
              Carregando usuários...
            </div>
          ) : error ? (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo de Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="w-[80px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                            {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'ACTIVE' ? 'outline' : 'destructive'} className={user.status === 'ACTIVE' ? 'border-green-500 text-green-600' : ''}>
                            {user.status === 'ACTIVE' ? 'Ativo' : 'Bloqueado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <UserActionsDropdown user={user} onUpdate={loadUsers} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

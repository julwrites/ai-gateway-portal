"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { UserResponse } from '@/types/users';

interface UserListProps {
  users: UserResponse[];
  onEdit: (user: UserResponse) => void;
  onDelete: (userId: string) => void;
}

export function UserList({ users, onEdit, onDelete }: UserListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Teams</TableHead>
            <TableHead>Models</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Rate Limits</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.user_id}>
              <TableCell className="font-medium">
                {user.user_id}
              </TableCell>
              <TableCell>
                {user.user_email || 'N/A'}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {user.user_role || 'No Role'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {user.teams && user.teams.length > 0 ? (
                    user.teams.map((team, idx) => (
                      <Badge key={idx} variant="secondary">
                        {team}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">No teams</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {user.models && user.models.length > 0 ? (
                    user.models.map((model, idx) => (
                      <Badge key={idx} variant="outline">
                        {model}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">All models</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  {user.spend !== undefined && (
                    <span>${user.spend.toFixed(2)} spent</span>
                  )}
                  {user.max_budget && (
                    <span className="text-sm text-gray-500">
                      ${user.max_budget} limit
                      {user.budget_duration && ` / ${user.budget_duration}`}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  {user.tpm_limit && <span>{user.tpm_limit} TPM</span>}
                  {user.rpm_limit && <span>{user.rpm_limit} RPM</span>}
                  {!user.tpm_limit && !user.rpm_limit && (
                    <span className="text-gray-500">No limits</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(user.user_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

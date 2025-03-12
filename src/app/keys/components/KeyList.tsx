'use client';

import { useState } from 'react';
import { APIKey } from "@/types/keys";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Copy } from "lucide-react";
import { KeyForm } from './KeyForm';

interface KeyListProps {
  keys: APIKey[];
  onEdit: (key: APIKey) => void;
  onDelete: (keyId: string) => void;
}

export function KeyList({ keys, onEdit, onDelete }: KeyListProps) {
  const [editingKey, setEditingKey] = useState<APIKey | null>(null);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    // TODO: Add toast notification
  };

  const handleEditClick = (key: APIKey) => {
    setEditingKey(key);
  };

  const handleEditSubmit = async (updatedData: Partial<APIKey>) => {
    if (editingKey) {
      await onEdit({ ...editingKey, ...updatedData });
      setEditingKey(null);
    }
  };

  if (!keys || keys.length === 0) {
    return <div>No API keys found.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key Name</TableHead>
            <TableHead>Models</TableHead>
            <TableHead>Spend</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Rate Limits</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key.key}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{key.key_alias || 'Unnamed Key'}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-gray-500">{key.key.substring(0, 8)}...</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => handleCopyKey(key.key)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {key.models && key.models.length > 0 ? (
                    key.models.map((model, idx) => (
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
                <span>${key.spend.toFixed(2)} spent</span>
              </TableCell>
              <TableCell>
                {key.max_budget ? (
                  <div className="flex flex-col">
                    <span>${key.max_budget} limit</span>
                    {key.budget_duration && (
                      <span className="text-sm text-gray-500">
                        per {key.budget_duration}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">No budget set</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  {key.tpm_limit && <span>{key.tpm_limit} TPM</span>}
                  {key.rpm_limit && <span>{key.rpm_limit} RPM</span>}
                  {!key.tpm_limit && !key.rpm_limit && (
                    <span className="text-gray-500">No limits</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {key.created_at && (
                  <span className="text-sm text-gray-500">
                    {new Date(key.created_at).toLocaleDateString()}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(key)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(key.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingKey && (
        <KeyForm
          onSubmit={handleEditSubmit}
          onClose={() => setEditingKey(null)}
          initialData={editingKey}
          isEdit={true}
        />
      )}
    </div>
  );
}
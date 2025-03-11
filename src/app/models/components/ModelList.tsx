"use client";

import { Model } from "@/types/models";
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
import { Edit, Trash2, Power } from "lucide-react";

interface ModelListProps {
  models: Model[];
  onEdit: (model: Model) => void;
  onDelete: (modelId: string) => void;
  onToggleActive: (modelId: string, isActive: boolean) => void;
}

export function ModelList({ models, onEdit, onDelete, onToggleActive }: ModelListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Model ID</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Token Limits</TableHead>
            <TableHead>Pricing</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((model) => (
            <TableRow key={model.model_id}>
              <TableCell className="font-medium">
                {model.model_id}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {model.provider}
                </Badge>
              </TableCell>
              <TableCell>
                {model.display_name || model.model_id}
                {model.description && (
                  <p className="text-sm text-gray-500">{model.description}</p>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={model.is_active ? "default" : "secondary"}>
                  {model.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                {model.max_tokens ? (
                  <span>{model.max_tokens.toLocaleString()} tokens</span>
                ) : (
                  <span className="text-gray-500">No limit</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  {model.input_cost_per_token && (
                    <span>Input: ${model.input_cost_per_token}/token</span>
                  )}
                  {model.output_cost_per_token && (
                    <span>Output: ${model.output_cost_per_token}/token</span>
                  )}
                  {model.cost_per_token && (
                    <span>${model.cost_per_token}/token</span>
                  )}
                  {!model.input_cost_per_token && !model.output_cost_per_token && !model.cost_per_token && (
                    <span className="text-gray-500">No pricing set</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleActive(model.model_id, !model.is_active)}
                  >
                    <Power className={`h-4 w-4 ${model.is_active ? 'text-green-500' : 'text-gray-500'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(model)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(model.model_id)}
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

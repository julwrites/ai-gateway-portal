import { Model } from "@/types/models";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ModelListProps {
  models: Model[];
}

export function ModelList({ models }: ModelListProps) {
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

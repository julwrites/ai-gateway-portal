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

// Helper function to format price values per 1000 tokens
const formatPricePer1000Tokens = (pricePerToken: number): string => {
  if (pricePerToken === undefined || pricePerToken === null) {
    return 'N/A';
  }
  
  // Convert price per token to price per 1000 tokens
  const pricePer1000 = pricePerToken * 1000;
  
  // Format based on the value
  if (pricePer1000 < 0.01) {
    return `$${pricePer1000.toFixed(4)}`;
  } else if (pricePer1000 < 1) {
    return `$${pricePer1000.toFixed(3)}`;
  } else {
    return `$${pricePer1000.toFixed(2)}`;
  }
};

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
            <TableHead>Input Price (per 1K)</TableHead>
            <TableHead>Output Price (per 1K)</TableHead>
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
                {model.input_cost_per_token !== undefined ? (
                  formatPricePer1000Tokens(model.input_cost_per_token)
                ) : model.cost_per_token !== undefined ? (
                  formatPricePer1000Tokens(model.cost_per_token)
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </TableCell>
              <TableCell>
                {model.output_cost_per_token !== undefined ? (
                  formatPricePer1000Tokens(model.output_cost_per_token)
                ) : model.cost_per_token !== undefined ? (
                  formatPricePer1000Tokens(model.cost_per_token)
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

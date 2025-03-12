"use client";

import { Team } from "@/types/teams";
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

interface TeamListProps {
  teams: Team[];
  onEdit: (team: Team) => void;
  onDelete: (teamId: string) => void;
}

export function TeamList({ teams, onEdit, onDelete }: TeamListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team Name</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Models</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Spend</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.team_id}>
              <TableCell className="font-medium">
                {team.team_alias || team.team_id}
              </TableCell>
              <TableCell>
                {team.members_with_roles && team.members_with_roles.length > 0 ? (
                  team.members_with_roles.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span>
                        {member.user_email || member.user_id}
                        {member.role === "admin" && (
                          <Badge variant="secondary" className="ml-2">
                            Admin
                          </Badge>
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">No members</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {team.models && team.models.length > 0 ? (
                    team.models.map((model, idx) => (
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
                {team.max_budget !== undefined ? (
                  <div>
                    ${team.max_budget}
                    {team.budget_duration && (
                      <span className="text-gray-500">
                        {" "}
                        / {team.budget_duration}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">No budget set</span>
                )}
              </TableCell>
              <TableCell>
                {team.spend !== undefined ? (
                  <div>${team.spend.toFixed(2)}</div>
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(team)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(team.team_id)}
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
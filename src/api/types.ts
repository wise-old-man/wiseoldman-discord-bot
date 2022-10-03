export interface NameChange {
  id: number;
  playerId: number;
  oldName: string;
  newName: string;
  status: number;
  resolvedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

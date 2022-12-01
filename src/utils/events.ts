export interface Event {
  type: string;
  execute(data: unknown): void;
}

export type JsonResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): { json(body: unknown): void };
};

export type JsonResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): { json(body: unknown): void };
};

export type ApiRequest = {
  url?: string | null;
};

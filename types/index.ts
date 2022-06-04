export type ListResources<K extends string, V> = {
  _embedded: Record<K, V[]>;
  _links: Record<"self" | "profile", { href: string }>;
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
};

export interface PublicCategoryDefinition {
  key: string;
  label: string;
  aliases: readonly string[];
}

export const PUBLIC_CATEGORIES: readonly PublicCategoryDefinition[] = [
  { key: 'العالم', label: 'العالم', aliases: ['العالم', 'World', 'مصادر عالمية'] },
  { key: 'الرياضة', label: 'الرياضة', aliases: ['الرياضة', 'رياضة', 'Sports'] },
  { key: 'تكنولوجيا', label: 'تكنولوجيا', aliases: ['تكنولوجيا', 'التكنولوجيا', 'Technology'] },
  { key: 'اقتصاد', label: 'اقتصاد', aliases: ['اقتصاد', 'الاقتصاد', 'Economy', 'Business'] },
  { key: 'سيارات', label: 'سيارات', aliases: ['سيارات', 'السيارات', 'Cars'] },
  { key: 'منوعات', label: 'منوعات', aliases: ['منوعات', 'ترفيه', 'الترفيه', 'Variety', 'Entertainment'] },
] as const;

function normalizeCategory(value: string): string {
  return value.trim().toLocaleLowerCase('ar');
}

export function getPublicCategory(value?: string | null): PublicCategoryDefinition | undefined {
  if (!value) return undefined;
  const normalized = normalizeCategory(value);
  return PUBLIC_CATEGORIES.find((category) =>
    category.aliases.some((alias) => normalizeCategory(alias) === normalized),
  );
}

export function matchesPublicCategory(apiName: string, category: PublicCategoryDefinition): boolean {
  const normalized = normalizeCategory(apiName);
  return category.aliases.some((alias) => normalizeCategory(alias) === normalized);
}

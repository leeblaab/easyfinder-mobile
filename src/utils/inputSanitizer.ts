/**
 * Sanitizes input queries to prevent injection attacks and API abuse.
 * Strips potentially harmful characters (e.g. HTML tags, quotes, braces)
 * and enforces length limits.
 */
export function sanitizeSearchQuery(query: string | null | undefined): string {
  if (!query) return '';

  // Limit search queries to a maximum of 100 characters
  let sanitized = query.substring(0, 100);

  // Strip characters commonly used for HTML/JS injection or query injection
  sanitized = sanitized.replace(/[<>{}[\]$"'`\\();]/g, '');

  return sanitized.trim();
}

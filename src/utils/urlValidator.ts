/**
 * Validates and sanitizes standard deep links and URLs to prevent scheme injection
 * and other malicious protocol exploits.
 * 
 * Whitelists allowed protocols: tel:, https:, http:, whatsapp:, mailto:
 * Blocks harmful schemes such as javascript:, file:, data:, etc.
 */
export function validateAndSanitizeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  const trimmedUrl = url.trim();
  const lowerUrl = trimmedUrl.toLowerCase();

  // Define allowed protocol prefixes
  const allowedPrefixes = [
    'https://',
    'http://',
    'tel:',
    'whatsapp:',
    'mailto:'
  ];

  // Check if it starts with any allowed protocol
  const hasAllowedPrefix = allowedPrefixes.some(prefix => lowerUrl.startsWith(prefix));
  if (!hasAllowedPrefix) {
    return false;
  }

  // Detect and block dangerous patterns
  const maliciousPatterns = [
    'javascript:',
    'file:',
    'data:',
    'vbscript:',
    'onload',
    'onerror',
    '<'
  ];

  const hasMaliciousPattern = maliciousPatterns.some(pattern => lowerUrl.includes(pattern));
  if (hasMaliciousPattern) {
    return false;
  }

  return true;
}

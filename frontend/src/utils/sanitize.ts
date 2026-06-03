// src/utils/sanitize.ts
import DOMPurify from 'dompurify';

/**
 * Sanitize user-supplied HTML or text before rendering.
 * Use when rendering untrusted content via dangerouslySetInnerHTML.
 */
export const sanitizeHtml = (dirty: string): string =>
  DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

/**
 * Strip all HTML tags — returns plain text only.
 */
export const sanitizeText = (input: string): string =>
  DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

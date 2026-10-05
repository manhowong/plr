/**
 * Utility functions for sanitizing and formatting file and entity names.
 */

/**
 * Trims and normalizes a file name, ensuring it ends with the specified extension.
 */
export function sanitizeFileName(name: string, ext = '.md'): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  return trimmed.endsWith(ext) ? trimmed : `${trimmed}${ext}`;
}

/**
 * Strips a file extension (default '.md') from a display name.
 */
export function stripFileExtension(fileName: string, ext = '.md'): string {
  if (fileName.endsWith(ext)) {
    return fileName.slice(0, -ext.length);
  }
  return fileName;
}

/**
 * Trims and validates general item names (e.g. profile or project identifiers).
 */
export function sanitizeItemName(name: string): string {
  return name.trim();
}

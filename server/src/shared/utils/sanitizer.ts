/**
 * Simple sanitizer to strip HTML tags from a string.
 * This is a basic protection against XSS when HTML input is not expected.
 */
export const sanitize = (text: string): string => {
  if (!text || typeof text !== "string") return text;
  
  // Strip HTML tags using regex
  // This is a common pattern for stripping tags: < any characters > 
  return text.replace(/<[^>]*>?/gm, "").trim();
};

/**
 * Sanitize an object by applying the sanitize function to all string properties.
 * Useful for sanitizing request bodies or address objects.
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const result = { ...obj };
  
  for (const key in result) {
    if (typeof result[key] === "string") {
      (result as any)[key] = sanitize(result[key]);
    } else if (result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
      result[key] = sanitizeObject(result[key]);
    }
  }
  
  return result;
};

/** Only same-site relative paths are allowed as post-login destinations (no open redirects). */
export function safeRedirectPath(
  value: string | string[] | undefined,
  fallback = '/dashboard',
): string {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\'))
    return fallback;
  return path;
}

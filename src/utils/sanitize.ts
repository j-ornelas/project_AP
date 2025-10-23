/**
 * Escape HTML special characters to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize and validate player name
 * - Max length: 20 characters
 * - Removes leading/trailing whitespace
 * - Escapes HTML special characters
 */
export function sanitizePlayerName(name: string): string {
  // Trim and limit length
  let sanitized = name.trim().substring(0, 20);

  // Replace if empty
  if (sanitized.length === 0) {
    sanitized = "Player";
  }

  // Escape HTML
  return escapeHtml(sanitized);
}

/**
 * Validate color hex code to prevent CSS injection
 */
export function sanitizeColor(color: string): string {
  // Only allow valid hex colors
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  return hexPattern.test(color) ? color : "#4CAF50";
}

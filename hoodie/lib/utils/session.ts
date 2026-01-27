/**
 * Session management utilities for design uploads
 * Uses sessionStorage to maintain a session ID for tracking design uploads
 */

const SESSION_KEY = 'design-session-id';

/**
 * Get or create a unique session ID for the current browser session
 * This ID is used to track design uploads and allow cleanup of orphaned images
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side: return a placeholder (will be replaced client-side)
    return 'server-placeholder';
  }

  let sessionId = sessionStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Clear the current session ID
 * Used when user completes an order or explicitly wants a fresh session
 */
export function clearSessionId(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Generate a new session ID (force refresh)
 */
export function regenerateSessionId(): string {
  if (typeof window === 'undefined') {
    return 'server-placeholder';
  }

  const sessionId = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

/**
 * Detects if an error indicates that the user rejected a wallet signature request.
 * Checks both error messages and EIP-1193 error codes.
 */
export function isUserRejection(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("user rejected") ||
      message.includes("user denied") ||
      message.includes("rejected the request") ||
      message.includes("action_rejected") ||
      message.includes("user cancelled") ||
      message.includes("user canceled")
    );
  }
  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as { code: number }).code === 4001;
  }
  return false;
}

/**
 * Detects if an error is a CORS error
 */
export function isCorsError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("cors") ||
      message.includes("access-control-allow-origin") ||
      message.includes("cross-origin") ||
      message.includes("network error") ||
      message.includes("failed to fetch")
    );
  }
  return false;
}

/**
 * Detects if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network error") ||
      message.includes("failed to fetch") ||
      message.includes("network request failed") ||
      message.includes("timeout") ||
      message.includes("connection refused")
    );
  }
  return false;
}

/**
 * Formats error for logging with detailed information
 */
export function formatErrorForLogging(error: unknown): string {
  if (error instanceof Error) {
    let details = error.message;
    if (error.stack) {
      details += `\nStack: ${error.stack}`;
    }
    if (error.cause) {
      details += `\nCause: ${error.cause}`;
    }
    return details;
  }
  if (typeof error === "object" && error !== null) {
    return JSON.stringify(error, null, 2);
  }
  return String(error);
}

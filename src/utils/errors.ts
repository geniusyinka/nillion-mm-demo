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

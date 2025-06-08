/**
 * Utility functions for formatting user information in the admin interface
 */

/**
 * Formats a user ID into a user number with padding (e.g., USER001, USER002)
 * @param userId - The numeric user ID from the database
 * @param prefix - The prefix to use (default: "USER")
 * @param padding - The number of digits to pad to (default: 3)
 * @returns Formatted user number string
 */
export function formatUserNumber(userId: number, prefix: string = "USER", padding: number = 3): string {
  return `${prefix}${userId.toString().padStart(padding, '0')}`;
}

/**
 * Formats user display information including user number and name
 * @param user - User object with id, firstName, lastName, and email
 * @returns Object with formatted user information
 */
export function formatUserDisplay(user: { id: number; firstName?: string; lastName?: string; email: string }) {
  const userNumber = formatUserNumber(user.id);
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
  
  return {
    userNumber,
    fullName,
    displayName: `${userNumber} - ${fullName}`,
    email: user.email
  };
}

/**
 * Formats transaction display with user number for better tracking
 * @param transaction - Transaction object with user information
 * @returns Object with formatted transaction display information
 */
export function formatTransactionDisplay(transaction: { 
  id: string; 
  amount: number; 
  user: { id: number; firstName?: string; lastName?: string; email: string };
  type: string;
  status: string;
  createdAt: string;
}) {
  const userDisplay = formatUserDisplay(transaction.user);
  
  return {
    ...transaction,
    userDisplay,
    formattedAmount: `$${transaction.amount.toFixed(2)}`,
    formattedDate: new Date(transaction.createdAt).toLocaleString()
  };
}

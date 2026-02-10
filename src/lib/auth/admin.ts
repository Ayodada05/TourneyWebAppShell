export function isAdmin(userId: string | null | undefined): boolean {
  if (!userId) {
    return false;
  }

  return userId === process.env.ADMIN_USER_ID;
}

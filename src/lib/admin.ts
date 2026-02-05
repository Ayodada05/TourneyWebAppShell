export const ADMIN_ID = "fad64ddc-d436-4c4b-b2dd-0ba86fe8c99f";

export function isAdmin(userId: string | null | undefined) {
  return userId === ADMIN_ID;
}

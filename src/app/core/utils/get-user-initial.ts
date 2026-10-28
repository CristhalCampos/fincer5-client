/**
 * Obtiene la inicial para el avatar del usuario.
 * Prioridad: 1. Name, 2. Username, 3. Fallback 'U'
 */
export function getUserInitial(
  name?: string | null,
  username?: string | null
): string {
  // 1. Si hay name, usamos su primera letra
  if (name && name.trim().length > 0) {
    return name.trim().charAt(0).toUpperCase();
  }

  // 2. Si hay username, usamos su primera letra
  if (username && username.trim().length > 0) {
    return username.trim().charAt(0).toUpperCase();
  }

  // 3. Fallback por defecto
  return 'U';
}
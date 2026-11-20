// Nombre y apellido de un usuario. Las cuentas de email los guardan por separado (firstName / lastName);
// las de GitHub/Google creadas antes de guardarlos solo tienen `name`: se parte en primera palabra y resto.
interface NameFields {
  name: string;
  firstName?: string | null;
  lastName?: string | null;
}

export const getFirstAndLastName = (user: NameFields): { firstName: string; lastName: string } => {
  if (user.firstName || user.lastName) {
    return { firstName: user.firstName ?? "", lastName: user.lastName ?? "" };
  }
  const [firstName = "", ...rest] = user.name.trim().split(/\s+/).filter(Boolean);
  return { firstName, lastName: rest.join(" ") };
};

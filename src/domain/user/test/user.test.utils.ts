import { CreateUserDto } from "../dto/create-user.dto";

export function generateTestUsers(
  n: number,
  customName?: string,
  customDomain?: string
) {
  const userName = customName || "test";
  const userDomain = customDomain || "gtest";

  const users: CreateUserDto[] = Array.from(Array(n).keys()).map((_, idx) => {
    return {
      email: `${userName}${idx}@${userDomain}${idx}.com`,
      firstName: `${userName}${idx}`,
      lastName: `${userName}${idx}`,
    };
  });
  return users;
}

export class CreateUserDto {
  userPictureLink?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthdate?: string;
  gender?: string;
  hometown?: string;
  email: string;
  phone?: string;
  address?: string;
}

export class UpdateUserDto {
  userPictureLink?: string;
  userPictureKey?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  IntroductionText?: string;
  IntroductionImageLinks?: [];
  birthdate?: string;
  dateOfDeath?: string;
  deceased?: boolean;
  gender?: string;
  hometown?: string;
  HomeCountry ?: string;
  email?: string;
  phone?: string;
  address?: string;
  spouse?: [];
  kids?: [];
  socialNetworks?: [];
  work?: [];
  education?: [];
}

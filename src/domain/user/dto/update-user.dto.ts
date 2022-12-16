export class UpdateUserDto {
  userPictureLink?: string;
  userPictureKey?: string;
  firstName?: string;
  maidenName?: string;
  lastName?: string;
  introduction?: [];
  birthdate?: string;
  dateOfDeath?: string;
  isDeceased?: boolean;
  isActivated?: boolean;
  gender?: string;
  hometown?: string;
  homeCountry?: string;
  email?: string;
  phone?: string;
  address?: string;
  spouseTreeId?: string;
  myTreeIdByParent1?: string;
  myTreeIdByParent2?: string;
  // spouse?: [];
  // kids?: [];
  // parents?: [];
  // siblings?: [];
  socialNetworks?: [];
  work?: [];
  education?: [];
  storageFolderId?: string;
}

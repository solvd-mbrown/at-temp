import { IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
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
  bornAddress?: [];
  spouseTreeId?: string;
  myTreeIdByParent1?: string;
  myTreeIdByParent2?: string;
  socialNetworks?: [];
  employerAndPosition?: string;
  pets?: string;
  education?: [];
  setting?: [];
  storageFolderId?: string;
  anniversaryDate?: string;
}

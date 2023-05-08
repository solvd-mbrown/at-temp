import { IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  userPictureLink?: string;
  userPictureKey?: string;
  firstName: string;
  maidenName?: string;
  lastName: string;
  birthdate?: string;
  dateOfDeath?: string;
  isDeceased?: boolean;
  isActivated?: boolean;
  gender?: string;
  hometown?: string;
  homeCountry?: string;
  email: string;
  phone?: string;
  address?: string;
  spouseTreeId?: string;
  myTreeIdByParent1?: string;
  myTreeIdByParent2?: string;
  storageFolderId?: string;
  anniversaryDate?: string;
}
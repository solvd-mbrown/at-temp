type Nullable<T> = T | null;

export class User {
  __typename?: "User";
  id: number;
  treeName?: Nullable<string>;
  email: string;
  firstName?: Nullable<string>;
  maidenName?: Nullable<string>;
  lastName?: Nullable<string>;
  createDate?: Nullable<string>;
  updateDate?: Nullable<string>;
  isActivated?: Nullable<boolean>;
  userPictureLink?: Nullable<string>;
  birthdate?: Nullable<string>;
  gender?: Nullable<string>;
  hometown?: Nullable<string>;
  phone?: Nullable<string>;
  address?: Nullable<string>;
  storageFolderId?: Nullable<string>;
}

declare type Nullable<T> = T | null;
export declare class User {
    __typename?: 'User';
    id: number;
    TreeName?: Nullable<string>;
    email: string;
    firstName?: Nullable<string>;
    middleName?: Nullable<string>;
    lastName?: Nullable<string>;
    createDate?: Nullable<string>;
    updateDate?: Nullable<string>;
    isActivated?: Nullable<boolean>;
    userPictureLink?: string;
    birthdate?: string;
    gender?: string;
    hometown?: string;
    phone?: string;
    address?: string;
}
export {};

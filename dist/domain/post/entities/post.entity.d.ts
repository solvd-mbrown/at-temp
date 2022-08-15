declare type Nullable<T> = T | null;
export declare class Post {
    __typename?: 'Post';
    id: number;
    treeUUID: string;
    publishedBy: string;
    postType?: Nullable<string>;
    postBody?: Nullable<string>;
    comments?: Nullable<string>;
    createDate?: Nullable<string>;
    updateDate?: Nullable<string>;
}
export {};

declare type Storage = {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
    remove: (key: string) => void;
};
export declare type ShareInfo = {
    title: string;
    content: string;
    url: string;
    image: string;
};
export declare type Signture = {
    app_id: string;
    timestamp: number;
    noncestr: string;
    signature: string;
};
export declare type Query = {
    code?: string;
    state?: string;
    timestamp?: number;
};
export declare type QueryCheckRule = {
    expireSeconds?: number;
    once?: boolean;
};
export interface Config {
    storage: Storage;
    getTimestamp: () => number;
}
export {};

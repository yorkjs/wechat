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
    appId: string;
    timestamp: number;
    nonceStr: string;
    signature: string;
};
export declare type ApiList = string[];
export declare type Query = {
    code?: string;
    state?: string;
};
export declare type QueryCheckRule = {
    expireSeconds?: number;
    once?: boolean;
};
export interface Config {
    storage: Storage;
    getTimestamp: () => number;
    onPageLeave: (callback: () => void) => void;
}
export {};

declare type Storage = {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
    remove: (key: string) => void;
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
export declare type SignParams = {
    appId: string;
    appType: number;
    url: string;
};
export interface Config {
    storage: Storage;
    getTimestamp: () => number;
    jssdkSignture: (params: SignParams) => Promise<any>;
}
export {};
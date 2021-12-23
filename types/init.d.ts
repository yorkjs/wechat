import { Config } from './type';
export declare function init(config: Config): void;
export declare function getGlobalConfig(): Config;
export declare function getStorage(key: string): any;
export declare function setStorage(key: string, value: any): void;
export declare function removeStorage(key: string): void;

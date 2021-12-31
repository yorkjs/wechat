export declare function endAuth(biz: string): void;
export declare function normalizeShareUrl(url: string, callback?: (urlObject: Record<string, string>) => void): string;
export declare function normalizeUrl(url: string, callback?: (urlObject: Record<string, string>) => void): string;
export declare function startAuth(biz: string, url: string, appId: string, componentAppId?: string): void;
export declare function startSilentAuth(biz: string, url: string, appId: string, componentAppId?: string): void;

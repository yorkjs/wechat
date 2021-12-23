declare global {
    interface Window {
        sendMessage: any;
    }
}
export declare function share(shareInfo: any, appId: string, appType: number, isWechat?: boolean): void;

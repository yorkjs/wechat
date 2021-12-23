declare global {
    interface Window {
        WeixinJSBridge: any;
    }
}
export declare function pay(params: any): Promise<any>;

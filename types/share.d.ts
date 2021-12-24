import { ShareInfo, Signture } from './type';
export declare function share(wx: any, shareInfo: ShareInfo, getSignture: () => Promise<Signture>): Promise<void>;

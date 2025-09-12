export interface MetaletColdRr {
    name:ActionType,
    publicKey:string,
    hex?:string,
    address:string
}


export enum ActionType{
    CONNECT="Connect",
    SEND_BTC_UN_SIGN="SendBtc_unSign",
    SEND_SPACE_UN_SIGN="SendSpace_unSign"
}
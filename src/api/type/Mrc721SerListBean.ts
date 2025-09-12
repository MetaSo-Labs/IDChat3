import { Mrc721ItemBean } from "./Mrc721ItemBean";

export interface Mrc721SerListBean {
  collectionName: string;
  name: string;
  totalSupply: number;
  royaltyRate: number;
  desc: string;
  website: string;
  cover: string;
  metadata: string;
  pinId: string;
  address: string;
  metaId: string;
  createTime: number;
  totalNum: number;
  mrcDetailList:Mrc721ItemBean[];
}

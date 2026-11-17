import data from './officialBriefs.json';
import type {PublicSourceRefresh} from '../types';
export type OfficialBrief=typeof data.himayah;
export const briefs=data as Record<keyof typeof data,OfficialBrief>;
export function normalizeExcerpt(value:string){return value.replace(/\s+/g,' ').trim()}
export function reconcileBrief(brief:OfficialBrief,result:PublicSourceRefresh):OfficialBrief|null {
 const receipt=result.receipt;
 if(receipt.status!=='retrieved'||receipt.source_id!==brief.source_id||receipt.url!==brief.url||!receipt.fetched_at||!Number.isFinite(Date.parse(receipt.fetched_at))||!receipt.raw_sha256||!receipt.text_sha256||!/^([a-f\d]{64})$/.test(receipt.raw_sha256)||!/^([a-f\d]{64})$/.test(receipt.text_sha256))return null;
 if(!normalizeExcerpt(result.source_content).includes(normalizeExcerpt(brief.quote)))return null;
 return {...brief,fetched_at:receipt.fetched_at,raw_sha256:receipt.raw_sha256,text_sha256:receipt.text_sha256};
}

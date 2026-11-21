import type {Run} from './types';
export interface RunViewSource<Client> {api:Client;initial:Run;revision:number}
/** An echoed local update is different from a fresh externally loaded result. */
export function reconcileRunSource<Client>(source:RunViewSource<Client>,api:Client,initial:Run,current:Run){
 if(source.api===api&&source.initial===initial)return null;
 const changed=source.api!==api||initial!==current;
 return {source:{api,initial,revision:source.revision+(changed?1:0)},changed,run:changed?initial:current};
}

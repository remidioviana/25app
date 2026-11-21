import {brandId} from '../brand';
import {useHimayahLanguage} from './HimayahLanguage';
import {himayahNavigation} from './himayahNavigation';
import {translateHimayah} from './himayahWorkspaceCopy';

export function useHimayahWorkspaceCopy(){
 const {language}=useHimayahLanguage();
 const active=brandId==='himayah',rtl=active&&language==='ar';
 const t=(value:string)=>translateHimayah(value,rtl);
 const tabs=active?himayahNavigation[language].tabs:undefined;
 const direction=rtl?{direction:'rtl' as const}:undefined;
 const aligned=rtl?{textAlign:'right' as const,writingDirection:'rtl' as const}:undefined;
 return {t,tabs,direction,aligned,rtl};
}

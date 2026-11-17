export interface MaterialPreferences {reduceTransparency:boolean|null;enhanceContrast:boolean|null;invertColors:boolean|null}
/** Unknown preferences fail closed: never flash glass before accessibility queries settle. */
export function navigationMaterial(platform:string,nativeAvailable:boolean,apiAvailable:boolean,prefs:MaterialPreferences):'native-glass'|'solid'{
 return platform==='ios'&&nativeAvailable&&apiAvailable&&prefs.reduceTransparency===false&&prefs.enhanceContrast===false&&prefs.invertColors===false?'native-glass':'solid';
}

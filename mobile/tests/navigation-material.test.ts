import test from 'node:test';
import assert from 'node:assert/strict';
import {navigationMaterial,type MaterialPreferences} from '../src/experience/navigationMaterial';
const standard:MaterialPreferences={reduceTransparency:false,enhanceContrast:false,invertColors:false};
test('native material needs both runtime capabilities and settled accessibility preferences',()=>{
 assert.equal(navigationMaterial('ios',true,true,standard),'native-glass');
 for(const [native,api]of [[false,false],[false,true],[true,false]])assert.equal(navigationMaterial('ios',native,api,standard),'solid');
 for(const key of Object.keys(standard)as(keyof MaterialPreferences)[]){for(const value of [true,null])assert.equal(navigationMaterial('ios',true,true,{...standard,[key]:value}),'solid')}
});
test('Android and Web never enter the iOS material path even if a capability probe reports true',()=>{
 for(const platform of ['android','web','windows','macos'])assert.equal(navigationMaterial(platform,true,true,standard),'solid');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {observeMotionPreference} from '../src/experience/motionPreference';
function source(){
 let resolve!:(value:boolean)=>void,reject!:(error:Error)=>void,changed!:(value:boolean)=>void,removed=0;
 const promise=new Promise<boolean>((yes,no)=>{resolve=yes;reject=no});
 return {read:()=>promise,subscribe:(listener:(value:boolean)=>void)=>{changed=listener;return()=>{removed++}},resolve,reject,event:(value:boolean)=>changed(value),removed:()=>removed};
}
test('initial motion preference applies when no newer event exists',async()=>{
 for(const value of [false,true]){const s=source(),values:boolean[]=[];const dispose=observeMotionPreference(s,value=>values.push(value));s.resolve(value);await Promise.resolve();assert.deepEqual(values,[value]);dispose();}
});
test('a late initial read cannot overwrite a newer reduced-motion preference',async()=>{
 for(const value of [false,true]){const s=source(),values:boolean[]=[];const dispose=observeMotionPreference(s,value=>values.push(value));s.event(value);s.resolve(!value);await Promise.resolve();assert.deepEqual(values,[value]);s.event(!value);assert.deepEqual(values,[value,!value]);dispose();}
});
test('disposed motion observers ignore pending reads and queued events',async()=>{
 const s=source(),values:boolean[]=[];const dispose=observeMotionPreference(s,value=>values.push(value));dispose();dispose();s.event(false);s.resolve(false);await Promise.resolve();assert.deepEqual(values,[]);assert.equal(s.removed(),1);
});
test('an unavailable initial read keeps the safe default and later events remain usable',async()=>{
 const s=source(),values:boolean[]=[];const dispose=observeMotionPreference(s,value=>values.push(value));s.reject(Error('Unavailable'));await Promise.resolve();await Promise.resolve();assert.deepEqual(values,[]);s.event(false);assert.deepEqual(values,[false]);dispose();
});

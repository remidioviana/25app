import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import React from 'react';
import {decorativeSvgProps} from '../src/experience/svgAccessibility';
const load=createRequire(__filename);
const {renderToStaticMarkup}=load('react-dom/server') as {renderToStaticMarkup:(node:React.ReactNode)=>string};
test('decorative web SVG uses valid ARIA without leaking a false native attribute to the DOM',()=>{
 const messages:unknown[][]=[];const original=console.error;console.error=(...args:unknown[])=>{messages.push(args)};
 try{
  const html=renderToStaticMarkup(React.createElement('svg',decorativeSvgProps('web')));
  assert.match(html,/aria-hidden="true"/);assert.doesNotMatch(html,/accessible=/);assert.deepEqual(messages,[]);
 }finally{console.error=original}
});
test('decorative SVG retains accessible=false on iOS and Android',()=>{
 for(const platform of ['ios','android'])assert.deepEqual(decorativeSvgProps(platform),{accessible:false});
});

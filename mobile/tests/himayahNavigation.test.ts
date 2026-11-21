import {test} from 'node:test';
import assert from 'node:assert/strict';
import {himayahNavigation} from '../src/experience/himayahNavigation';

test('Himayah exposes the same five destinations in both languages',()=>{
 assert.equal(himayahNavigation.en.tabs.length,5);
 assert.equal(himayahNavigation.ar.tabs.length,5);
 assert.equal(new Set(himayahNavigation.ar.tabs).size,5);
 for(const title of himayahNavigation.ar.tabs)assert.match(title,/[\u0600-\u06ff]/);
 assert.deepEqual(himayahNavigation.en.tabs,['Docket','Clauses','Authorities','Trail','Inspector']);
});

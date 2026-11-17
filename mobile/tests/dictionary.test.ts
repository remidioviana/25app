import test from 'node:test';
import assert from 'node:assert/strict';
import {addMapEntry,removeMapEntry} from '../src/forms';
test('household and financial categories can be entered without asserting an invented zero',()=>{const original={};const added=addMapEntry(original,' Groceries ',{type:'number'});assert.deepEqual(added,{Groceries:null});assert.deepEqual(original,{});assert.deepEqual(removeMapEntry({Groceries:50,Rent:100},'Groceries'),{Rent:100})});
test('duplicate, blank and prototype-like category names are rejected without changing the record',()=>{const original={Rent:50};for(const key of ['Rent',' ','__proto__','constructor','prototype','x'.repeat(81)])assert.throws(()=>addMapEntry(original,key,{type:'number'}));assert.deepEqual(original,{Rent:50})});

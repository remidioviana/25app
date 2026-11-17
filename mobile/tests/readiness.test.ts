import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from '../src/catalog';
import {designs} from '../src/experience/designs';
import {caseInputIssue} from '../src/experience/readiness';
import {emptyWorkspace} from '../src/forms';
test('none of the 25 empty private cases can masquerade as enough context for an autonomous case run',()=>{for(const id of Object.keys(designs) as (keyof typeof designs)[])assert.ok(caseInputIssue(id,emptyWorkspace(catalog[id].schema).draft),id)});
test('all explicit controlled examples remain eligible for schema validation without preloading them into user state',()=>{for(const id of Object.keys(designs) as (keyof typeof designs)[])assert.equal(caseInputIssue(id,catalog[id].example),null,id)});
test('legitimate zero measurements remain meaningful, while empty ledgers do not become wealth analysis',()=>{assert.equal(caseInputIssue('amanah-eco',{unit:'kWh',previous_usage:0,current_usage:0}),null);assert.ok(caseInputIssue('mizan',{currency:'AED',transactions:[],budgets:{}}))});

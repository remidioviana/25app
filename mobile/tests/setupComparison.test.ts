import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compareSetup,setupIssue,taxScenario,formatCost} from '../src/setupComparison';

const example={activity:'software',currency:'AED',years:3,visas:2,options:[
  {name:'A',setup_fee:1000,annual_fee:6000,visa_fee:2000,activities:['software']},
  {name:'B',setup_fee:4000,annual_fee:5000,visa_fee:1800,activities:['software']},
]};
test('setup example ranks supported options using the full horizon and visa cost',()=>{
  const before=JSON.stringify(example),r=compareSetup(example);
  assert.equal(r.comparison[0].name,'B');assert.equal(r.comparison[0].total,'22600.00');
  assert.deepEqual(r.comparison[0].breakdown,{setup:'4000',recurring:'15000',visas:'3600'});
  assert.equal(JSON.stringify(example),before);assert.equal(formatCost('22600.00'),'22,600.00');
});
test('activity-list matches precede cheaper non-matches; equal costs preserve input order',()=>{
  const r=compareSetup({...example,options:[{...example.options[0],name:'unsupported',setup_fee:0,annual_fee:0,visa_fee:0,activities:[]},example.options[1],{...example.options[1],name:'same'}]});
  assert.deepEqual(r.comparison.map(x=>x.name),['B','same','unsupported']);
  assert.equal(r.comparison[2].activity_match,false);
});
test('rounds half up only after exact decimal multiplication and addition',()=>{
  const r=compareSetup({...example,years:0.1,visas:1,options:[{name:'rounding',setup_fee:0.005,annual_fee:0.05,visa_fee:0.005,activities:['software']}]});
  assert.equal(r.comparison[0].total,'0.02');
  const small=compareSetup({...example,years:1,visas:0,options:[{name:'small',setup_fee:1e-7,annual_fee:0.0049999,visa_fee:0,activities:[]}]});
  assert.equal(small.comparison[0].total,'0.01');
});
test('zero years, visas and costs remain zero and never become default assumptions',()=>{
  const r=compareSetup({...example,years:0,visas:0,options:[{...example.options[0],setup_fee:0}]});
  assert.equal(r.comparison[0].total,'0.00');assert.equal(r.comparison[0].breakdown.setup,'0');
});
test('invalid amounts, ambiguous names and missing options do not create a ranking',()=>{
  assert.match(setupIssue({...example,options:[]})!,/at least one/);
  assert.match(setupIssue({...example,visas:1.5})!,/whole number/);
  assert.match(setupIssue({...example,years:Infinity})!,/finite/);
  assert.match(setupIssue({...example,currency:'aed'})!,/uppercase/);
  assert.match(setupIssue({...example,options:[example.options[0],example.options[0]]})!,/unique/);
  assert.throws(()=>compareSetup({...example,options:[{...example.options[0],setup_fee:NaN}]}),/finite/);
});
test('tax illustration uses explicit inputs, respects zero and rounds deterministically',()=>{
  assert.equal(taxScenario(1000,100,10).tax,'90.00');
  assert.equal(taxScenario(1000,100,0).tax,'0.00');
  assert.equal(taxScenario(100,1000,10).tax,'0.00');
  assert.equal(taxScenario(0.05,0,10).tax,'0.01');
  assert.throws(()=>taxScenario(100,0,101),/0 to 100/);
});

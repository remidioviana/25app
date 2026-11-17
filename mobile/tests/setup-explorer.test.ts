import test from 'node:test';
import assert from 'node:assert/strict';
import {setupPreview,setupHorizon,costFraction,setupTax,setupReport} from '../src/experience/setupExplorer';
const input={activity:'software',currency:'AED',years:3,visas:2,options:[{name:'A',setup_fee:1000,annual_fee:6000,visa_fee:2000,activities:['software']},{name:'B',setup_fee:4000,annual_fee:5000,visa_fee:1800,activities:['software']}]};
test('changing the horizon changes ranking and exact totals without changing the saved case',()=>{
 const before=JSON.stringify(input);const short=setupPreview(input,'1','2');assert.equal(short.result.comparison[0].name,'A');assert.equal(short.result.comparison[0].total,'11000.00');
 const long=setupPreview(input,'5','٢');assert.equal(long.result.comparison[0].name,'B');assert.equal(long.result.comparison[0].total,'32600.00');assert.equal(JSON.stringify(input),before);
 assert.equal(setupPreview(input,'0','0').result.comparison[0].total,'1000.00');
 for(const [years,visas]of [['','2'],['-1','2'],['3','1.5'],['3','NaN']])assert.throws(()=>setupPreview(input,years,visas));
});
test('horizon points retain the chosen option and exact arithmetic, including zero and huge values',()=>{
 const points=setupHorizon(input,'B');assert.deepEqual(points.map(x=>x.years),[0,.75,1.5,2.25,3]);assert.equal(points.at(-1)!.total,'22600.00');
 assert.equal(setupHorizon({...input,years:0},'B').length,1);assert.throws(()=>setupHorizon(input,'unknown'),/Select/);
 const huge=setupHorizon({...input,years:1e300,options:[{...input.options[0],annual_fee:1e300}]},'A');assert.equal(costFraction(huge.at(-1)!.total_minor,huge.at(-1)!.total_minor),1);
 assert.equal(costFraction('0','0'),0);assert.equal(costFraction('1','4'),.25);assert.throws(()=>costFraction('5','4'),/scale/);
});
test('tax input preserves explicit zero, rejects partial/invalid inputs and exports current scenario evidence',()=>{
 assert.equal(setupTax('','',''),null);assert.throws(()=>setupTax('100','','9'),/Complete/);assert.throws(()=>setupTax('100','0','101'),/0 to 100/);assert.equal(setupTax('100','0','0')!.tax,'0.00');
 const preview=setupPreview(input,'1','2');const report=JSON.parse(setupReport(preview.input,setupTax('1000','100','10')));assert.equal(report.result.comparison[0].name,'A');assert.equal(report.tax.tax,'90.00');assert.equal(report.input.years,1);assert.equal(report.official_fees_verified,false);assert.equal(report.external_action_performed,false);
});

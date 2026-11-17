import test from 'node:test';
import assert from 'node:assert/strict';
import {numericInput} from '../src/experience/numericInput';
test('Arabic and Persian numeric entry preserves explicit zero, decimals and correctly grouped amounts',()=>{
 assert.equal(numericInput('١٢٣٫٤٥'),123.45);assert.equal(numericInput('۱٬۲۳۴٫۵۰'),1234.5);assert.equal(numericInput('٠'),0);assert.equal(numericInput('-١٢'),-12);assert.equal(numericInput('2,5'),2.5);
});
test('blank numeric input stays unknown and malformed grouping is never silently converted to an amount',()=>{
 assert.equal(numericInput('  '),null);for(const text of ['١٬٢','١٢٫٣٫٤','Infinity','0x10','1,000.00'])assert.ok(Number.isNaN(numericInput(text)));
});

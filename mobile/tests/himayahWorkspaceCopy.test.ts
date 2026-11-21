import {test} from 'node:test';
import assert from 'node:assert/strict';
import {himayahWorkspaceArabic,translateHimayah} from '../src/experience/himayahWorkspaceCopy';

test('Himayah workspace labels have Arabic translations and preserve English defaults',()=>{
 for(const [english,arabic] of Object.entries(himayahWorkspaceArabic)){
  assert.equal(translateHimayah(english,false),english);
  assert.equal(translateHimayah(english,true),arabic);
  assert.match(arabic,/[\u0600-\u06ff]/);
 }
 assert.equal(translateHimayah('Untranslated source title',true),'Untranslated source title');
 assert.equal(translateHimayah('constructor',true),'constructor');
 assert.equal(translateHimayah('Text',true),'النص');
 assert.equal(translateHimayah('Screening phrase',true),'عبارة الفحص');
 assert.equal(translateHimayah('Phrase required',true),'العبارة مطلوبة');
 assert.equal(translateHimayah('Clear answer',true),'مسح الإجابة');
});

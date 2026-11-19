import test from 'node:test';
import assert from 'node:assert/strict';
import {rank,score,filename,validateImport,normalizeHistoryItem} from './core.mjs';
const items=[{history_item_id:'a',text:'Welcome home',voice_id:'r',voice_name:'Rachel',date_unix:1},{history_item_id:'b',text:'Welcome home',voice_id:'g',voice_name:'George',date_unix:2},{history_item_id:'c',text:'Good morning',voice_id:'r',voice_name:'Rachel',date_unix:3}];
test('typos match and separate ElevenLabs voices survive',()=>{assert.equal(rank(items,'welcom hom').length,2);assert.equal(rank(items,'welcom hom',{},'r')[0].history_item_id,'a');assert.equal(score('zzzzzz','Welcome home'),0);});
test('stars and explicit priority reorder relevant results only',()=>{assert.deepEqual(rank(items,'welcome',{a:{star:true},c:{star:true,priority:999}}).map(i=>i.history_item_id),['a','b']);assert.equal(rank(items,'welcome',{a:{priority:5}})[0].history_item_id,'a');assert.equal(rank(items,'',{a:{star:true}},'',true).length,1);});
test('filenames are safe and distinguish identical lines in distinct voices',()=>{assert.notEqual(filename(items[0]),filename(items[1]));assert.ok(!filename(items[0],{name:'../../a:b?'}).includes('/'));assert.ok(filename({...items[0],content_type:'audio/wav'}).endsWith('.wav'));});
test('imports reject invalid state and preserve optional key omission',()=>{const input={schema:1,settings:{model:'eleven_multilingual_v2'},history:items,metadata:{a:{priority:3,name:'Greeting'}}};assert.equal(validateImport(input),input);assert.throws(()=>validateImport({...input,history:[{text:'broken'}]}));assert.throws(()=>validateImport({...input,metadata:{a:{priority:'wrong'}}}));assert.equal(validateImport(input).settings.apiKey,undefined);});

test('API history may have null text for non-text generations',()=>{assert.doesNotThrow(()=>validateImport({schema:1,settings:{},history:[{history_item_id:'non-tts',text:null}],metadata:{}}));});

test('v4 dialogue history supports text, speaker lookup, search and filenames',()=>{
 const raw={history_item_id:'v4',model_id:'eleven_v4_exp',text:null,voice_id:null,voice_name:null,date_unix:10,dialogue:[{text:'Welcome back',voice_id:'r',voice_name:'Rachel'}]};
 const item=normalizeHistoryItem(raw);
 assert.equal(item.text,'Welcome back');assert.equal(item.voice_name,'Rachel');assert.equal(item.voice_id,'r');assert.equal(rank([item],'welcom')[0],item);assert.match(filename(item),/Welcome back — Rachel/);assert.equal(raw.text,null);
});
test('multi-speaker dialogue preserves order and filters by either voice',()=>{
 const item=normalizeHistoryItem({history_item_id:'dialogue',dialogue:[{text:'Hello',voice_id:'r'},{text:'Hi there',voice_id:'g',voice_name:'George'}]},[{voice_id:'r',name:'Rachel'}]);
 assert.equal(item.text,'Hello\nHi there');assert.equal(item.voice_name,'Rachel + George');assert.equal(item.voice_id,null);assert.equal(rank([item],'',{},'g').length,1);assert.equal(rank([item],'',{},'r').length,1);assert.equal(rank([item],'',{},'other').length,0);
});

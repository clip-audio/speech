import test from 'node:test';
import assert from 'node:assert/strict';
import {syncHistory} from './history-sync.mjs';
const item=id=>({history_item_id:id});
function setup(anchor,full=false){const calls=[],merged=[];return {calls,merged,options:{anchor,full,fetchPage:async cursor=>{calls.push(cursor);return cursor?{history:[item('older')],has_more:false}:{history:[item('new'),item('known')],has_more:true,last_history_item_id:'known'};},onPage:items=>merged.push(...items)}};}
test('normal update stops at previous successful checkpoint',async()=>{const x=setup('known');const result=await syncHistory(x.options);assert.deepEqual(x.calls,['']);assert.equal(result.anchor,'new');assert.equal(result.added,1);assert.equal(x.merged.length,2);});
test('first sync and full refresh traverse older pages',async()=>{for(const [anchor,full]of [[null,false],['known',true],['missing',false]]){const x=setup(anchor,full);const result=await syncHistory(x.options);assert.equal(result.pages,2);assert.equal(x.merged.length,3);}});
test('errors do not return an advanced checkpoint',async()=>{let merged=0;await assert.rejects(syncHistory({anchor:'old',fetchPage:async cursor=>{if(cursor)throw Error('offline');return {history:[item('new')],has_more:true,last_history_item_id:'new'};},onPage:()=>merged++}),/offline/);assert.equal(merged,1);});
test('unchanged latest page stops in one request',async()=>{let calls=0;const result=await syncHistory({anchor:'known',fetchPage:async()=>{calls++;return{history:[item('known')],has_more:true};},onPage:()=>{}});assert.equal(calls,1);assert.equal(result.added,0);});

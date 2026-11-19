import test from 'node:test';
import assert from 'node:assert/strict';
import {routeOutput} from './playback.mjs';
test('preview uses selected sink and default remains supported without sink API',async()=>{let sink;await routeOutput({pause(){},async setSinkId(id){sink=id;}},'headphones');assert.equal(sink,'headphones');await routeOutput({pause(){}},'');});
test('chat cannot silently use default speakers or unsupported routing',async()=>{for(const id of ['', 'default'])await assert.rejects(routeOutput({pause(){},setSinkId(){}},id,true),/dedicated/);await assert.rejects(routeOutput({pause(){}},'cable',true),/cannot select/);});
test('failed routing stops playback and does not retry default',async()=>{let paused=false,calls=[];await assert.rejects(routeOutput({pause(){paused=true;},async setSinkId(id){calls.push(id);throw Error('gone');}},'missing',true),/Playback was stopped/);assert.equal(paused,true);assert.deepEqual(calls,['missing']);});

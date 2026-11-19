export function shortcutAction(event, {tagName='',id='',isContentEditable=false,type=''}={}) {
 if(event.isComposing||event.ctrlKey||event.metaKey||event.altKey)return null;
 const tag=tagName.toUpperCase();
 if(isContentEditable||['TEXTAREA','SELECT','BUTTON','A','AUDIO'].includes(tag)||(tag==='INPUT'&&id!=='search'))return null;
 if(event.key==='Enter')return event.repeat?null:{play:event.shiftKey?'preview':'chat'};
 if(event.key==='ArrowDown')return {move:1};
 if(event.key==='ArrowUp')return {move:-1};
 return null;
}
export function moveHighlight(ids,current,delta){if(!ids.length)return null;const index=ids.indexOf(current);return ids[Math.max(0,Math.min(ids.length-1,index<0?0:index+delta))];}

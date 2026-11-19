// Advance the checkpoint only after a successful sync, so interrupted initial
// imports and multi-page updates are retried without leaving gaps.
export async function syncHistory({fetchPage,onPage,anchor=null,full=false}) {
 let cursor='',newest=null,pages=0,retrieved=0,added=0;
 const seen=new Set();
 do {
  const data=await fetchPage(cursor),items=data.history||[];
  if(!newest&&items.length)newest=items[0].history_item_id;
  pages++;retrieved+=items.length;
  const boundary=!full&&anchor?items.findIndex(item=>item.history_item_id===anchor):-1;
  added+=boundary<0?items.length:boundary;
  await onPage(items,{pages,retrieved});
  if(boundary>=0||!data.has_more)break;
  cursor=data.last_history_item_id;
  if(!cursor||seen.has(cursor))throw Error('History pagination stopped unexpectedly. Synced items have been kept; retry sync.');
  seen.add(cursor);
 }while(true);
 return {anchor:newest||anchor,pages,retrieved,added};
}

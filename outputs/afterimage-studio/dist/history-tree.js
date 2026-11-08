export class HistoryTree{
 constructor(snapshot,label='初始状态'){this.nodes=[{id:crypto.randomUUID(),parent:null,snapshot,label,created:Date.now(),mark:''}];this.cursor=this.nodes[0].id;this.pending=null;this.preferred={};}
 get current(){return this.nodes.find(n=>n.id===this.cursor)}
 begin(snapshot,label='编辑'){this.capture(snapshot);this.pending={parent:this.cursor,label,id:null};}
 capture(snapshot){if(snapshot===this.current.snapshot)return false;if(!this.pending)this.pending={parent:this.cursor,label:'编辑',id:null};let node=this.pending.id&&this.nodes.find(n=>n.id===this.pending.id);if(!node){node={id:crypto.randomUUID(),parent:this.pending.parent,label:this.pending.label,snapshot,created:Date.now(),mark:''};this.nodes.push(node);this.pending.id=node.id;this.preferred[node.parent]=node.id;}else node.snapshot=snapshot;this.cursor=node.id;return true;}
 finish(snapshot){if(snapshot!==undefined)this.capture(snapshot);this.pending=null;}
 undo(snapshot){this.finish(snapshot);const p=this.current.parent;if(p)this.cursor=p;return this.current.snapshot;}
 redo(snapshot){this.finish(snapshot);const children=this.nodes.filter(n=>n.parent===this.cursor),n=children.find(n=>n.id===this.preferred[this.cursor])||children.at(-1);if(n)this.cursor=n.id;return this.current.snapshot;}
 jump(id,snapshot){this.finish(snapshot);const n=this.nodes.find(n=>n.id===id);if(!n)throw new Error('历史节点不存在');this.cursor=id;if(n.parent)this.preferred[n.parent]=id;return n.snapshot;}
 mark(name){this.current.mark=String(name||'关键节点').slice(0,100);}
 get canUndo(){return !!this.current.parent}get canRedo(){return this.nodes.some(n=>n.parent===this.cursor)}
 toJSON(){return {version:1,nodes:this.nodes,cursor:this.cursor,preferred:this.preferred};}
 static from(data){if(!data||data.version!==1||!Array.isArray(data.nodes)||!data.nodes.length)throw new Error('历史记录格式无效');const seen=new Set();for(const n of data.nodes){if(!n||typeof n.id!=='string'||seen.has(n.id)||n.parent!==null&&!seen.has(n.parent)||typeof n.snapshot!=='string'||n.snapshot.length>75000000||typeof n.label!=='string')throw new Error('历史分支结构无效');seen.add(n.id);}if(!seen.has(data.cursor)||data.nodes.filter(n=>n.parent===null).length!==1)throw new Error('历史节点无效');const h=Object.create(HistoryTree.prototype);h.nodes=structuredClone(data.nodes).map(n=>({...n,label:n.label.slice(0,150),mark:String(n.mark||'').slice(0,100)}));h.cursor=data.cursor;h.preferred=data.preferred&&typeof data.preferred==='object'?{...data.preferred}:{};h.pending=null;return h;}
}

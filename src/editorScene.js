// Remove editor-only objects rather than hiding them: Box3 includes invisible nodes.
export function removeEditorObjects(root){
 const removed=[];root.traverse(node=>{if(node.userData.editorOnly)removed.push([node,node.parent]);});
 for(const [node,parent] of removed)parent.remove(node);
 return ()=>{for(const [node,parent] of removed)parent.add(node);};
}

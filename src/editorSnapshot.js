export function editorSnapshot(state){
 const copy=structuredClone(state);
 if(new TextEncoder().encode(JSON.stringify(copy)).length>100000)throw new Error('The saved editor state exceeds 100 KB.');
 return copy;
}

// Accept the published wrapper and early flat snapshots without asking the app to map either.
export function snapshotState(snapshot){return snapshot?.state??snapshot;}

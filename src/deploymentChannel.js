// Evaluate at call time so the same artifact can be promoted between folders.
export function isTestChannel(pathname=globalThis.location?.pathname||globalThis.window?.location?.pathname||''){
 return pathname.startsWith('/design-test/');
}

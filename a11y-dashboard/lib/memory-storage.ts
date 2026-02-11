// Shared in-memory storage for when database is unavailable
export const memoryScans: any[] = [];
export const memoryIssues: any[] = [];
export let useFallback = false;
export let scanCounter = 1;
export let fileCounter = 1;
export let issueCounter = 1;

export function enableFallback() {
  useFallback = true;
  console.log('✓ In-memory storage mode enabled');
}

export function isUsingFallback() {
  return useFallback;
}

export function getNextScanId() {
  return scanCounter++;
}

export function getNextFileId() {
  return fileCounter++;
}

export function getNextIssueId() {
  return issueCounter++;
}

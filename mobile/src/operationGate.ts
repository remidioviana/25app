export interface OperationLease {readonly scope:number}
/** Old sessions may finish, but cannot release another session's current operation. */
export function operationGate(){
 let active:OperationLease|null=null,latestScope=-Infinity;
 return {
  acquire(scope:number){if(scope<latestScope||active?.scope===scope)return null;latestScope=scope;const lease={scope};active=lease;return lease},
  release(lease:OperationLease){if(active!==lease)return false;active=null;return true},
 };
}

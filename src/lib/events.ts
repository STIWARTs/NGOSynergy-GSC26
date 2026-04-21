export type GlobalToastEventDetail = {
  type: 'critical_verified' | 'volunteer_deployed' | 'success' | 'error'
  title: string
  description?: string
}

export const GLOBAL_TOAST_EVENT = 'ngo:global-toast'

export function emitGlobalToast(detail: GlobalToastEventDetail) {
  window.dispatchEvent(new CustomEvent<GlobalToastEventDetail>(GLOBAL_TOAST_EVENT, { detail }))
}

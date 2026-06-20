export const ALERTS_CHANGED_EVENT = 'jobsite:alerts-changed';

export function notifyAlertsChanged() {
  window.dispatchEvent(new Event(ALERTS_CHANGED_EVENT));
}

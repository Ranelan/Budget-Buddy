// Simple singleton toast service to push toasts from anywhere in the app
const listeners = new Set();
let idCounter = 1;

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function pushToast({ message, type = 'success', duration = 3500 }) {
  const id = idCounter++;
  const toast = { id, message, type, duration };
  for (const l of listeners) l({ action: 'push', toast });
  return id;
}

export function removeToast(id) {
  for (const l of listeners) l({ action: 'remove', id });
}

export default { subscribe, pushToast, removeToast };

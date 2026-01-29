// Telegram WebApp Integration
const tg = window.Telegram?.WebApp;

export function initTelegram() {
  if (tg) {
    tg.expand();
    tg.ready();
    tg.disableVerticalSwipes?.();
    tg.setHeaderColor?.('#2d1b4e');
    tg.setBackgroundColor?.('#1a1a3e');
  }
}

export function getUserName() {
  if (tg?.initDataUnsafe?.user) {
    const u = tg.initDataUnsafe.user;
    return u.first_name || u.username || 'Adventurer';
  }
  return 'Adventurer';
}

export function getUserId() {
  return tg?.initDataUnsafe?.user?.id || 'local';
}

export function hapticFeedback(type = 'light') {
  try {
    if (tg?.HapticFeedback) {
      switch (type) {
        case 'light':
          tg.HapticFeedback.impactOccurred('light');
          break;
        case 'medium':
          tg.HapticFeedback.impactOccurred('medium');
          break;
        case 'heavy':
          tg.HapticFeedback.impactOccurred('heavy');
          break;
        case 'success':
          tg.HapticFeedback.notificationOccurred('success');
          break;
        case 'error':
          tg.HapticFeedback.notificationOccurred('error');
          break;
        case 'warning':
          tg.HapticFeedback.notificationOccurred('warning');
          break;
        case 'select':
          tg.HapticFeedback.selectionChanged();
          break;
      }
    }
  } catch (e) { /* ignore */ }
}

export function isTelegram() {
  return !!tg?.initData;
}

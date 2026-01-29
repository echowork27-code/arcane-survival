// Telegram Web App Integration
class TelegramManager {
  constructor() {
    this.webapp = window.Telegram?.WebApp;
    this.isAvailable = !!this.webapp;
    this.userName = null;
    this.userId = null;
    if (this.isAvailable) this._init();
  }
  _init() {
    const wa = this.webapp;
    wa.expand();
    try { wa.setHeaderColor('#1A0A2E'); } catch {}
    try { wa.setBackgroundColor('#0D0D2B'); } catch {}
    try { wa.ready(); } catch {}
    try { wa.disableVerticalSwipes?.(); } catch {}
    try { wa.requestFullscreen?.(); } catch {}
    const user = wa.initDataUnsafe?.user;
    this.userName = user?.first_name || user?.username || null;
    this.userId   = user?.id || null;
  }
  getUserName()  { return this.userName || 'Apprentice'; }
  getUserId()    { return this.userId   || 'guest'; }
  hapticImpact(s = 'medium') { try { this.webapp?.HapticFeedback?.impactOccurred(s); } catch {} }
  hapticNotify(t = 'success'){ try { this.webapp?.HapticFeedback?.notificationOccurred(t); } catch {} }
  hapticSelect()             { try { this.webapp?.HapticFeedback?.selectionChanged(); } catch {} }
  shareScore(score, wave) {
    if (!this.isAvailable) return;
    const t = `⚔️ I survived ${wave} waves and scored ${score} in Arcane Survival! Can you surpass me?`;
    try { this.webapp.switchInlineQuery(t, ['users','groups','channels']); } catch {}
  }
  showBackButton(cb) { try { this.webapp?.BackButton?.show(); this.webapp?.BackButton?.onClick(cb); } catch {} }
  hideBackButton()   { try { this.webapp?.BackButton?.hide(); this.webapp?.BackButton?.offClick?.(); } catch {} }
  showConfirm(msg, cb) {
    if (this.isAvailable && this.webapp.showConfirm) this.webapp.showConfirm(msg, cb);
    else cb(confirm(msg));
  }
  showAlert(msg) {
    if (this.isAvailable && this.webapp.showAlert) this.webapp.showAlert(msg);
    else alert(msg);
  }
  close() { try { this.webapp?.close(); } catch {} }
}
export const telegram = new TelegramManager();
export default telegram;

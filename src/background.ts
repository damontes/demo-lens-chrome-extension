import { setAppState, setTabIcon } from './lib/chromeExtension';
import { ACTIONS } from './actions/dictionary';

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details);
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === ACTIONS.syncState) {
    await setAppState(message.payload);
  }

  if (message.type === ACTIONS.changeIcon) {
    const { iconPath } = message.payload;

    const iconUrl = chrome.runtime.getURL(iconPath);
    await setTabIcon(iconUrl);
  }

  if (message.type === ACTIONS.openChromeExtension) {
    if (!sender.tab?.windowId) return;
    await chrome.sidePanel.open({ windowId: sender.tab.windowId });
  }

  return true;
});

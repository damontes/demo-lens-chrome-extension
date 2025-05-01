import browser from 'webextension-polyfill';
import { setAppState } from './lib/chromeExtension';
import { ACTIONS } from './actions/dictionary';

browser.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details);
});

browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === ACTIONS.syncState) {
    await setAppState(message.payload);
  }
  return true;
});

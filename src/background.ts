import browser from 'webextension-polyfill';
import { getCurrentTabDetails } from './lib/chromeExtension';
import { ACTIONS } from './actions/dictionary';

browser.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details);
});

browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === ACTIONS.getDashboardId) {
    const dashboardDetails = await getCurrentTabDetails();
    return dashboardDetails.id;
  }
});

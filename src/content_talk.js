import browser from 'webextension-polyfill';

(async function () {
  const iframe = await waitForIframe();
  const doc = iframe.contentDocument;
  await initilizeApp(doc);
})();

function waitForIframe() {
  return new Promise((resolve) => {
    const check = () => {
      const iframe = document.querySelector('iframe[src*="/voice/admin/calls"]');
      if (iframe && iframe.contentWindow && iframe.contentDocument?.readyState === 'complete') {
        resolve(iframe);
      } else {
        requestAnimationFrame(check);
      }
    };
    check();
  });
}

window.addEventListener('FROM_PAGE_TO_EXTENSION', (event) => {
  const data = event.detail;
  browser.runtime.sendMessage({
    action: 'saveState',
    payload: data,
  });
});

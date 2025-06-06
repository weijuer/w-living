document.getElementById('refresh-btn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'forceRefresh' });
    });
});

document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

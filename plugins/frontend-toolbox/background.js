chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        chrome.sidePanel
            .setPanelBehavior({ openPanelOnActionClick: true })
            .catch((error) => console.error(error));
    }
    chrome.storage.local.set({ sidebarOpen: false });
});

chrome.action.onClicked.addListener(async (tab) => {
    const { sidebarOpen } = await chrome.storage.local.get('sidebarOpen');

    if (!sidebarOpen) {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
    }

    chrome.storage.local.set({ sidebarOpen: !sidebarOpen });
    chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar', state: !sidebarOpen });
});
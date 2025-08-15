chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        chrome.sidePanel
            .setPanelBehavior({ openPanelOnActionClick: true })
            .catch((error) => console.error(error));
    }

    chrome.contextMenus.create({
        id: 'generateAltText',
        title: 'Generate alt text',
        contexts: ['image']
    });
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

async function generateAltText(imgSrc) {
    // Create the model (we're not checking availability here, but will simply fail with an exception
    const session = await self.LanguageModel.create({
        temperature: 0.0,
        topK: 1.0,
        expectedInputs: [{ type: 'image' }]
    });

    // Create an image bitmap to pass it to the prompt
    const response = await fetch(imgSrc);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);

    // Run the prompt
    const prompt = [
        `Please provide a functional, objective description of the provided image in no more than around 30 words so that someone who could not see it would be able to imagine it. If possible, follow an “object-action-context” framework. The object is the main focus. The action describes what’s happening, usually what the object is doing. The context describes the surrounding environment. If there is text found in the image, do your best to transcribe the important bits, even if it extends the word count beyond 30 words. It should not contain quotation marks, as those tend to cause issues when rendered on the web. If there is no text found in the image, then there is no need to mention it. You should not begin the description with any variation of “The image”.`,
        { type: 'image', content: imageBitmap }
    ];
    return await session.prompt(prompt);
}

// Listen for messages from content scripts
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'generateAltText' && info.srcUrl) {

        console.log('generateAltText :==>', tab);

        // Start opening the popup
        const [result] = await Promise.allSettled([
            generateAltText(info.srcUrl),
            // chrome.action.openPopup()

            // This will open the panel in all the pages on the current window.
            chrome.sidePanel.open({ tabId: tab.id })
        ]);

        console.log('generateAltText result :==>', result.status === 'fulfilled' ? result.value : result.reason.message);

        chrome.runtime.sendMessage({
            action: 'alt-text',
            text: result.status === 'fulfilled' ? result.value : result.reason.message
        });
    }
});
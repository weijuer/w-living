// 处理下载请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'download') {
    chrome.downloads.download({
      url: request.url,
      filename: request.filename
    });
  }
});

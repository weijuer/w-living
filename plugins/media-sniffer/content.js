// 嗅探媒体资源
const mediaUrls = new Set();

function sniffMedia() {
  // 查找视频和音频标签
  document.querySelectorAll('video, audio').forEach(media => {
    if (media.src) mediaUrls.add(media.src);
  });
  
  // 查找m3u8文件
  const links = document.querySelectorAll('a[href$=".m3u8"]');
  links.forEach(link => mediaUrls.add(link.href));
  
  // 发送给popup
  chrome.runtime.sendMessage({
    type: 'mediaFound',
    urls: Array.from(mediaUrls)
  });
}

// 定期执行嗅探
setInterval(sniffMedia, 3000);

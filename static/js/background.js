const PUBLISH_URL = 'https://mp.toutiao.com/profile_v3/graphic/publish';

let count = 20;
let loadFromPlugin = false;
let res = [];
let page_loaded = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResonse){
  if (!loadFromPlugin) return;
  if(request.type === 'content_onload'){
    if (sender.url.indexOf(PUBLISH_URL) > -1) {
      page_loaded = true;
      sendMsg({ type: 'res', value: { res } });
      loadFromPlugin = false;
    } else {
      sendMsg('need_login');
    }
  }
});


function sendMsg (message) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    if (tabs.length <= 0) {
      setTimeout(() => {
        sendMsg(message);
      }, 1000);
      return;
    }
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        type: `bg_${message.type}`,
        value: message.value
      }
    );
  });
}


async function getContent(count) {
  count = count;
  loadFromPlugin = true;

  try {
    let response = await fetch(`https://api.apiopen.top/getJoke?type=gif&count=${count}`);
    res = await response.json();
    if (!page_loaded) return;
    sendMsg({ type: 'res', value: { res } });
    loadFromPlugin = false;
  } catch (e) {
    res = [];
  }
}

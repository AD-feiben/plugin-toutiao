const PUBLISH_URL = 'https://mp.toutiao.com/profile_v3/graphic/publish';

let articleCount = 4;
let finishedArticleCount = 0;
let count = 20;
let res = { code: 200, result: [] };

chrome.runtime.onMessage.addListener(function(request, sender, sendResonse){
  if(request.type === 'content_onload'){
    if (
      res.length !== 0
      && articleCount !== finishedArticleCount
    ) {
      ++finishedArticleCount;
      let remaining = articleCount - finishedArticleCount;
      let response = {
        type: 'res',
        value: {
          res: {
            code: res.code,
            result: res.result.splice(0, count),
            remaining,
            url: PUBLISH_URL
          }
        }
      };
      console.log(response);

      sendResonse(response);

      if (finishedArticleCount === articleCount) {
        finishedArticleCount = 0;
        res = [];
      }
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


async function getContent(articleCount, count) {
  articleCount = articleCount;
  count = count;

  try {
    let response = await fetch(`https://api.apiopen.top/getJoke?type=gif&count=${articleCount * count}`);
    res = await response.json();
  } catch (e) {
    res = [];
  }
}

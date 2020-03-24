const PUBLISH_URL = 'https://mp.toutiao.com/profile_v3/graphic/publish';

let btnPub = document.querySelector('#publish'),
  inputCount = document.querySelector('#count'),
  inputArticleCount = document.querySelector('#articleCount'),
  aGithub = document.querySelector('#github');

let count = inputCount.value = 20;
let articleCount = inputArticleCount.value = 2;

btnPub.onclick = async function () {
  let bg = chrome.extension.getBackgroundPage();
  count = inputCount.value = Number(inputCount.value) > 0 ? Number(inputCount.value) : 20;
  articleCount = inputArticleCount.value = Number(inputArticleCount.value) > 0 ? Number(inputArticleCount.value) : 4;
  // sendMsg({ type: 'link', value: { url: PUBLISH_URL }});
  window.open(PUBLISH_URL, `funny_gif_${articleCount}`);
  await bg.getContent(articleCount, count);
};

aGithub.onclick = function () {
  window.open(aGithub.attributes.href.value);
}

document.body.onclick = function (e) {
  if (e.target.tagName === 'A') {
    e.target.attributes.href.value && window.open(e.target.attributes.href.value);
  }
};

function sendMsg (message) {
  return new Promise((resolve) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          type: `popup_${message.type}`,
          value: message.value
        }, function(response){
          resolve(response);
        }
      );
    });
  });
}

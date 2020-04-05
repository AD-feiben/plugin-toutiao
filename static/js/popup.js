const PUBLISH_URL = {
  'toutiao': 'https://mp.toutiao.com/profile_v3/graphic/publish',
  'uc': 'https://mp.dayu.com/dashboard/article/write?spm=a2s0i.db_index.menu.4.3e0e3caa6KbTiF'
};

let $publish = $.query('#publish'),
  $count = $.query('#count'),
  $articleCount = $.query('#articleCount'),
  $github = $.query('#github'),
  $platform = $.query('#platform');

let count = $count.value = 20;
let articleCount = $articleCount.value = 2;

$publish.onclick = async function () {
  let bg = chrome.extension.getBackgroundPage();
  let platform = $platform.value;
  count = $count.value = Number($count.value) > 0 ? Number($count.value) : 20;
  articleCount = $articleCount.value = Number($articleCount.value) > 0 ? Number($articleCount.value) : 4;
  window.open(PUBLISH_URL[platform], `funny_gif_${articleCount}`);
  await bg.getContent(articleCount, count);
};

$github.onclick = function () {
  window.open($github.attributes.href.value);
}

$.entrust(document.body, 'click', 'A', (e) => {
  e.target.attributes.href.value && window.open(e.target.attributes.href.value);
});

(function () {

  let removeToastTimer = null,
    elToast = null,
    toastInBody = false;

  function entrust (el, type, selector, fn) {
    el.addEventListener(type, (e) => {
      $el = e.target;
      while (!$el.matches(selector)) {
        if ($el === el) {
          $el = null;
          return;
        }
        $el = $el.parentNode;
      }
      $el && fn.call($el, e, el);
      return $el;
    });
  }

  function sendMsg (message) {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({
        type: `content_${message.type}`,
        value: message.value
      }, function(response){
        resolve(response);
      });
    });
  }

  if (window.name.indexOf('funny_gif') > -1) {
    sendMsg({ type: "onload" }).then(response => {
      if (!response) return;

      let res = response.value.res;

      if (res.code === 200) {
        if (res.remaining > 0) {
          window.open(res.url, `funny_gif_${res.remaining}`);
        }
        checkImg(res.result);
      }
    });
  }

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){

    if (request.type === 'bg_need_login') {
      toast('请重新登录');
    }

    sendResponse('我是content-script,已收到你的消息');
  });

  function checkImg (list) {
    let count = 0;
    let len = list.length;
    let canUseList = [];
    list.map((item, index) => {
      let img = new Image();
      img.src = item.images;
      img.onload = function () {

        count++;
        canUseList.push(item);
        toast(`加载中，${(count/len*100).toFixed(2)}%`, 5000);
        if (count === len) {
          setHTML(canUseList, len);
        }
      }
      img.onerror = function () {
        count++;
        toast(`加载中，${(count/len*100).toFixed(2)}%`, 5000);
        if (count === len) {
          setHTML(canUseList, len);
        }
      }
    });
  }


  function setHTML (list, totalLen) {
    if (totalLen) {
      let failLen = totalLen - list.length
      if (failLen !== 0) {
        toast(`其中 ${failLen} 条图片加载失败`);
      }
    }
    let proseMirror = document.querySelector(".ProseMirror");

    if (proseMirror === null) {
      setTimeout(() => {
        setHTML(list)
      }, 1000);
      return;
    }

    entrust(proseMirror, 'click', 'H3', (e) => {
      setTitle(e.target.innerText);
    });
    let html = '';
    list.map((item, index) => {
      html += `<h3><strong>${item.text}</strong></h3>`;
      if (item.top_comments_content) {
        html += `<p>神评论：${item.top_comments_content}</p>`
      }

      html += `<p><img src=${item.images}></p><p> </p><p> </p><br><br>`
    })

    html && (html += '<blockquote><p>图片来自网络，侵删</p></blockquote>');

    try {
      proseMirror.innerHTML = html;
    } catch (e) {
      toast(e);
      console.log(e);
    }
  }

  function setTitle (title) {
    copy(title);
    toast(`标题需要手动输入，已复制“${title}”`);
  }

  function copy (msg) {
    let elCp = document.createElement('textarea');
    elCp.innerText = msg;
    document.body.appendChild(elCp);
    elCp.select(); // 选中文本
    document.execCommand("copy"); // 执行浏览器复制命令
    document.body.removeChild(elCp);
  }

  function toast (msg, duration=3000) {
    if (elToast === null) {
      elToast = document.createElement('div');
      elToast.classList.add('toutiao-toast');
    }
    elToast.innerText = '【头条搞笑GIF】' + msg;
    elToast.style.zIndex = 3000;

    toastInBody === false && document.body.appendChild(elToast);
    toastInBody = true;

    removeToastTimer && window.clearTimeout(removeToastTimer);

    removeToastTimer = setTimeout(() => {
      elToast && elToast.classList.add('leave');
      setTimeout(() => {
        elToast && document.body.removeChild(elToast);
        elToast = null;
        toastInBody = false;
      }, 200);
    }, duration);
  }
})()

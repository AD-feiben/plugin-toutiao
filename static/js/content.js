(function () {

  const IS_UC = location.href.indexOf('https://mp.dayu.com/') > -1;
  const IS_TOUTIAO = location.href.indexOf('https://mp.toutiao.com/') > -1;
  const IS_FUNNY = window.name.indexOf('funny_gif') > -1;

  let removeToastTimer = null,
    elToast = null,
    toastInBody = false,
    funQueue = [];

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

  if (IS_FUNNY) {
    sendMsg({ type: "onload" }).then(response => {
      if (!response) return;

      let res = response.value.res;

      if (res.code === 200) {
        if (res.remaining > 0) {
          window.open(location.href, `funny_gif_${res.remaining}`);
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
    list.map(async (item, index) => {
      try {
        await $.loadImg(item.images);
        canUseList.push(item);
      } catch (err) {
      } finally {
        count++;
        toast(`加载中，${(count/len*100).toFixed(2)}%`, 5000);
        if (count === len) {
          let failLen = len - canUseList.length
          if (failLen !== 0) {
            toast(`其中 ${failLen} 张图片加载失败`);
          }

          funQueue.push(() => {
            setHTML(canUseList);
          });

          waitContainerLoad();
        }
      }
    });
  }

  function waitContainerLoad () {
    let container = null;
    if (IS_TOUTIAO) {
      container = $.query('.ProseMirror');
    }
    if (IS_UC) {
      container = $.query('#ueditor_0') && $.query('#ueditor_0').contentDocument.body;
    }

    if (container === null) {
      setTimeout(waitContainerLoad, 1000);
    } else {
      $.entrust(container, 'click', 'H3', (e) => {
        setTitle(e.target.innerText);
      });

      while (funQueue.length > 0) {
        let fun = funQueue.shift();
        if (typeof fun === 'function') { fun() };
      }
    }
  }

  function setHTML (list) {
    let container = null;
    if (IS_UC) {
      container = $.query('#ueditor_0').contentDocument.body;
    }

    if (IS_TOUTIAO) {
      container = $.query('.ProseMirror');
      let pushAdBtn = $.queryAll('.article-ad-radio')[0];
      pushAdBtn && pushAdBtn.click();
    }

    if (container === null) return toast('无法获取内容输入框');

    let html = '';
    list.map(item => {
      html += `<h3><strong>${item.text}</strong></h3>`;
      if (item.top_comments_content) {
        html += `<p>神评论：${item.top_comments_content}</p>`
      }

      html += `<p><img src=${item.images}></p><p> </p><p> </p><br><br>`
    })

    html && (html += '<blockquote><p>图片来自网络，侵删</p></blockquote>');

    toast('点击内容标题可以设置为文章标题');

    setTitle('搞笑动图GIF');

    try {
      container.innerHTML = html;
    } catch (e) {
      toast(e);
      console.log(e);
    }
  }

  function setTitle (title) {
    let container = null;
    if (IS_TOUTIAO) {
      container = $.query('textarea');
    }
    if (IS_UC) {
      container = $.query('#title');
    }

    if (container === null) return toast('无法获取标题输入框');

    if (typeof container.fireEvent === 'function' && IS_UC === false) {
      container.focus();
      container.value = title;
      container.fireEvent("oninput");
      container.fireEvent("onchange");
    } else {
      $.copy(title);
      toast(`已复制：${title}，请手动粘贴`);
    }
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

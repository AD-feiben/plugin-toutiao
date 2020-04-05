(function () {
  class Util {
    query = (k) => document.querySelector(k)
    queryAll = (k) => document.querySelectorAll(k)
    entrust = (el, type, selector, fn) => {
      el.addEventListener(type, e => {
        let $el = e.target;
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

    loadImg = (src) => {
      return new Promise((resolve, reject) => {
        let img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = reject;
      });
    }

    copy = (msg) => {
      let elCp = document.createElement('textarea');
      elCp.innerText = msg;
      document.body.appendChild(elCp);
      elCp.select(); // 选中文本
      document.execCommand("copy"); // 执行浏览器复制命令
      document.body.removeChild(elCp);
    }
  }
  window.$ = new Util();
})();

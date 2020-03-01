import { rootUrl } from "../config";
import { postData } from "../helper";
import { pageId, loadedTimestamp } from "../initial";

const url = `${rootUrl}/scroll/create`;

let stamps = [],
  timer = loadedTimestamp.getTime(),
  position = window.scrollY,
  length = window.innerHeight,
  ticking = false,
  collecting = false,
  sending = false,
  sendInterval;

const createStamp = () => {
  if (!ticking) {
    ticking = true;

    window.requestAnimationFrame(() => {
      const now = Date.now();

      if (collecting) {
        stamps = [
          ...stamps,
          {
            position,
            length,
            weight: Math.round(now - timer)
          }
        ];
      }

      timer = now;
      position = window.scrollY;
      length = window.innerHeight;
      ticking = false;
    });
  }
};

const postStamps = async () => {
  const now = Date.now();

  const stampsWillSend = [
    ...stamps,
    {
      position,
      length,
      weight: now - timer
    }
  ];
  
  stamps.length = 0;
  timer = now;

  const maxLength = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight
  );

  const data = {
    pathname: window.location.pathname,
    pageId,
    maxLength,
    stamps: stampsWillSend
  };

  await postData(url, data);
};

const collectData = () => {
  let blurTimeout, scrollTimeout;

  window.addEventListener('scroll', () => {
    if (!collecting) {
      collecting = true;
      scrollTimeout = setTimeout(() => {
        if (collecting) {
          collecting = false;
        }
      }, 1000);
    }
  });

  window.addEventListener("scroll", createStamp);
  window.addEventListener("resize", createStamp);

  if (document.hasFocus()) {
    collecting = true;
    
    sendInterval = setInterval(() => {
      postStamps();
    }, 10000);
    sending = true;
  }

  window.addEventListener("blur", () => {
    blurTimeout = setTimeout(() => {
      if (collecting) {
        collecting = false;
      }
    }, 5000);

    if (sending && sendInterval) {
      clearInterval(sendInterval);
      postStamps();
      sending = false;
    }
  });

  window.addEventListener("focus", () => {
    if (blurTimeout) {
      clearTimeout(blurTimeout);
    }

    if (scrollTimeout) {
      clearTimeout(blurTimeout);
    }

    collecting = true;

    if (!sending) {
      sendInterval = setInterval(() => {
        postStamps();
      }, 10000);
      sending = true;
    }
  });

  /* if (navigator.sendBeacon) {
    const fixedPathname = window.location.pathname;

    window.addEventListener('beforeunload', (e) => {
      e.preventDefault();
      stamps.push({
        position,
        length,
        weight: Date.now() - timer
      });

      const maxLength = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );

      const data = {
        pathname: fixedPathname,
        pageId,
        maxLength,
        stamps
      }

      navigator.sendBeacon(url, JSON.stringify(data));
    })
  } */
};

export default collectData;

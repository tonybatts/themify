colorArr = [];

elArr = [
  ...document.querySelectorAll(
    "a, p, div, section, aside, span, h1, h2, h3, h4, h5, h6, body, footer, nav, article, main, blockquote, button"
  )
];
elArr.forEach((el) => {
  let styles = window.getComputedStyle(el);

  if (styles.backgroundColor && !colorArr.includes(styles.backgroundColor)) {
    colorArr.push(styles.backgroundColor);
  }

  if (styles.color && !colorArr.includes(styles.color)) {
    colorArr.push(styles.color);
  }
});

const copyToClipboard = (str) => {
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
};

const eyeDropper = (sendResponse) => {
  const eyeDropper = new EyeDropper();
  const abortController = new AbortController();

  eyeDropper
    .open({ signal: abortController.signal })
    .then((result) => {
      copyToClipboard(result.sRGBHex);
      console.log(result.sRGBHex);
      sendResponse("hello");
    })
    .catch((e) => {
      console.log(e);
    });

  return "eyedropper";
  // setTimeout(() => {
  //   abortController.abort();
  // }, 2000);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "ready") {
    sendResponse(JSON.stringify(colorArr));
  }

  if (message === "eyedropper") {
    eyeDropper(sendResponse);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "eyedropper") {
    eyeDropper(sendResponse);
  }

  return true;
});

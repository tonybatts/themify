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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "ready") {
    sendResponse(JSON.stringify(colorArr));
  }
});

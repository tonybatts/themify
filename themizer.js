// queries all of the elements on the page and returns an array of color values
const getAllElementColors = () => {
  const themifyColorArray = [];

  const themifyElementArray = [
    ...document.querySelectorAll(
      "a, p, div, section, aside, span, h1, h2, h3, h4, h5, h6, body, footer, nav, article, main, blockquote, button"
    )
  ];
  themifyElementArray.forEach((el) => {
    let styles = window.getComputedStyle(el);

    if (styles.backgroundColor && !themifyColorArray.includes(styles.backgroundColor)) {
      themifyColorArray.push(styles.backgroundColor);
    }

    if (styles.color && !themifyColorArray.includes(styles.color)) {
      themifyColorArray.push(styles.color);
    }
  });

  return themifyColorArray;
};

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

const eyeDropper = async () => {
  const eyeDropper = new EyeDropper();
  const abortController = new AbortController();

  try {
    const result = await eyeDropper.open({ signal: abortController.signal });
    const colorHexValue = result.sRGBHex;
    if (colorHexValue) {
      copyToClipboard(result.sRGBHex);
    }
  } catch (e) {
    console.log(e);
  } finally {
    abortController.abort();
  }
};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message === "colors") {
    const themifyPageColors = getAllElementColors();
    sendResponse(JSON.stringify(themifyPageColors));
  }

  if (message === "eyedropper") {
    await eyeDropper();
    sendResponse("copied");
  }
});

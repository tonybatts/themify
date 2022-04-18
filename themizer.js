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

if (!document.querySelector(".themify_2349_idfja")) {
  const themifyCheck = document.createElement("span");
  themifyCheck.classList.add("themify_2349_idfja");
  document.body.appendChild(themifyCheck);

  const copyToClipboard = (str) => {
    const el = document.createElement("textarea");
    el.classList.add("themizer_copy");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    // document.execCommand("copy");

    navigator.clipboard
      .writeText(el.value)
      .then(() => {
        console.log("Color copied to clipboard...");
      })
      .catch((err) => {
        console.log("Something went wrong", err);
      });

    document.body.removeChild(el);
  };

  const eyeDropper = (sendResponse) => {
    if (!window.EyeDropper) {
      console.log("Your browser does not support the EyeDropper API");
      return;
    }

    const eyeDropper = new EyeDropper();

    eyeDropper
      .open()
      .then((result) => {
        copyToClipboard(result.sRGBHex);
        sendResponse("hello");
      })
      .catch((e) => {
        console.log("error", e);
      });
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === "eyedropper") {
      window.focus();
      eyeDropper(sendResponse);
    }

    return true;
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "ready") {
    sendResponse(JSON.stringify(colorArr));
  }
});

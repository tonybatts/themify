// color converter utils
const RGBToHex = (rgb) => {
  let sep = rgb.indexOf(",") > -1 ? "," : " ";
  rgb = rgb.substr(4).split(")")[0].split(sep);

  // Convert %s to 0–255
  for (let R in rgb) {
    let r = rgb[R];
    if (r.indexOf("%") > -1) rgb[R] = Math.round((r.substr(0, r.length - 1) / 100) * 255);
  }

  let r = (+rgb[0]).toString(16),
    g = (+rgb[1]).toString(16),
    b = (+rgb[2]).toString(16);

  if (r.length == 1) r = "0" + r;
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;

  return "#" + r + g + b;
};

const RGBAToHexA = (rgba) => {
  let sep = rgba.indexOf(",") > -1 ? "," : " ";
  rgba = rgba.substr(5).split(")")[0].split(sep);

  // Strip the slash if using space-separated syntax
  if (rgba.indexOf("/") > -1) rgba.splice(3, 1);

  for (let R in rgba) {
    let r = rgba[R];
    if (r.indexOf("%") > -1) {
      let p = r.substr(0, r.length - 1) / 100;

      if (R < 3) {
        rgba[R] = Math.round(p * 255);
      } else {
        rgba[R] = p;
      }
    }
  }

  let r = (+rgba[0]).toString(16),
    g = (+rgba[1]).toString(16),
    b = (+rgba[2]).toString(16),
    a = Math.round(+rgba[3] * 255).toString(16);

  if (r.length == 1) r = "0" + r;
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;
  if (a.length == 1) a = "0" + a;

  return "#" + r + g + b + a;
};

// copy to the users clipboard
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

const isRGBA = (color) => {
  const values = color.split(",");
  if (values.length === 4) {
    return "rgba";
  }
};

const generateColorList = (colorArr, shouldAddHashToColorValue) => {
  // clear out the old list
  document.querySelector(".popup-container").innerHTML = "";
  // generate the new list
  colorArr.forEach((color, index) => {
    const wrapper = document.createElement("div");
    const colorBox = document.createElement("div");
    const pWrapper = document.createElement("div");
    const el = document.createElement("p");

    wrapper.classList.add("wrapper");
    colorBox.classList.add("color-box");
    pWrapper.classList.add("p-wrapper");
    el.classList.add("el");

    // if a user chooses to generate colors with a hex that has no # we need to add that back when setting the color
    if (shouldAddHashToColorValue) {
      colorBox.style.backgroundColor = `#${color}`;
    } else {
      colorBox.style.backgroundColor = color;
    }

    el.textContent = color;

    wrapper.addEventListener("click", () => {
      const toolTipWrapper = document.createElement("div");
      const toolTipText = document.createElement("p");

      toolTipText.textContent = "Copied!";

      if (index === 0) {
        toolTipWrapper.classList.add("tool-tip-wrapper-bottom");
        toolTipText.classList.add("tool-tip-text-bottom");
      } else {
        toolTipWrapper.classList.add("tool-tip-wrapper");
        toolTipText.classList.add("tool-tip-text");
      }

      toolTipWrapper.appendChild(toolTipText);
      wrapper.appendChild(toolTipWrapper);

      copyToClipboard(color);
      toolTipText.style.visibility = "visible";
      toolTipText.style.opacity = "1";

      setTimeout(() => {
        toolTipText.classList.add("tool-tip-text__fade-out");
        setTimeout(() => {
          toolTipWrapper.remove();
        }, 500);
      }, 700);
    });

    document.querySelector(".popup-container").appendChild(wrapper);

    pWrapper.appendChild(el);
    wrapper.appendChild(pWrapper);
    wrapper.appendChild(colorBox);
  });
};

const storeAndGenerateColorList = (colorArr) => {
  chrome.storage.sync.get("themifySettings", ({ themifySettings }) => {
    if (colorArr) {
      colorArr.forEach((color, index) => {
        const isColorRGBA = isRGBA(color);
        let shouldAddHashToColorValue = false;

        if (themifySettings.selectedColorType === "hex") {
          const finalColorValue = isColorRGBA ? RGBAToHexA(color) : RGBToHex(color);
          colorArr[index] = finalColorValue;
        }

        if (themifySettings.selectedColorType === "hex2") {
          const finalColorValue = isColorRGBA ? RGBAToHexA(color) : RGBToHex(color);
          colorArr[index] = finalColorValue.substring(1);
          shouldAddHashToColorValue = true;
        }

        generateColorList(colorArr, shouldAddHashToColorValue);
        chrome.storage.sync.set({ colors: JSON.stringify(colorArr) });
      });
    }
  });
};

const getColors = () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tab) => {
    chrome.tabs.sendMessage(tab[0].id, "colors", (response) => {
      if (!window.chrome.runtime.lastError) {
        document.querySelector(".context-menu-icon").style.display = "block";
        if (response) {
          let colorArr = JSON.parse(response);
          storeAndGenerateColorList(colorArr);
        }
      } else {
        document.querySelector(".popup-container").textContent = "";
        document.querySelector(".context-menu-icon").style.display = "none";
        const oops = document.createElement("h1");
        oops.textContent = "Refresh the page to view colors";
        oops.classList.add("oops");

        document.querySelector("body").appendChild(oops);
      }
    });
  });
};

window.onload = getColors();

// configure the settings menu on load
chrome.storage.sync.get("themifySettings", ({ themifySettings }) => {
  document.querySelector(`input[name=${themifySettings.selectedColorType ?? "rgb"}]`).checked = true;
  document.querySelector(`input[name=${themifySettings.selectedColorType ?? "rgb"}]`).disabled = true;
});

// listeners
document.querySelector(".context-menu-icon").addEventListener("click", (e) => {
  document.querySelector(".slide-menu").classList.toggle("show");
  document.querySelector(".menu-overlay").classList.toggle("show-overlay");
});

document.querySelector(".eye-dropper-container").addEventListener("click", async (e) => {
  if (!window.EyeDropper) {
    alert("your browser does not support this feature");
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  chrome.tabs.sendMessage(tab.id, "eyedropper");
});

const allInputs = document.querySelectorAll("input");
allInputs.forEach((checkbox) => {
  checkbox.addEventListener("click", async (e) => {
    // remove old state
    allInputs.forEach((checkbox) => {
      checkbox.checked = false;
      checkbox.disabled = false;
    });
    await chrome.storage.sync.set({ themifySettings: { selectedColorType: e.target.name } });
    e.target.checked = true;
    e.target.disabled = true;

    // apply changes to popup
    location.reload();
  });
});

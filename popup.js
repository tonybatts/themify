chrome.tabs.executeScript({
  file: "themizer.js"
});

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

const setting = {
  rgb: true,
  hex: false,
  hex2: false
};

const setSetting = ({ rgb, hex, hex2 }) => {
  if (rgb === true) {
    chrome.storage.sync.set({ rgb: true });
  } else {
    chrome.storage.sync.set({ rgb: false });
  }

  if (hex === true) {
    chrome.storage.sync.set({ hex: true });
  } else {
    chrome.storage.sync.set({ hex: false });
  }

  if (hex2 === true) {
    chrome.storage.sync.set({ hex2: true });
  } else {
    chrome.storage.sync.set({ hex2: false });
  }

  if (!rgb && !hex && !hex2) {
    chrome.storage.sync.set({ rgb: true });
  }
};

const checkColorValue = (color) => {
  values = color.split(",");
  if (values.length === 4) {
    return "rgba";
  }
};

const checkSetting = (colorArr) => {
  const generateColors = (hex) => {
    colorArr.forEach((color, index) => {
      // console.log(color)
      const wrapper = document.createElement("div");
      const colorBox = document.createElement("div");
      const pWrapper = document.createElement("div");
      const el = document.createElement("p");

      wrapper.classList.add("wrapper");
      colorBox.classList.add("color-box");
      pWrapper.classList.add("p-wrapper");
      el.classList.add("el");

      if (hex) {
        colorBox.style.backgroundColor = hex + color;
      }
      colorBox.style.backgroundColor = color;
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

  // Check if no settings have been set, default to rgb
  chrome.storage.sync.get(["rgb"], (result) => {
    if (result.rgb !== true) {
      chrome.storage.sync.get(["hex"], (result2) => {
        if (result2.hex !== true) {
          chrome.storage.sync.get(["hex2"], (result3) => {
            if (result3.hex2 !== true) {
              if (colorArr) {
                console.log(colorArr);
                generateColors();
                chrome.storage.sync.set({ colors: JSON.stringify(colorArr) });

                const checkbox = document.querySelector('input[name="option1"]');
                checkbox.disabled = true;
                checkbox.checked = true;
              }
            }
          });
        }
      });
    }
  });

  chrome.storage.sync.get(["rgb"], (result) => {
    if (result.rgb === true) {
      if (colorArr) {
        generateColors();
        chrome.storage.sync.set({ colors: JSON.stringify(colorArr) });
      }
    }
  });

  chrome.storage.sync.get(["hex"], (result) => {
    if (result.hex === true) {
      if (colorArr) {
        colorArr.forEach((color, index) => {
          const rgba = checkColorValue(color);
          if (rgba === "rgba") {
            colorArr[index] = RGBAToHexA(color);
          } else {
            colorArr[index] = RGBToHex(color);
          }
        });

        generateColors();
        chrome.storage.sync.set({ colors: JSON.stringify(colorArr) });
      }
    }
  });

  chrome.storage.sync.get(["hex2"], (result) => {
    if (result.hex2 === true) {
      if (colorArr) {
        colorArr.forEach((color, index) => {
          const rgba = checkColorValue(color);
          if (rgba === "rgba") {
            colorArr[index] = RGBAToHexA(color).substring(1);
          } else {
            colorArr[index] = RGBToHex(color).substring(1);
          }
        });

        generateColors("#");
        chrome.storage.sync.set({ colors: JSON.stringify(colorArr) });
      }
    }
  });
};

let getColors = () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tab) => {
    chrome.tabs.sendMessage(tab[0].id, "ready", (response) => {
      if (!window.chrome.runtime.lastError) {
        document.querySelector(".context-menu-icon").style.display = "block";
        if (response) {
          let colorArr = JSON.parse(response);
          checkSetting(colorArr);
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

checkCheckbox = () => {
  chrome.storage.sync.get(["rgb"], (result) => {
    if (result.rgb === true) {
      document.querySelector('input[name="option1"]').checked = true;
      document.querySelector('input[name="option1"]').disabled = true;
    } else {
      document.querySelector('input[name="option1"]').checked = false;
      document.querySelector('input[name="option1"]').disabled = false;
    }
  });

  chrome.storage.sync.get(["hex"], (result) => {
    if (result.hex === true) {
      document.querySelector('input[name="option2"]').checked = true;
      document.querySelector('input[name="option2"]').disabled = true;
    } else {
      document.querySelector('input[name="option2"]').checked = false;
      document.querySelector('input[name="option2"]').disabled = false;
    }
  });

  chrome.storage.sync.get(["hex2"], (result) => {
    if (result.hex2 === true) {
      document.querySelector('input[name="option3"]').checked = true;
      document.querySelector('input[name="option3"]').disabled = true;
    } else {
      document.querySelector('input[name="option3"]').checked = false;
      document.querySelector('input[name="option3"]').disabled = false;
    }
  });
};

let slideMenu = () => {
  document.querySelector(".context-menu-icon").addEventListener("click", (e) => {
    document.querySelector(".slide-menu").classList.toggle("show");
    document.querySelector(".menu-overlay").classList.toggle("show-overlay");
  });
  checkCheckbox();
};

slideMenu();

const updateColors = () => {
  chrome.storage.sync.get(["colors"], (result) => {
    if (result.colors) {
      console.log(result.colors);
      let colorArr = JSON.parse(result.colors);

      // document.querySelector(".popup-container").textContent = ""
    }
  });
};

const checkboxDisable = () => {
  const allInputes = document.querySelectorAll("input");
  allInputes.forEach((checkbox) => {
    checkbox.addEventListener("click", (e) => {
      if (e.target.name === "option1") {
        setting.rgb = true;
      } else {
        setting.rgb = false;
      }

      if (e.target.name === "option2") {
        setting.hex = true;
      } else {
        setting.hex = false;
      }

      if (e.target.name === "option3") {
        setting.hex2 = true;
      } else {
        setting.hex2 = false;
      }
      setSetting(setting);
      if (checkbox.checked === true) {
        allInputes.forEach((enable) => {
          enable.disabled = false;
          enable.checked = false;
        });

        checkbox.disabled = true;
        checkbox.checked = true;
      }
      location.reload();
    });
  });
};

checkboxDisable();

chrome.tabs.executeScript({
  file: "themizer.js"
})

const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

let getColors = () => {
  chrome.tabs.query({ 'active': true, "lastFocusedWindow": true },
    (tab) => {
      chrome.tabs.sendMessage(tab[0].id, "ready", (response) => {
        if (!window.chrome.runtime.lastError) {
          if (response) {
            const colorArr = JSON.parse(response)
            console.log(colorArr)
            colorArr.forEach((color, index) => {
              const wrapper = document.createElement("div")
              const colorBox = document.createElement("div")
              const pWrapper = document.createElement("div")
              const el = document.createElement("p")

              wrapper.classList.add("wrapper")
              colorBox.classList.add("color-box")
              pWrapper.classList.add("p-wrapper")
              el.classList.add("el")

              colorBox.style.backgroundColor = color
              el.textContent = color

              wrapper.addEventListener("click", () => {
                const toolTipWrapper = document.createElement("div")
                const toolTipText = document.createElement("p")


                toolTipText.textContent = "Copied!"

                if (index === 0) {
                  toolTipWrapper.classList.add("tool-tip-wrapper-bottom")
                  toolTipText.classList.add("tool-tip-text-bottom")
                } else {
                  toolTipWrapper.classList.add("tool-tip-wrapper")
                  toolTipText.classList.add("tool-tip-text")
                }

                toolTipWrapper.appendChild(toolTipText)
                wrapper.appendChild(toolTipWrapper)

                copyToClipboard(color)
                toolTipText.style.visibility = "visible"
                toolTipText.style.opacity = "1"

                setTimeout(() => {
                  toolTipText.classList.add("tool-tip-text__fade-out")
                  setTimeout(() => {
                    toolTipWrapper.remove()
                  }, 500);
                }, 700);

              })

              document.querySelector(".popup-container").appendChild(wrapper)

              pWrapper.appendChild(el)
              wrapper.appendChild(pWrapper)
              wrapper.appendChild(colorBox)
            })
          }
        } else {
          const oops = document.createElement("h1")
          oops.textContent = "Refresh the page to view colors"
          oops.classList.add("oops")

          document.querySelector("body").appendChild(oops)
        }
      })
    }
  )
}



window.onload = getColors()


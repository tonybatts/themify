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
            colorArr.forEach((color) => {
              const wrapper = document.createElement("div")
              const colorBox = document.createElement("div")
              const pWrapper = document.createElement("div")
              const el = document.createElement("p")
              // const copyEl = document.createElement("img")

              wrapper.classList.add("wrapper")
              colorBox.classList.add("color-box")
              pWrapper.classList.add("p-wrapper")
              // copyEl.classList.add("copy")
              el.classList.add("el")

              colorBox.style.backgroundColor = color
              el.textContent = color
              // copyEl.src = "icons/content_copy.svg"

              wrapper.addEventListener("click", () => {
                const toolTipWrapper = document.createElement("div")
                const toolTipText = document.createElement("p")
                toolTipWrapper.classList.add("tool-tip-wrapper")
                toolTipText.classList.add("tool-tip-text")

                toolTipText.textContent = "Copied!"

                toolTipWrapper.appendChild(toolTipText)
                wrapper.appendChild(toolTipWrapper)

                copyToClipboard(color)
                toolTipText.style.visibility = "visible"
                toolTipText.style.opacity = "1"

                setTimeout(() => {
                  toolTipWrapper.remove()
                }, 1000);



              })
              document.querySelector(".popup-container").appendChild(wrapper)

              pWrapper.appendChild(el)
              // pWrapper.appendChild(copyEl)
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


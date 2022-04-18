chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case "eye-dropper":
      activateEyeDropper();
      break;
    default:
      console.log(`Command ${command} not found`);
  }
});

const activateEyeDropper = () => {
  chrome.tabs.executeScript({
    file: "themizer.js"
  });

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tab) => {
    chrome.tabs.sendMessage(tab[0].id, "eyedropper", (response) => {
      console.log(response);
    });
  });
};

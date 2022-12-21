// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.info({ message }, "from background.ts");
});

export default {};

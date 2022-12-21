import { useEffect } from "react";

function Content() {
  useEffect(() => {
    document.addEventListener("selectionchange", async (event) => {
      const selection = window.getSelection();
      if (selection === null) return;

      const selectedText = selection.toString();
      if (selectedText.length === 0) return;

      chrome.runtime.sendMessage(
        { type: "selectedText", data: selectedText },
        (response) => {
          // console.log(response);
        }
      );
    });
  }, []);

  return <div>This is Content component</div>;
}

export default Content;

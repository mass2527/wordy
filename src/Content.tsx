import { useEffect, useState } from "react";

function Content() {
  const [translatedText, setTranslatedText] = useState("");
  const [rectPosition, setRectPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const [isHotKeyPressed, setIsHotKeyPressed] = useState(false);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection === null) return;
      if (selection.isCollapsed) {
        setTranslatedText("");
        setRectPosition({ top: 0, left: 0 });
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setRectPosition({
        top: rect.y + rect.height * 1.2 + window.scrollY,
        left: rect.x,
      });

      const selectedText = selection.toString();
      if (selectedText.length === 0) return;
      const isSupportedText = (text: string) => /^[A-Za-z\s\_]*$/.test(text);
      if (!isSupportedText(selectedText)) return;

      chrome.runtime.sendMessage(
        { type: "selectedText", data: selectedText },
        (response) => {
          setTranslatedText(response.data);
        }
      );
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  useEffect(() => {
    const IS_MAC_OS = /Mac OS X/.test(navigator.userAgent);
    const getHotKey = (event: KeyboardEvent) =>
      IS_MAC_OS ? event.metaKey : event.ctrlKey;
    const isHotKey = (event: KeyboardEvent) =>
      event.key === "Meta" || event.key === "Control";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (!isHotKey) return;

      const hotKey = getHotKey(event);
      setIsHotKeyPressed(hotKey);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isHotKey) return;

      const hotKey = getHotKey(event);
      setIsHotKeyPressed(hotKey);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div>
      {translatedText && isHotKeyPressed && (
        <div
          style={{
            width: "max-content",
            maxWidth: "500px",
            position: "absolute",
            top: rectPosition.top,
            left: rectPosition.left,
            zIndex: 2147483647,
            background: "rgb(0,0,0)",
            color: "rgb(255,255,255)",
            padding: "8px",
            fontSize: "16px",
            lineHeight: 1.5,
            borderColor: "rgba(255, 255, 255, 0.01)",
            borderRadius: "10px",
          }}
          dangerouslySetInnerHTML={{
            __html: translatedText.replace(/([2-9]\.)/g, "<br/>$1"),
          }}
        />
      )}
    </div>
  );
}

export default Content;

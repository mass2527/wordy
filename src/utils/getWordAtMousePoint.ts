type MousePoint = {
  x: number;
  y: number;
};

const isMouseInsideOfDOMRect = (domRect: DOMRect, { x, y }: MousePoint) => {
  return (
    domRect.left <= x &&
    domRect.right >= x &&
    domRect.top <= y &&
    domRect.bottom >= y
  );
};

export function getWordAtMousePoint(
  node: Node,
  mousePoint: MousePoint,
): string | null {
  if (node.nodeType === node.TEXT_NODE) {
    const textRange = document.caretRangeFromPoint(mousePoint.x, mousePoint.y);
    if (textRange === null) return null;

    // @ts-ignore
    textRange.expand('word');
    const wordAtMousePoint = textRange.toString().trim();
    return wordAtMousePoint;
  } else {
    for (let i = 0; i < node.childNodes.length; i++) {
      const childNode = node.childNodes[i];
      const document = childNode.ownerDocument;
      if (document === null) continue;

      const range = document.createRange();
      range.selectNodeContents(node.childNodes[i]);
      const domRect = range.getBoundingClientRect();
      if (isMouseInsideOfDOMRect(domRect, mousePoint)) {
        return getWordAtMousePoint(childNode, mousePoint);
      }
    }
  }
  return null;
}

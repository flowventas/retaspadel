function copyComputedStyles(source: HTMLElement, target: HTMLElement) {
  const computed = window.getComputedStyle(source);

  for (const property of computed) {
    target.style.setProperty(
      property,
      computed.getPropertyValue(property),
      computed.getPropertyPriority(property),
    );
  }

  target.style.setProperty("box-sizing", "border-box");
}

function cloneStyledNode(node: HTMLElement): HTMLElement {
  const clone = node.cloneNode(false) as HTMLElement;
  copyComputedStyles(node, clone);

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      clone.appendChild(document.createTextNode(child.textContent ?? ""));
      continue;
    }

    if (child instanceof HTMLElement) {
      clone.appendChild(cloneStyledNode(child));
    }
  }

  return clone;
}

export async function exportNodeAsPng(node: HTMLElement, filename: string) {
  const rect = node.getBoundingClientRect();
  const clonedNode = cloneStyledNode(node);
  const wrapper = document.createElement("div");
  const bodyStyles = window.getComputedStyle(document.body);

  wrapper.style.width = `${Math.ceil(rect.width)}px`;
  wrapper.style.padding = "20px";
  wrapper.style.background = bodyStyles.backgroundColor || "#ffffff";
  wrapper.style.color = bodyStyles.color || "#000000";
  wrapper.style.fontFamily = bodyStyles.fontFamily;
  wrapper.appendChild(clonedNode);

  const width = Math.ceil(rect.width) + 40;
  const height = Math.ceil(rect.height) + 40;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">${wrapper.outerHTML}</div>
      </foreignObject>
    </svg>
  `;

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  const scale = window.devicePixelRatio > 1 ? 2 : 1;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("No pudimos generar la imagen del ranking."));
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;

  const context = canvas.getContext("2d");
  if (!context) {
    URL.revokeObjectURL(url);
    throw new Error("No pudimos preparar la descarga del ranking.");
  }

  context.scale(scale, scale);
  context.drawImage(image, 0, 0, width, height);
  URL.revokeObjectURL(url);

  const pngUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = pngUrl;
  link.download = filename;
  link.click();
}

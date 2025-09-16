// Función auxiliar para cortar texto en varias líneas
export function wrapText(label: string, maxChars: number = 12): string[] {
  const words = label.split(" ");
  let line = "";
  const lines: string[] = [];

  words.forEach((word) => {
    if ((line + word).length > maxChars) {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line += word + " ";
    }
  });

  if (line) lines.push(line.trim());
  return lines;
}

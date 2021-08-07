import { CachedMetadata, Editor, EditorPosition, HeadingCache } from 'obsidian';

const getCurrentHeaderDepth = (
  headings: HeadingCache[],
  cursor: EditorPosition
): number => {
  const previousHeadings = headings.filter(
    (heading) => heading.position.end.line < cursor.line
  );

  if (!previousHeadings.length) {
    return 0;
  }

  return previousHeadings[previousHeadings.length - 1].level;
};

const getSubsequentHeadings = (
  headings: HeadingCache[],
  cursor: EditorPosition
): HeadingCache[] => {
  return headings.filter((heading) => heading.position.end.line > cursor.line);
};

export const replaceHeaderNumbering = (
  { headings = [] }: CachedMetadata,
  cursor: EditorPosition,
  editor: Editor,
): string | undefined => {
  console.log('replaceHeaderNumbering 100')

  const currentDepth = getCurrentHeaderDepth(headings, cursor);
  const subsequentHeadings = getSubsequentHeadings(headings, cursor);
  const includedHeadings: HeadingCache[] = [];

  console.log('replaceHeaderNumbering 200')

  for (const heading of subsequentHeadings) {
    console.log('replaceHeaderNumbering -- for 300')
    if (heading.level <= currentDepth) {
      break;
    }

    if (
      heading.level >= 1 &&
      heading.level <= 6
    ) {
      includedHeadings.push(heading);
    }
    console.log('replaceHeaderNumbering -- for 310')
  }

  console.log('replaceHeaderNumbering -- 400')

  if (!includedHeadings.length) {
    // No headings found
    return;
  }

  console.log('replaceHeaderNumbering -- for 500')

  const listStyle = "number"
  const firstHeadingDepth = includedHeadings[0].level;
  const links = includedHeadings.map((heading) => {
    const itemIndication = (listStyle === "number" && "1.") || "-";
    const indent = new Array(Math.max(0, heading.level - firstHeadingDepth))
      .fill("\t")
      .join("");

    return `${indent}${itemIndication} [[#${heading.heading}|${heading.heading}]]`;
  });



  /* DELETE ME
  return endent`
    ${settings.title ? `${settings.title}\n` : ""}
    ${`${links.join("\n")}\n`}
  `;
  */

  editor.replaceRange("hola", cursor);
  editor.replaceRange(links.join("\n"), cursor);
};
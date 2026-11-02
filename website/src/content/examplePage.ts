import path from "node:path/posix"

/**
 * An example page: the title and highlights of the example JSDoc header introduce the rest of the source, rendered as a
 * TypeScript code block, and a link to the example on GitHub.
 */
export const examplePage = (source: string, sourcePath: string, githubUrl: string) => {
  const match = leadingJsDoc.exec(source)
  if (match === null) throw new Error(`${sourcePath} must have a leading JSDoc block with its title and highlights`)
  const [header, imports = "", comment = ""] = match
  const [title = "", ...intro] = jsDocLines(comment)
  const highlights = intro.join("\n").trim().replace(/^Highlights:\s*/, "").trim()
  const code = (imports + source.slice(header.length)).trim()
  const markdown = [
    ...(highlights === "" ? [] : [highlights, ""]),
    `\`\`\`ts title="${path.basename(sourcePath)}"`,
    code,
    "```",
    "",
    `[View on GitHub](${githubUrl})`,
    ""
  ].join("\n")
  return { title, markdown }
}

// The header follows the imports, so that it sits right above the example program
const leadingJsDoc = /^((?:\s*import\s[^"']*["'][^"']+["'];?)*\s*)\/\*\*([\s\S]*?)\*\/[^\S\n]*\n?/

const jsDocLines = (comment: string) =>
  comment
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trimEnd())
    .join("\n")
    .trim()
    .split("\n")

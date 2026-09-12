import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const inputPath = resolve(projectRoot, process.argv[2] ?? "doc/Luat_ThuaKe.doc");
const outputPath = resolve(
  projectRoot,
  process.argv[3] ?? "knowledge-base/legal-sources/civil-code-2015.inheritance.json",
);
const selectedArticleNumbers = new Set([621, 627, 629, 630, 644, 649, 650, 651, 652, 653, 654]);
const officialUrl = "https://vanban.chinhphu.vn/?pageid=27160&docid=183188";

interface ExtractedSection {
  id: string;
  label: string;
  text: string;
}

interface ExtractedArticle {
  id: string;
  number: string;
  title: string;
  sections: ExtractedSection[];
  sourceDocument: string;
  officialUrl: string;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/gu, " ").trim();
}

function extractPlainText(): string {
  if (inputPath.endsWith(".txt")) {
    return readFileSync(inputPath, "utf8");
  }

  const workDirectory = mkdtempSync(join(tmpdir(), "inheritance-law-extract-"));
  const profileDirectory = join(workDirectory, "libreoffice-profile");

  try {
    execFileSync(
      "libreoffice",
      [
        `-env:UserInstallation=${pathToFileURL(profileDirectory).href}`,
        "--headless",
        "--convert-to",
        "txt:Text (encoded):UTF8",
        "--outdir",
        workDirectory,
        inputPath,
      ],
      { stdio: "pipe" },
    );

    const textPath = join(workDirectory, `${basename(inputPath, ".doc")}.txt`);
    return readFileSync(textPath, "utf8");
  } finally {
    rmSync(workDirectory, { recursive: true, force: true });
  }
}

function splitArticles(text: string): Map<number, { title: string; lines: string[] }> {
  const articles = new Map<number, { title: string; lines: string[] }>();
  let currentArticle: { number: number; title: string; lines: string[] } | undefined;

  for (const rawLine of text.replace(/^\uFEFF/u, "").split(/\r?\n/u)) {
    const line = normalizeText(rawLine);
    if (!line) continue;

    const heading = line.match(/^Điều\s+(\d+)\.\s*(.+)$/u);
    if (heading) {
      if (currentArticle) {
        articles.set(currentArticle.number, {
          title: currentArticle.title,
          lines: currentArticle.lines,
        });
      }
      currentArticle = {
        number: Number(heading[1]),
        title: normalizeText(heading[2]),
        lines: [],
      };
      continue;
    }

    currentArticle?.lines.push(line);
  }

  if (currentArticle) {
    articles.set(currentArticle.number, {
      title: currentArticle.title,
      lines: currentArticle.lines,
    });
  }

  return articles;
}

function parseSections(lines: string[]): ExtractedSection[] {
  const sections: ExtractedSection[] = [];
  let currentClause: number | undefined;

  for (const line of lines) {
    const clause = line.match(/^(\d+)\.\s*(.*)$/u);
    if (clause) {
      currentClause = Number(clause[1]);
      sections.push({
        id: `clause-${currentClause}`,
        label: `Khoản ${currentClause}`,
        text: normalizeText(clause[2]),
      });
      continue;
    }

    const point = line.match(/^([a-zđ])\)\s*(.*)$/u);
    if (point && currentClause !== undefined) {
      const previous = sections.at(-1);
      if (previous?.id === `clause-${currentClause}`) {
        previous.id = `clause-${currentClause}-intro`;
      }
      sections.push({
        id: `clause-${currentClause}-${point[1]}`,
        label: `Khoản ${currentClause} điểm ${point[1]}`,
        text: normalizeText(point[2]),
      });
      continue;
    }

    const previous = sections.at(-1);
    if (previous) {
      previous.text = normalizeText(`${previous.text} ${line}`);
    } else {
      sections.push({ id: "main", label: "Nội dung điều luật", text: line });
    }
  }

  return sections;
}

const sourceText = extractPlainText();
const allArticles = splitArticles(sourceText);
const sourceDocument = relative(projectRoot, inputPath).replaceAll("\\", "/");
const provisions: Record<string, ExtractedArticle> = {};

for (const articleNumber of selectedArticleNumbers) {
  const article = allArticles.get(articleNumber);
  if (!article) {
    throw new Error(`Không tìm thấy Điều ${articleNumber} trong ${sourceDocument}`);
  }

  const id = `article-${articleNumber}`;
  provisions[id] = {
    id,
    number: `Điều ${articleNumber}`,
    title: article.title,
    sections: parseSections(article.lines),
    sourceDocument,
    officialUrl,
  };
}

const catalog = {
  schemaVersion: 1,
  document: {
    id: "civil-code-2015",
    title: "Bộ luật Dân sự 2015",
    documentNumber: "91/2015/QH13",
    sourceDocument,
    sourceSha256: createHash("sha256").update(readFileSync(inputPath)).digest("hex"),
    officialUrl,
  },
  provisions,
};

writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(`Đã lưu ${Object.keys(provisions).length} điều luật vào ${relative(projectRoot, outputPath)}`);

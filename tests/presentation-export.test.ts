import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { unzipSync, strFromU8 } from "fflate";
import { DOMParser } from "@xmldom/xmldom";
import {
  exportPresentation,
  checkPresentation,
} from "../lib/presentation-export";
import type { SlideDocument, SlideElement } from "../lib/contracts";
const image = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1kAAAAASUVORK5CYII=",
  "base64",
);
function element(
  type: SlideElement["type"],
  patch: Partial<SlideElement> = {},
): SlideElement {
  return {
    id: randomUUID(),
    type,
    x: 80,
    y: 90,
    width: 700,
    height: 130,
    rotation: 0,
    text: "An editable learning objective",
    fontSize: 36,
    fill: "#28263b",
    ...patch,
  };
}
function document(): SlideDocument {
  return {
    schemaVersion: 1,
    slides: [
      {
        id: randomUUID(),
        title: "Introduction",
        background: "#f0edfc",
        objects: [
          element("text"),
          element("shape", {
            x: 80,
            y: 310,
            width: 260,
            height: 90,
            rotation: -15,
            fill: "#6658e8",
          }),
        ],
      },
      {
        id: randomUUID(),
        title: "Practice",
        background: "#ffffff",
        objects: [
          element("text", {
            text: "Sources and evidence\nReview before teaching",
            height: 150,
          }),
          element("image", {
            assetId: randomUUID(),
            x: 600,
            y: 300,
            width: 120,
            height: 120,
          }),
        ],
      },
    ],
  };
}
function xml(bytes: Uint8Array) {
  const errors: string[] = [];
  const doc = new DOMParser({
    onError: (_level, message) => errors.push(message),
  }).parseFromString(strFromU8(bytes), "application/xml");
  assert.equal(errors.length, 0, errors.join("\n"));
  return doc;
}
test("PowerPoint preserves native editable text/shapes, image bytes, slide geometry and notes", async () => {
  const source = document();
  let loads = 0;
  const { bytes, warnings } = await exportPresentation({
    title: "Editable export demonstration",
    audience: "Indian AYUSH practitioners",
    document: source,
    loadAsset: async () => {
      loads++;
      return { mime: "image/png", data: image };
    },
  });
  assert.equal(loads, 1);
  assert.equal(warnings.length, 0);
  const zip = unzipSync(bytes);
  assert.ok(zip["[Content_Types].xml"]);
  for (const [name, content] of Object.entries(zip))
    if (name.endsWith(".xml") || name.endsWith(".rels")) xml(content);
  const first = xml(zip["ppt/slides/slide1.xml"]);
  const textNodes = first.getElementsByTagName("a:t");
  assert.ok(
    Array.from(textNodes).some(
      (n) => n.textContent === "An editable learning objective",
    ),
  );
  assert.equal(first.getElementsByTagName("p:sp").length, 2);
  assert.equal(first.getElementsByTagName("p:pic").length, 0);
  const size = xml(zip["ppt/presentation.xml"]).getElementsByTagName(
    "p:sldSz",
  )[0];
  assert.equal(
    Number(size.getAttribute("cx")) / Number(size.getAttribute("cy")),
    16 / 9,
  );
  const second = xml(zip["ppt/slides/slide2.xml"]);
  assert.equal(second.getElementsByTagName("p:pic").length, 1);
  const media = Object.entries(zip).filter(
    ([name]) => name.startsWith("ppt/media/") && name.endsWith(".png"),
  );
  assert.equal(media.length, 1);
  assert.deepEqual(Buffer.from(media[0][1]), image);
  assert.match(
    strFromU8(zip["ppt/notesSlides/notesSlide1.xml"]),
    /Indian AYUSH practitioners/,
  );
  if (process.env.EXPORT_DEMO_PATH)
    await writeFile(process.env.EXPORT_DEMO_PATH, bytes);
});
test("PowerPoint fails explicitly if an image cannot be resolved", async () => {
  await assert.rejects(
    exportPresentation({
      title: "Private images",
      audience: "Practitioners",
      document: document(),
      loadAsset: async () => null,
    }),
    /image is unavailable/,
  );
});
test("export preflight identifies off-slide objects and explicit text line overflow", () => {
  const source = document();
  source.slides[0].objects[0] = {
    ...source.slides[0].objects[0],
    x: 950,
    height: 10,
    text: "One\nTwo",
  };
  const warnings = checkPresentation(source);
  assert.equal(
    warnings.filter((w) => w.objectId === source.slides[0].objects[0].id)
      .length,
    2,
  );
});

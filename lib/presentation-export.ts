import PptxGenJS from "pptxgenjs";
import { documentSchema, type SlideDocument } from "./contracts";

export type PresentationAsset = { mime: string; data: Uint8Array };
export type ExportWarning = {
  slide: number;
  objectId: string;
  message: string;
};
const UNIT = 72; // The 960 × 540 editor maps to a 13⅓ × 7½ inch slide.
export function checkPresentation(document: SlideDocument): ExportWarning[] {
  const warnings: ExportWarning[] = [];
  document.slides.forEach((slide, i) =>
    slide.objects.forEach((object) => {
      if (
        object.x < 0 ||
        object.y < 0 ||
        object.x + object.width > 960 ||
        object.y + object.height > 540
      )
        warnings.push({
          slide: i + 1,
          objectId: object.id,
          message:
            "Object extends outside the slide; check its intended placement.",
        });
      if (
        object.type === "text" &&
        object.text.split("\n").length * object.fontSize > object.height
      )
        warnings.push({
          slide: i + 1,
          objectId: object.id,
          message:
            "Explicit text lines may exceed the text box height. Wrapping and font rendering need visual review.",
        });
    }),
  );
  return warnings;
}
export async function exportPresentation(input: {
  title: string;
  audience: string;
  document: SlideDocument;
  loadAsset: (id: string) => Promise<PresentationAsset | null>;
}): Promise<{ bytes: Uint8Array; warnings: ExportWarning[] }> {
  const document = documentSchema.parse(input.document);
  const deck = new PptxGenJS();
  deck.defineLayout({
    name: "FORMA_16_9",
    width: 960 / UNIT,
    height: 540 / UNIT,
  });
  deck.layout = "FORMA_16_9";
  deck.author = "Course Creation Ecosystem";
  deck.subject = input.audience;
  deck.title = input.title;
  deck.company = "Forma Course Studio";
  deck.theme = { headFontFace: "Arial", bodyFontFace: "Arial" };
  const assets = new Map<string, PresentationAsset>();
  for (const source of document.slides) {
    const slide = deck.addSlide();
    slide.background = { color: source.background.slice(1) };
    slide.addNotes(
      `${input.title}\n${source.title}\nAudience: ${input.audience}\nExported from the saved Forma presentation. Images remain image objects; text and shapes remain editable.`,
    );
    for (const object of source.objects) {
      const box = {
        x: object.x / UNIT,
        y: object.y / UNIT,
        w: object.width / UNIT,
        h: object.height / UNIT,
        rotate: ((object.rotation % 360) + 360) % 360,
        objectName: object.id,
      };
      if (object.type === "text") {
        slide.addText(object.text, {
          ...box,
          fontFace: "Arial",
          fontSize: object.fontSize,
          color: object.fill.slice(1),
          margin: 0,
          breakLine: false,
          valign: "top",
          paraSpaceAfter: 0,
          lang: "en-IN",
        });
      } else if (object.type === "shape") {
        slide.addShape(deck.ShapeType.roundRect, {
          ...box,
          fill: { color: object.fill.slice(1) },
          line: { color: object.fill.slice(1), transparency: 100 },
        });
      } else {
        const id = object.assetId!;
        let asset = assets.get(id);
        if (!asset) {
          asset = (await input.loadAsset(id)) ?? undefined;
          if (!asset)
            throw new Error(
              "An image is unavailable. Restore it before exporting.",
            );
          if (!["image/png", "image/jpeg"].includes(asset.mime))
            throw new Error("An image format is unsupported.");
          assets.set(id, asset);
        }
        slide.addImage({
          ...box,
          data: `${asset.mime};base64,${Buffer.from(asset.data).toString("base64")}`,
        });
      }
    }
  }
  const output = await deck.write({
    outputType: "uint8array",
    compression: true,
  });
  if (!(output instanceof Uint8Array))
    throw new Error("PowerPoint serialization failed.");
  return { bytes: output, warnings: checkPresentation(document) };
}

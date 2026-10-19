"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { SlideDocument, SlideElement } from "@/lib/contracts";
import type { Outline } from "@/lib/ai";
import Shell from "./Shell";
import CourseBrief from "./CourseBrief";
const Canvas = dynamic(() => import("./SlideCanvas"), {
  ssr: false,
  loading: () => <div className="canvas-wrap">Opening the canvas…</div>,
});
type Course = {
  id: string;
  title: string;
  audience: string;
  project_title: string;
  presentation_id: string;
  revision: number;
  document: SlideDocument;
};
type Version = {
  revision: number;
  document: SlideDocument;
  created_at: string;
};
function download(name: string, value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Studio({
  initial,
  email,
}: {
  initial: Course;
  email: string;
}) {
  const [doc, setDoc] = useState(initial.document),
    [slideIndex, setSlideIndex] = useState(0),
    [selected, setSelected] = useState<string | null>(null),
    [saved, setSaved] = useState(JSON.stringify(initial.document)),
    [saving, setSaving] = useState(false),
    [paused, setPaused] = useState(false),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [versions, setVersions] = useState<Version[]>([]),
    [provider, setProvider] = useState<{
      available: boolean;
      model: string | null;
    }>({ available: false, model: null }),
    [attempts, setAttempts] = useState<
      { id: string; status: string; model: string; result: Outline | null }[]
    >([]),
    [generating, setGenerating] = useState(false),
    [outline, setOutline] = useState<Outline | null>(null),
    [approved, setApproved] = useState(false),
    [exporting, setExporting] = useState(false),
    [uploading, setUploading] = useState(false);
  const revision = useRef(initial.revision),
    undo = useRef<SlideDocument[]>([]),
    redo = useRef<SlideDocument[]>([]),
    versionDialog = useRef<HTMLDialogElement>(null),
    aiDialog = useRef<HTMLDialogElement>(null),
    imageDialog = useRef<HTMLDialogElement>(null);
  const signature = JSON.stringify(doc),
    dirty = signature !== saved;
  const slide = doc.slides[slideIndex],
    element = slide.objects.find((o) => o.id === selected);
  useEffect(() => {
    fetch("/api/providers")
      .then((r) => r.json())
      .then((d) => setProvider(d.providers[0]))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!dirty || saving || paused) return;
    const timer = setTimeout(() => {
      setSaving(true);
      fetch("/api/presentations/" + initial.presentation_id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedRevision: revision.current,
          document: doc,
        }),
      })
        .then(async (r) => {
          const data = await r.json();
          if (!r.ok) throw Error(data.error);
          revision.current = data.revision;
          setSaved(signature);
          setError("");
        })
        .catch((e) => {
          setPaused(true);
          setError(e.message);
        })
        .finally(() => setSaving(false));
    }, 900);
    return () => clearTimeout(timer);
  }, [signature, saved, saving, paused, dirty, doc, initial.presentation_id]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  function edit(next: SlideDocument) {
    undo.current = [...undo.current.slice(-49), doc];
    redo.current = [];
    setDoc(next);
  }
  function patchSlide(patch: Partial<SlideDocument["slides"][number]>) {
    edit({
      ...doc,
      slides: doc.slides.map((s, i) =>
        i === slideIndex ? { ...s, ...patch } : s,
      ),
    });
  }
  function patchElement(id: string, patch: Partial<SlideElement>) {
    patchSlide({
      objects: slide.objects.map((o) =>
        o.id === id
          ? {
              ...o,
              ...patch,
              x: Math.max(-1920, Math.min(1920, patch.x ?? o.x)),
              y: Math.max(-1080, Math.min(1080, patch.y ?? o.y)),
            }
          : o,
      ),
    });
  }
  function add(type: "text" | "shape", assetId?: string) {
    const id = crypto.randomUUID();
    patchSlide({
      objects: [
        ...slide.objects,
        {
          id,
          type: assetId ? "image" : type,
          x: 100,
          y: 100,
          width: assetId ? 360 : type === "text" ? 500 : 200,
          height: assetId ? 240 : type === "text" ? 100 : 160,
          rotation: 0,
          text: type === "text" ? "Your next big idea" : "",
          fill: type === "text" ? "#28263b" : "#a99be6",
          fontSize: 36,
          ...(assetId ? { assetId } : {}),
        },
      ],
    });
    setSelected(id);
  }
  const historyMove = (direction: "undo" | "redo") => {
    const from = direction === "undo" ? undo : redo,
      to = direction === "undo" ? redo : undo;
    if (!from.current.length) return;
    to.current.push(doc);
    setDoc(from.current.pop()!);
    setSelected(null);
  };
  async function history() {
    try {
      const r = await fetch("/api/presentations/" + initial.presentation_id);
      const data = await r.json();
      if (!r.ok) throw Error(data.error);
      setVersions(data);
      versionDialog.current?.showModal();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Shell email={email}>
      <div className="studio-layout">
        <div className="studio-heading">
          <div>
            <div className="eyebrow">
              {initial.project_title.toUpperCase()} / DESIGN STUDIO
            </div>
            <h1>{initial.title}</h1>
            <p>{initial.audience || "A new learning experience"}</p>
          </div>
          <div className="toolbar">
            <span className={"status " + (paused ? "bad" : "")} role="status">
              {paused
                ? "Save paused"
                : saving
                  ? "Saving…"
                  : dirty
                    ? "Unsaved edits"
                    : "Saved · v" + revision.current}
            </span>
            <button
              onClick={() =>
                download("presentation-draft.json", {
                  ...doc,
                  course: initial.title,
                })
              }
            >
              Download draft
            </button>
            <button
              disabled={dirty || saving || paused || exporting}
              className="primary"
              onClick={async () => {
                setExporting(true);
                setError("");
                try {
                  const response = await fetch(
                    "/api/courses/" + initial.id + "/export",
                  );
                  if (!response.ok)
                    throw Error(
                      (await response.json()).error ||
                        "PowerPoint export failed.",
                    );
                  const warnings = Number(
                    response.headers.get("X-Presentation-Warnings") || 0,
                  );
                  const url = URL.createObjectURL(await response.blob());
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "course-presentation.pptx";
                  link.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                  setNotice(
                    warnings
                      ? `PowerPoint downloaded with ${warnings} layout warning(s). Check off-slide objects and text boxes before delivery.`
                      : "Editable PowerPoint downloaded. Review fonts, wrapping, and image placement in your presentation application.",
                  );
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setExporting(false);
                }
              }}
            >
              {exporting ? "Exporting…" : "Export PowerPoint"}
            </button>
            <CourseBrief courseId={initial.id} />
            <button onClick={history}>Version history</button>
          </div>
        </div>
        {error && (
          <div className="notice error" role="alert">
            {error}{" "}
            {paused && (
              <>
                <button
                  onClick={() => {
                    setPaused(false);
                    setError("");
                  }}
                >
                  Retry save
                </button>{" "}
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Reload the saved presentation? Download your draft first to keep unsaved edits.",
                      )
                    )
                      window.location.reload();
                  }}
                >
                  Reload saved version
                </button>
              </>
            )}
          </div>
        )}
        {notice && (
          <div className="notice" role="status">
            {notice}
            <button className="text-button" onClick={() => setNotice("")}>
              {" "}
              &nbsp; Dismiss
            </button>
          </div>
        )}
        <div className="studio-grid">
          <div className="slides-sidebar">
            {doc.slides.map((s, i) => (
              <button
                className={"slide-thumb " + (i === slideIndex ? "active" : "")}
                key={s.id}
                onClick={() => {
                  setSlideIndex(i);
                  setSelected(null);
                }}
              >
                <span style={{ background: s.background }}>{s.title}</span>
                <small>{String(i + 1).padStart(2, "0")}</small>
              </button>
            ))}
            <button
              disabled={doc.slides.length >= 50}
              onClick={() => {
                const id = crypto.randomUUID();
                edit({
                  ...doc,
                  slides: [
                    ...doc.slides,
                    {
                      id,
                      title: "New lesson",
                      background: "#ffffff",
                      objects: [],
                    },
                  ],
                });
                setSlideIndex(doc.slides.length);
                setSelected(null);
              }}
            >
              + Slide
            </button>
          </div>
          <div className="canvas-panel">
            <div className="canvas-toolbar">
              <button
                disabled={slide.objects.length >= 100}
                onClick={() => add("text")}
              >
                T &nbsp; Text
              </button>
              <button
                disabled={slide.objects.length >= 100}
                onClick={() => add("shape")}
              >
                ▢ &nbsp; Shape
              </button>
              <button
                disabled={slide.objects.length >= 100}
                onClick={() => imageDialog.current?.showModal()}
              >
                ▧ &nbsp; Image
              </button>
              <button
                disabled={!undo.current.length}
                onClick={() => historyMove("undo")}
              >
                ↶ Undo
              </button>
              <button
                disabled={!redo.current.length}
                onClick={() => historyMove("redo")}
              >
                ↷ Redo
              </button>
            </div>
            <Canvas
              slide={slide}
              selected={selected}
              onSelect={setSelected}
              onChange={patchElement}
            />
            <div className="canvas-caption">
              <span>
                SLIDE {slideIndex + 1} OF {doc.slides.length}
              </span>
              <span>16:9 · 960 × 540</span>
            </div>
          </div>
          <div className="inspector">
            <h3>{element ? "Object properties" : "Slide properties"}</h3>
            {element ? (
              <>
                <span className="pill">{element.type.toUpperCase()}</span>
                {element.type === "text" && (
                  <label>
                    Text
                    <textarea
                      aria-label="Object text"
                      value={element.text}
                      onChange={(e) =>
                        patchElement(element.id, { text: e.target.value })
                      }
                    />
                  </label>
                )}
                <div className="pair">
                  {(["x", "y", "width", "height", "rotation"] as const).map(
                    (k) => (
                      <label key={k}>
                        {k}
                        <input
                          aria-label={"Object " + k}
                          type="number"
                          value={element[k]}
                          min={
                            k === "width" || k === "height"
                              ? 10
                              : k === "rotation"
                                ? -360
                                : -1920
                          }
                          max={
                            k === "rotation"
                              ? 360
                              : k === "height"
                                ? 1080
                                : 1920
                          }
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            if (!Number.isFinite(n)) return;
                            const min =
                                k === "width" || k === "height"
                                  ? 10
                                  : k === "rotation"
                                    ? -360
                                    : k === "y"
                                      ? -1080
                                      : -1920,
                              max =
                                k === "rotation"
                                  ? 360
                                  : k === "height" || k === "y"
                                    ? 1080
                                    : 1920;
                            patchElement(element.id, {
                              [k]: Math.max(min, Math.min(max, n)),
                            });
                          }}
                        />
                      </label>
                    ),
                  )}
                </div>
                {element.type !== "image" && (
                  <label>
                    Color
                    <input
                      type="color"
                      aria-label="Object color"
                      value={element.fill}
                      onChange={(e) =>
                        patchElement(element.id, { fill: e.target.value })
                      }
                    />
                  </label>
                )}
                {element.type === "text" && (
                  <label>
                    Font size
                    <input
                      type="number"
                      min={10}
                      max={200}
                      value={element.fontSize}
                      onChange={(e) =>
                        patchElement(element.id, {
                          fontSize: Math.max(
                            10,
                            Math.min(200, Number(e.target.value)),
                          ),
                        })
                      }
                    />
                  </label>
                )}
                <button
                  onClick={() =>
                    patchSlide({
                      objects: [
                        ...slide.objects.filter((o) => o.id !== element.id),
                        element,
                      ],
                    })
                  }
                >
                  Bring to front
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    patchSlide({
                      objects: slide.objects.filter((o) => o.id !== element.id),
                    });
                    setSelected(null);
                  }}
                >
                  Delete object
                </button>
              </>
            ) : (
              <>
                <label>
                  Lesson / slide title
                  <input
                    value={slide.title}
                    maxLength={200}
                    onChange={(e) => patchSlide({ title: e.target.value })}
                  />
                </label>
                <label>
                  Background
                  <input
                    type="color"
                    value={slide.background}
                    onChange={(e) => patchSlide({ background: e.target.value })}
                  />
                </label>
                <p className="help">
                  Select an object to edit its properties. Drag to move; use the
                  handles to resize or rotate. Arrow keys move a selected object
                  when the canvas has focus.
                </p>
                <button
                  disabled={doc.slides.length === 1}
                  className="danger"
                  onClick={() => {
                    if (!confirm("Remove this slide?")) return;
                    edit({
                      ...doc,
                      slides: doc.slides.filter((_, i) => i !== slideIndex),
                    });
                    setSlideIndex(Math.max(0, slideIndex - 1));
                    setSelected(null);
                  }}
                >
                  Remove slide
                </button>
              </>
            )}
          </div>
        </div>
        <div className="studio-bottom">
          <div>
            <span className="pill">✦ AI ASSISTANT</span>
            <p className="help">
              Generate a draft outline, then review it before adding slides.
            </p>
          </div>
          <button
            onClick={() => {
              aiDialog.current?.showModal();
              fetch("/api/generate?courseId=" + initial.id)
                .then((r) => r.json())
                .then((d) => {
                  if (Array.isArray(d)) setAttempts(d);
                })
                .catch(() => {});
            }}
          >
            Explore AI drafting →
          </button>
        </div>
        <p className="help">
          This foundation supports private courses, slide editing, images,
          autosave, version history, and editable PowerPoint export. PDF,
          narration, video, assessments, and LMS delivery are later milestones.
          JSON draft downloads reference images stored in your account.
        </p>
      </div>
      <dialog ref={versionDialog} className="dialog-wide">
        <div className="eyebrow">YOUR WORK, PRESERVED</div>
        <h2>Presentation history</h2>
        <p className="muted">
          Restoring a version creates a new revision. Your existing history
          stays intact.
        </p>
        <div className="version-list">
          {versions.map((v) => (
            <div className="version-row" key={v.revision}>
              <span>
                Version {v.revision}
                <br />
                <small>{new Date(v.created_at).toLocaleString()}</small>
              </span>
              <button
                disabled={saving || dirty}
                onClick={() => {
                  edit(structuredClone(v.document));
                  setSlideIndex(0);
                  setSelected(null);
                  versionDialog.current?.close();
                  setNotice(
                    "Previous version restored as a draft. Autosave will create a new revision.",
                  );
                }}
              >
                Restore
              </button>
            </div>
          ))}
        </div>
        {dirty && (
          <p className="help">
            Wait for your current edits to save before restoring.
          </p>
        )}
        <div className="actions">
          <button onClick={() => versionDialog.current?.close()}>Close</button>
        </div>
      </dialog>
      <dialog ref={aiDialog} className="dialog-wide">
        <div className="eyebrow">A STARTING POINT, NOT A FINAL WORD</div>
        <h2>Draft with AI</h2>
        <p className="muted">
          {provider.available
            ? `Gemini model: ${provider.model}. Review every generated claim before use.`
            : "No provider is enabled. Add GEMINI_API_KEY, AI_MODEL, and AI_ENABLED in secure environment settings. Nothing will be generated or charged here until configured."}
        </p>
        {provider.available && (
          <>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                style={{ width: "auto" }}
                type="checkbox"
                checked={approved}
                onChange={(e) => setApproved(e.target.checked)}
              />{" "}
              I approve one provider request. Charges may apply.
            </label>
            <button
              disabled={!approved || generating}
              onClick={async () => {
                setGenerating(true);
                setError("");
                try {
                  const r = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      courseId: initial.id,
                      idempotencyKey: crypto.randomUUID(),
                      approved: true,
                    }),
                  });
                  const data = await r.json();
                  if (!r.ok) throw Error(data.error);
                  setOutline(data.outline);
                } catch (e) {
                  setError((e as Error).message);
                  aiDialog.current?.close();
                } finally {
                  setGenerating(false);
                  setApproved(false);
                }
              }}
            >
              {generating ? "Drafting…" : "Generate a draft outline"}
            </button>
          </>
        )}
        {attempts.length > 0 && (
          <div className="version-list">
            <h3>Recent generation requests</h3>
            {attempts.map((a) => (
              <div className="version-row" key={a.id}>
                <span>
                  {a.status} · {a.model}
                </span>
                {a.result && (
                  <button onClick={() => setOutline(a.result)}>
                    Review result
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {outline && (
          <>
            <div className="ai-preview">
              {outline.slides.map((s, i) => (
                <section key={i}>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </section>
              ))}
            </div>
            <button
              className="primary"
              disabled={doc.slides.length + outline.slides.length > 50}
              onClick={() => {
                edit({
                  ...doc,
                  slides: [
                    ...doc.slides,
                    ...outline.slides.map((s) => ({
                      id: crypto.randomUUID(),
                      title: s.title,
                      background: "#ffffff",
                      objects: [
                        {
                          id: crypto.randomUUID(),
                          type: "text" as const,
                          x: 65,
                          y: 50,
                          width: 830,
                          height: 100,
                          rotation: 0,
                          text: s.title,
                          fill: "#28263b",
                          fontSize: 42,
                        },
                        {
                          id: crypto.randomUUID(),
                          type: "text" as const,
                          x: 65,
                          y: 175,
                          width: 830,
                          height: 315,
                          rotation: 0,
                          text: s.body,
                          fill: "#625c73",
                          fontSize: 24,
                        },
                      ],
                    })),
                  ],
                });
                setOutline(null);
                aiDialog.current?.close();
                setNotice(
                  "Reviewed outline added as editable slides. Check text overflow and content accuracy.",
                );
              }}
            >
              I reviewed this draft · Add slides
            </button>
          </>
        )}
        <div className="actions">
          <button onClick={() => aiDialog.current?.close()}>Close</button>
        </div>
      </dialog>
      <dialog ref={imageDialog}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setUploading(true);
            const form = e.currentTarget;
            const fields = new FormData(form);
            const file = fields.get("file") as File;
            try {
              if (!file || file.size > 1_000_000)
                throw Error("Choose a PNG or JPEG smaller than 1 MB.");
              const data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () =>
                  resolve(String(reader.result).split(",")[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
              const r = await fetch("/api/assets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  data,
                  source: fields.get("source"),
                  license: fields.get("license"),
                }),
              });
              const result = await r.json();
              if (!r.ok) throw Error(result.error);
              add("shape", result.id);
              imageDialog.current?.close();
              form.reset();
            } catch (e) {
              setError((e as Error).message);
              imageDialog.current?.close();
            } finally {
              setUploading(false);
            }
          }}
        >
          <div className="eyebrow">ADD SOME PERSPECTIVE</div>
          <h2>Add an image</h2>
          <label>
            Image · PNG or JPEG, up to 1 MB
            <input
              type="file"
              name="file"
              accept="image/png,image/jpeg"
              required
            />
          </label>
          <label>
            Source / creator
            <input
              name="source"
              required
              maxLength={500}
              placeholder="My own illustration"
            />
          </label>
          <label>
            License / permission
            <input
              name="license"
              required
              maxLength={200}
              placeholder="Original work, owned by me"
            />
          </label>
          <p className="help">
            Only upload images you have permission to use. Source and license
            are saved with the asset.
          </p>
          <div className="actions">
            <button type="button" onClick={() => imageDialog.current?.close()}>
              Cancel
            </button>
            <button disabled={uploading} className="primary">
              {uploading ? "Uploading…" : "Add image"}
            </button>
          </div>
        </form>
      </dialog>
    </Shell>
  );
}

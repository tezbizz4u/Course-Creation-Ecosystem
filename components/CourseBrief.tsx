"use client";
import { useEffect, useRef, useState } from "react";
import {
  briefQuestions,
  newCourseBrief,
  productionOutline,
  type CourseBrief as Brief,
} from "@/lib/course-brief-contract";
export default function CourseBrief({ courseId }: { courseId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [brief, setBrief] = useState<Brief>(newCourseBrief),
    [revision, setRevision] = useState(0),
    [step, setStep] = useState(0),
    [answer, setAnswer] = useState(""),
    [loading, setLoading] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [view, setView] = useState<"questions" | "summary">("questions");
  const [unsaved, setUnsaved] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/courses/" + courseId + "/brief");
      const data = await r.json();
      if (!r.ok) throw Error(data.error);
      setBrief(data.brief);
      setRevision(data.revision);
      setStep(0);
      setAnswer(data.brief.vision);
      setUnsaved(false);
      setView(data.revision ? "summary" : "questions");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  async function open() {
    dialog.current?.showModal();
    await load();
  }
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("brief") === "1") {
      void open();
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [courseId]);
  const question = briefQuestions[step];
  const close = () => {
    if (
      unsaved &&
      !confirm(
        "Close without saving the current answer? Previously saved answers will remain.",
      )
    )
      return;
    dialog.current?.close();
  };
  return (
    <>
      <button onClick={open}>Course brief</button>
      <dialog
        className="brief-dialog"
        ref={dialog}
        onCancel={(e) => {
          if (unsaved) {
            e.preventDefault();
            close();
          }
        }}
      >
        <div className="brief-top">
          <div>
            <div className="eyebrow">TELL US WHAT YOU WANT TO CREATE</div>
            <h2>Your course, in your words.</h2>
          </div>
          <button onClick={close} aria-label="Close course brief">
            Close ×
          </button>
        </div>
        <div className="brief-defaults">
          <span>Indian AYUSH practitioners</span>
          <span>Indian English</span>
          <span>Editable presentations first</span>
        </div>
        {error && (
          <div className="notice error" role="alert">
            {error}{" "}
            <button
              disabled={loading || saving}
              onClick={() => {
                if (
                  !unsaved ||
                  confirm("Reload and discard the current unsaved answer?")
                )
                  void load();
              }}
            >
              Reload saved brief
            </button>
          </div>
        )}
        {loading ? (
          <p>Opening your course brief…</p>
        ) : view === "questions" ? (
          <>
            <div className="brief-conversation">
              {briefQuestions.slice(0, step).map((q) => (
                <div key={q.key}>
                  <p className="brief-question">{q.question}</p>
                  <p className="brief-answer">
                    {brief[q.key] || "No additional requirements provided."}
                  </p>
                </div>
              ))}
              <p className="brief-question">{question.question}</p>
              <p className="help">{question.hint}</p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                setError("");
                const next = { ...brief, [question.key]: answer.trim() };
                try {
                  const r = await fetch("/api/courses/" + courseId + "/brief", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      expectedRevision: revision,
                      brief: next,
                    }),
                  });
                  const data = await r.json();
                  if (!r.ok) throw Error(data.error);
                  setBrief(data.brief);
                  setRevision(data.revision);
                  setUnsaved(false);
                  if (step < briefQuestions.length - 1) {
                    const nextStep = step + 1;
                    setStep(nextStep);
                    setAnswer(data.brief[briefQuestions[nextStep].key]);
                  } else setView("summary");
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setSaving(false);
                }
              }}
            >
              <label htmlFor="brief-answer">Your answer</label>
              <textarea
                id="brief-answer"
                  disabled={saving || loading}
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setUnsaved(true);
                }}
                required={step < 2}
                maxLength={
                  question.key === "sourceNotes"
                    ? 24000
                    : question.key === "vision"
                      ? 20000
                      : question.key === "objectives"
                        ? 12000
                        : question.key === "design"
                          ? 12000
                          : 10000
                }
                placeholder="Describe your requirements freely…"
              />
              <div className="actions">
                <span className="help">
                  Question {step + 1} of {briefQuestions.length} ·{" "}
                  {revision ? "Saved answers: v" + revision : "Not saved yet"}
                </span>
                {step > 0 && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      if (
                        unsaved &&
                        !confirm("Discard the current unsaved answer?")
                      )
                        return;
                      const previous = step - 1;
                      setStep(previous);
                      setAnswer(brief[briefQuestions[previous].key]);
                      setUnsaved(false);
                    }}
                  >
                    Back
                  </button>
                )}
                <button className="primary" disabled={saving}>
                  {saving
                    ? "Saving…"
                    : step === briefQuestions.length - 1
                      ? "Save brief"
                      : "Save and continue"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="notice" role="status">
              Brief saved · v{revision}. This captures your requirements;
              research and automatic course production have not run.
            </div>
            <div className="brief-summary">
              {briefQuestions.map((q, i) => (
                <section key={q.key}>
                  <div>
                    <h3>{q.question}</h3>
                    <button
                      onClick={() => {
                        setStep(i);
                        setAnswer(brief[q.key]);
                        setView("questions");
                        setUnsaved(false);
                      }}
                    >
                      Edit answer
                    </button>
                  </div>
                  <p>
                    {brief[q.key] || "No additional requirements provided."}
                  </p>
                </section>
              ))}
            </div>
            <h3>Production outline</h3>
            <div className="brief-plan">
              {productionOutline(brief).map((item) => (
                <div key={item.id}>
                  <span
                    className={
                      "pill " + (item.status === "captured" ? "" : "pending")
                    }
                  >
                    {item.status === "captured"
                      ? "Captured"
                      : item.status === "needs_input"
                        ? "Needs input"
                        : "Not started"}
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="help">
              This guided intake works without an AI provider. It does not claim
              to have researched sources, generated content, or completed the
              production outline. No paid request is made.
            </p>
            <div className="actions">
              <button className="primary" onClick={close}>
                Return to presentation
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}

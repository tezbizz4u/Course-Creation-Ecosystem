"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Shell from "./Shell";
type Course = {
  id: string;
  title: string;
  audience: string;
  project_title: string;
  slide_count: number;
  revision: number;
};
export default function Library({ email }: { email: string }) {
  const [courses, setCourses] = useState<Course[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    fetch("/api/courses")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        setCourses(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <Shell email={email}>
      <section className="heading">
        <div>
          <div className="eyebrow">CREATE SOMETHING WORTH LEARNING</div>
          <h1>
            Your next great course
            <br />
            starts here.
          </h1>
          <p>Turn your expertise into a learning experience.</p>
        </div>
        <button className="primary" onClick={() => dialog.current?.showModal()}>
          + Create a course
        </button>
      </section>
      <div className="banner">
        <div className="banner-icon">✦</div>
        <div>
          <h3>A space for every part of your process.</h3>
          <p>
            Plan your course, shape your slides, and make your ideas tangible.
          </p>
        </div>
        <span className="tag">YOUR CREATIVE STUDIO</span>
      </div>
      <div className="section-title">
        <h2>
          Course library <span>{courses.length}</span>
        </h2>
        <span>Private to your account</span>
      </div>
      <p className="error" role="alert">
        {error}
      </p>
      <div className="cards">
        {loading ? (
          <div className="empty">Opening your library…</div>
        ) : courses.length ? (
          courses.map((c, i) => (
            <Link className="card" key={c.id} href={"/studio/" + c.id}>
              <div className={"cover cover-" + (i % 3)}>
                <span className="cover-lines" />
                <span>{c.title.charAt(0).toUpperCase()}</span>
                <small>✦</small>
              </div>
              <div className="card-info">
                <small>{c.project_title.toUpperCase()}</small>
                <h3>{c.title}</h3>
                <p>{c.audience || "A new learning experience"}</p>
                <div className="card-meta">
                  <span>
                    {c.slide_count} {c.slide_count === 1 ? "slide" : "slides"}
                  </span>
                  <span>Open studio ↗</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="empty">
            <span className="empty-icon">▤</span>
            <h3>A blank canvas. A world of possibility.</h3>
            <p>
              Create your first course and give your ideas somewhere to grow.
            </p>
            <button onClick={() => dialog.current?.showModal()}>
              Create your first course →
            </button>
          </div>
        )}
      </div>
      <div className="capabilities">
        {[
          [
            "01",
            "Shape the story",
            "Build a clear structure, one slide at a time.",
          ],
          [
            "02",
            "Bring it to life",
            "Design with editable text, shapes, and images.",
          ],
          [
            "03",
            "Make it yours",
            "Keep every revision and explore new directions.",
          ],
        ].map(([n, title, text]) => (
          <div key={n}>
            <span>{n}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
      <dialog ref={dialog}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const data = Object.fromEntries(new FormData(e.currentTarget));
            try {
              const r = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              const result = await r.json();
              if (!r.ok) throw Error(result.error);
              window.location.href = "/studio/" + result.id;
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="eyebrow">A NEW BEGINNING</div>
          <h2>What will you teach?</h2>
          <label>
            Course title
            <input
              name="title"
              required
              maxLength={200}
              placeholder="The art of clear communication"
            />
          </label>
          <label>
            Project
            <input
              name="projectTitle"
              required
              maxLength={200}
              defaultValue="My learning projects"
            />
          </label>
          <label>
            Who is it for?
            <input
              name="audience"
              maxLength={500}
              placeholder="First-time team leaders"
            />
          </label>
          <p className="muted">
            Start with an editable title slide. No AI calls are made.
          </p>
          <p className="error" role="alert">
            {error}
          </p>
          <div className="actions">
            <button type="button" onClick={() => dialog.current?.close()}>
              Cancel
            </button>
            <button disabled={busy} className="primary">
              {busy ? "Creating…" : "Create course →"}
            </button>
          </div>
        </form>
      </dialog>
    </Shell>
  );
}

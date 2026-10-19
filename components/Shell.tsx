"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
export default function Shell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  return (
    <>
      <aside>
        <Link className="brand" href="/">
          <span className="brand-mark">f</span>forma
        </Link>
        <div className="workspace">YOUR WORKSPACE</div>
        <Link href="/" className="nav active">
          ▦ &nbsp; Course library
        </Link>
        <div className="aside-note">
          <span>✦</span>
          <h4>Make room for good ideas.</h4>
          <p>
            A little structure.
            <br />A world of possibility.
          </p>
        </div>
        <div className="aside-bottom">
          <span className="dot" /> Studio foundation<small>{email}</small>
          <button
            className="text-button"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out ↗
          </button>
        </div>
      </aside>
      <main>
        <header>
          <span>
            Workspace <b>/ Course studio</b>
          </span>
          <div className="header-right">
            <span>YOUR CREATIVE SPACE</span>
            <span className="avatar">{email.slice(0, 2).toUpperCase()}</span>
          </div>
        </header>
        {children}
        <footer>
          FORMA COURSE STUDIO<span>Made for the way you create.</span>
        </footer>
      </main>
    </>
  );
}

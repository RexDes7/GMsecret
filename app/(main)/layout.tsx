import * as React from "react";
import { ContentModal } from "@/components/content/content-modal";

/**
 * Layout for the main, non-auth section of the app. Mounts the global
 * `ContentModal` once so any page under (main) can open a content preview
 * via `?content=<id>` without doing a full route navigation. The modal is
 * a client component that reads the query param via `useSearchParams`,
 * which Next.js requires us to wrap in `<Suspense>`.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <React.Suspense fallback={null}>
        <ContentModal />
      </React.Suspense>
    </>
  );
}

export default function RequiredMaterialsPage() {
  return (
    <main className="min-h-svh bg-zinc-950 px-5 py-10 text-zinc-100 sm:py-16">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold sm:text-4xl">Required Materials</h1>
        </header>

        <section className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 sm:p-6">
          <div className="space-y-4 text-zinc-400">
            <p>
              Students only need a laptop running{" "}
              <span className="font-medium text-zinc-100">Windows</span>,{" "}
              <span className="font-medium text-zinc-100">Linux</span>,{" "}
              <span className="font-medium text-zinc-100">Mac OS</span>, or{" "}
              <span className="font-medium text-zinc-100">Chrome OS</span>.
            </p>
            <p>All other materials and electronics will be provided for students.</p>
            <p>
              There is a <span className="font-medium text-zinc-100">$50 class fee</span>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

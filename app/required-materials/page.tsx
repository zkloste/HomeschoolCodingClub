export default function RequiredMaterialsPage() {
  return (
    <main className="min-h-svh bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-5 py-10 text-slate-100 sm:py-16">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold sm:text-4xl">Required Materials</h1>
        </header>

        <section className="rounded-xl border border-indigo-300/20 bg-slate-900/60 p-4 sm:p-6">
          <div className="space-y-4 text-slate-300">
            <p>
              Students only need a laptop running{" "}
              <span className="font-medium text-white">Windows</span>,{" "}
              <span className="font-medium text-white">Linux</span>,{" "}
              <span className="font-medium text-white">Mac OS</span>, or{" "}
              <span className="font-medium text-white">Chrome OS</span>.
            </p>
            <p>All other materials and electronics will be provided for students.</p>
            <p>
              There is a <span className="font-medium text-white">$50 class fee</span>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-svh bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-5 py-8 sm:py-10">
        <div className="flex-1">{children}</div>
      </div>
    </main>
  );
}

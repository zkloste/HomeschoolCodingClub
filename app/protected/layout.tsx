export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-svh bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-5 py-8 sm:py-10">
        <div className="flex-1">{children}</div>
      </div>
    </main>
  );
}

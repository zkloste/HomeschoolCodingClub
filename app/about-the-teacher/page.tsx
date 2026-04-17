import Image from "next/image";
import famPic from "../../fam pic.jpg";

export default function AboutTeacherPage() {
  return (
    <main className="min-h-svh bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-5 py-10 text-slate-100 sm:py-16">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold sm:text-4xl">About Me</h1>
        </header>

        <section className="rounded-xl border border-indigo-300/20 bg-slate-900/60 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">A Little About Me</h2>
          <p className="mt-2 text-slate-200">
            <span className="font-medium text-white">Name:</span> Zach Klosterman
          </p>

          <div className="mt-5 grid gap-6 md:grid-cols-[320px_1fr] md:items-start">
            <div className="overflow-hidden rounded-lg border border-slate-700/70">
              <Image src={famPic} alt="Zach Klosterman with family" className="h-auto w-full object-cover" priority />
            </div>

            <div className="space-y-3 text-slate-300">
              <p>I am a professional software developer with three years of experience.</p>
              <p>I work primarily in web development.</p>
              <p>I earned my computer science education from the University of Toledo.</p>
              <p>I currently live in Scottsville, Kentucky.</p>
              <p>I am Catholic.</p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

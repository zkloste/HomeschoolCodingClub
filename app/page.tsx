"use client";

import { useEffect, useMemo, useState } from "react";

type WeekTag =
  | "Foundation"
  | "Core Skills"
  | "Level Up"
  | "Project"
  | "GitHub"
  | "Spotlight"
  | "Finale";

type PathTrack = "Beginner" | "Advanced";

type WeekFork = {
  goal: string;
  activities: string[];
  materials: string;
};

type WeekItem = {
  week: number;
  title: string;
  emoji: string;
  tag: WeekTag;
  summary: string;
  csFocus: string;
  activities: string[];
  materials: string;
  forks: Record<PathTrack, WeekFork>;
};

const TAGS: WeekTag[] = [
  "Foundation",
  "Core Skills",
  "Level Up",
  "Project",
  "GitHub",
  "Spotlight",
  "Finale",
];

const ABSTRACTION_LAYERS = [
  {
    label: "Layer 5",
    name: "Logic + Algorithms",
    icon: "🧠",
    color: "from-violet-500/30 to-fuchsia-500/20 border-violet-400/50",
    detail: "This is the problem-solving layer: goals, rules, and algorithmic strategy are defined before implementation details.",
  },
  {
    label: "Layer 4",
    name: "AI",
    icon: "🤖",
    color: "from-cyan-500/30 to-sky-500/20 border-cyan-400/50",
    detail: "AI sits between pure logic and typed code, translating intent into draft implementations, alternatives, and refactors.",
  },
  {
    label: "Layer 3",
    name: "High-Level Language",
    icon: "💻",
    color: "from-indigo-500/30 to-blue-500/20 border-indigo-400/50",
    detail: "Human-readable languages (like Python and JavaScript) express logic in a structured form that machines can compile or interpret.",
  },
  {
    label: "Layer 2",
    name: "Assembly + Machine Code",
    icon: "⚙️",
    color: "from-amber-500/30 to-orange-500/20 border-amber-400/50",
    detail: "High-level instructions are lowered into processor-specific operations that directly control execution flow and memory behavior.",
  },
  {
    label: "Layer 1",
    name: "Binary + Hardware",
    icon: "🔌",
    color: "from-emerald-500/30 to-teal-500/20 border-emerald-400/50",
    detail: "At the foundation, electrical states and digital signals are what hardware actually executes and responds to.",
  },
];

const AI_PHASES = [
  {
    title: "Phase 1 - Think it",
    icon: "📝",
    color: "from-rose-500/30 to-orange-500/20 border-rose-400/50",
    detail: "Students plan with notes, diagrams, and pseudocode before touching AI tools.",
  },
  {
    title: "Phase 2 - Write it yourself",
    icon: "⌨️",
    color: "from-blue-500/30 to-indigo-500/20 border-blue-400/50",
    detail: "Students code the first working version independently to build confidence and ownership.",
  },
  {
    title: "Phase 3 - AI improves it",
    icon: "✨",
    color: "from-violet-500/30 to-purple-500/20 border-violet-400/50",
    detail: "AI helps optimize, clean up, and extend student-authored code once fundamentals are in place.",
  },
];

const GRADE_BAND_EMPHASIS = [
  { title: "Grades 7-8", detail: "Mostly Phases 1-2" },
  { title: "Grades 9-10", detail: "Build first, AI refactor second" },
  { title: "Grades 11-12", detail: "AI assist + independent debugging" },
];

const AI_PRACTICES = [
  "Pseudocode first",
  "Rewrite lines you cannot explain",
  "Regular AI-off builds",
];

const WEEKS: WeekItem[] = [
  { week: 1, title: "Electricity Basics", emoji: "⚡", tag: "Foundation", summary: "Learn voltage, current, and resistance through hands-on LED circuits.", csFocus: "Binary and boolean logic", activities: ["Build starter LED circuit", "Measure values with a multimeter"], materials: "Battery, breadboard, LEDs, resistors, multimeter", forks: { Beginner: { goal: "Build a single LED circuit and explain current direction.", activities: ["Assemble one stable LED circuit", "Change resistor values and record brightness"], materials: "Single LED, resistors, breadboard, battery" }, Advanced: { goal: "Build a two-LED circuit and calculate safe resistor values.", activities: ["Wire series vs parallel LEDs", "Estimate and verify current with multimeter"], materials: "Multiple LEDs, resistor assortment, multimeter" } } },
  { week: 2, title: "Meet the Pico + CircuitPython", emoji: "🔌", tag: "Foundation", summary: "Set up CircuitPython on Raspberry Pi Pico and run first Python scripts.", csFocus: "Program flow and Python runtime loop", activities: ["Board tour", "Customize a blink script in Python"], materials: "Raspberry Pi Pico, USB cable, laptop", forks: { Beginner: { goal: "Run and modify a working blink script in CircuitPython.", activities: ["Install CircuitPython and open code.py", "Change blink rate and LED pattern"], materials: "Pico, USB cable, laptop with editor" }, Advanced: { goal: "Create a non-blocking multi-pattern blinker using Python functions.", activities: ["Refactor blink logic into reusable functions", "Add pattern switching with elapsed time checks"], materials: "Pico, external LEDs, editor" } } },
  { week: 3, title: "Digital Output & LEDs", emoji: "💡", tag: "Core Skills", summary: "Control multiple LEDs and timing patterns with CircuitPython.", csFocus: "Variables and data types in Python", activities: ["Traffic light build", "Timing challenge"], materials: "Raspberry Pi Pico, LEDs, resistors, breadboard", forks: { Beginner: { goal: "Build a 3-state traffic light sequence.", activities: ["Wire 3 LEDs safely", "Use variables for pin numbers and delay values"], materials: "Pico, 3 LEDs, breadboard, resistors" }, Advanced: { goal: "Create pattern presets and switch between them in code.", activities: ["Store pattern timings in lists", "Implement at least two traffic modes"], materials: "Pico, 3-5 LEDs, resistors" } } },
  { week: 4, title: "Digital Input & Conditionals", emoji: "🔘", tag: "Core Skills", summary: "Read buttons and make decisions from input in Python.", csFocus: "if / else logic", activities: ["Button-controlled LEDs", "Flowchart-before-code practice"], materials: "Raspberry Pi Pico, buttons, LEDs, resistors", forks: { Beginner: { goal: "Use one button to control an LED state reliably.", activities: ["Read button input with pull-up/down", "Write if/else logic for on/off control"], materials: "Pico, button, LED, resistors" }, Advanced: { goal: "Build a two-button controller with mode switching.", activities: ["Add debouncing approach in code", "Use conditionals to manage multiple modes"], materials: "Pico, 2 buttons, LEDs" } } },
  { week: 5, title: "Loops & Iteration", emoji: "🔁", tag: "Core Skills", summary: "Replace repetitive code with loops for scalable behavior.", csFocus: "for and while loops in Python", activities: ["LED chaser", "Reaction timer"], materials: "Raspberry Pi Pico, multi-LED setup, button", forks: { Beginner: { goal: "Build an LED chaser using a simple for-loop.", activities: ["Loop through LED pins in sequence", "Tune delay for visible effect"], materials: "Pico, 4 LEDs, resistors" }, Advanced: { goal: "Create a reaction timer mini-game with score tracking.", activities: ["Use while loop game cycle", "Record and compare response times"], materials: "Pico, button, LEDs, optional buzzer" } } },
  { week: 6, title: "Functions & Reuse", emoji: "🧩", tag: "Core Skills", summary: "Refactor repeated logic into reusable Python functions.", csFocus: "Functions and abstraction", activities: ["Create helper functions", "Refactor prior projects"], materials: "Pico kit, sensors, LEDs", forks: { Beginner: { goal: "Refactor one prior project into clear helper functions.", activities: ["Create 2-3 small functions with parameters", "Use function names that describe intent"], materials: "Pico, prior week components" }, Advanced: { goal: "Create a mini utility module shared by two scripts.", activities: ["Build reusable function set for I/O", "Import and reuse module in second script"], materials: "Pico, prior week components, editor" } } },
  { week: 7, title: "Arrays + Data Patterns", emoji: "⚙️", tag: "Core Skills", summary: "Use Python arrays (lists) to store, transform, and drive repeated hardware behaviors.", csFocus: "Indexed data structures and list operations", activities: ["List-driven LED patterns", "Array transformation challenge"], materials: "Raspberry Pi Pico, LEDs, buzzer, servo or potentiometer", forks: { Beginner: { goal: "Build a project where list values directly control visible hardware output.", activities: ["Create arrays for LED pins and delay values", "Use loops + indexes to play a repeatable LED or buzzer pattern", "Modify one array to quickly change behavior without rewriting logic"], materials: "Pico, LEDs or buzzer, resistors, breadboard" }, Advanced: { goal: "Design a reusable array-based pattern engine with multiple modes.", activities: ["Store multiple patterns in nested lists (or list + dictionary structure)", "Implement mode switching between at least 2 patterns using button input", "Add one array-processing exercise such as reverse, slice, rotate, or scale timing values"], materials: "Pico, LEDs and/or buzzer, button, resistor pack, optional servo" } } },
  { week: 8, title: "Git & GitHub Basics", emoji: "🐙", tag: "GitHub", summary: "Start version control and publish a first repository.", csFocus: "Commits, push, history", activities: ["Initialize repo", "Write first README"], materials: "Laptop, GitHub account, Git", forks: { Beginner: { goal: "Push one completed Pico project with a clear README.", activities: ["Initialize repo and commit project files", "Write setup steps in README"], materials: "Laptop, Git, GitHub account" }, Advanced: { goal: "Publish a polished repo with commit history and issue tracking.", activities: ["Use meaningful multi-commit history", "Create and close a starter issue"], materials: "Laptop, Git, GitHub, markdown template" } } },
  { week: 9, title: "Domain Spotlight + Mini Project", emoji: "🌟", tag: "Spotlight", summary: "Work in teams to build a focused starter project with practical hardware options.", csFocus: "Transferable CS skills and team planning", activities: ["Form 5 groups of 3 students", "Choose starter project and build milestone demo"], materials: "Pico, mini RC car, motion glove, and classroom sensor kits", forks: { Beginner: { goal: "In groups of 3, complete a reliable starter project demo by end of class.", activities: ["Split class into 5 groups of 3 and assign roles: wiring lead, coder, tester/documenter", "Choose one beginner project: humidity sensor turns on fan, motion sensor turns on light/alarm, temperature warning LED, soil moisture plant alert, or distance sensor parking helper", "Build one working trigger-action system and pass a 3-run reliability check"], materials: "Pico, one sensor kit per group, fan/LED/buzzer output, jumper wires, USB cable" }, Advanced: { goal: "In groups of 3, complete a starter project plus one meaningful extension.", activities: ["Choose one advanced project: RC car with obstacle stop sensor, motion glove gesture-controlled RC car direction, humidity-and-temperature smart fan logic, or two-sensor safety monitor", "Finish MVP first, then add one extension such as threshold tuning, second mode, or data logging", "Prepare a short group demo with project idea, sensor logic, and test results"], materials: "Pico, RC car or motion glove or two-sensor kit, output devices, battery pack, GitHub repo" } } },
  { week: 10, title: "Pico W Network Setup + Diagnostics", emoji: "📡", tag: "Level Up", summary: "Prepare a stable networked foundation and team workflow before building browser controls.", csFocus: "Network troubleshooting, request flow, and PR workflow", activities: ["Connect Pico W and verify stable WiFi reconnect behavior", "Test simple HTTP request/response and open first team PR"], materials: "Raspberry Pi Pico W, laptop, WiFi credentials, shared repo", forks: { Beginner: { goal: "Build a reliable Pico W network baseline and submit a documented setup PR.", activities: ["Run connect/reconnect script and confirm consistent connection", "Log IP/status and complete a short troubleshooting checklist", "Push setup code and notes in a first team PR"], materials: "Pico W, WiFi credentials, shared repo, troubleshooting checklist" }, Advanced: { goal: "Create a reusable network helper with diagnostics for team projects.", activities: ["Wrap connect/retry/status logic into helper functions", "Add simple latency or retry counters for debug visibility", "Review teammate setup PR and suggest one reliability improvement"], materials: "Pico W, shared repo, PR template, serial monitor logs" } } },
  { week: 11, title: "Web Toggle Control (LED)", emoji: "🌐", tag: "Level Up", summary: "Use a simple web page on a computer to toggle a Pico-connected LED on and off.", csFocus: "Client-server requests and state management", activities: ["Build a page with one Toggle LED button", "Send request to Pico W and reflect LED state"], materials: "Raspberry Pi Pico W, LED, resistor, WiFi, browser", forks: { Beginner: { goal: "Create a working one-button web page that toggles an LED each click.", activities: ["Host a minimal page with a Toggle LED button", "Handle endpoint request to flip LED state on the Pico", "Show current state as ON/OFF text after each click"], materials: "Pico W, single LED, resistor, WiFi, browser" }, Advanced: { goal: "Extend LED web control with richer UI and safer control logic.", activities: ["Add explicit ON and OFF buttons plus a status endpoint", "Add a second output mode (blink or brightness preset) from the page", "Prevent rapid repeat clicks with simple debounce/rate-limit logic"], materials: "Pico W, 1-2 LEDs, resistor pack, WiFi, browser, optional buzzer" } } },
  { week: 12, title: "Sensor Data Logging (Time Series)", emoji: "📊", tag: "Level Up", summary: "Capture and store time-series sensor data such as button state or humidity readings.", csFocus: "Time-series data modeling and JSON logging", activities: ["Sample sensor values at fixed intervals", "Save timestamped readings and review trends"], materials: "Raspberry Pi Pico W, button or humidity sensor, WiFi, browser/laptop", forks: { Beginner: { goal: "Log a simple time series (button state or humidity) and view it on the computer.", activities: ["Choose one data source: button 0/1 state or humidity percentage", "Record timestamp + value at a fixed interval (for example every 1-2 seconds)", "Store at least 30 samples and display the latest values in a simple page or serial table"], materials: "Pico W, button or DHT sensor, jumper wires, laptop/browser" }, Advanced: { goal: "Build a more robust sensor logger with history endpoints and basic analysis.", activities: ["Log one or two sensors as timestamped JSON records with a capped history buffer", "Create endpoint(s) to fetch recent data and compute min/max/average over a window", "Add one reliability feature such as missing-sensor fallback or reconnect-safe logging"], materials: "Pico W, DHT or multi-sensor kit, WiFi, browser, optional local JSON viewer" } } },
  { week: 13, title: "State Machines in Real Projects", emoji: "🔢", tag: "Level Up", summary: "Design real-world control systems using clear states, transitions, and sensor-driven behavior.", csFocus: "State-machine design with event-based transitions", activities: ["Map states and transitions before coding", "Build and test a sensor-driven state machine"], materials: "Raspberry Pi Pico, LEDs, buttons, and optional sensor kit", forks: { Beginner: { goal: "Build one practical state-machine project with 3-4 reliable states.", activities: ["Choose one project: smart traffic light with car-wait sensor, room occupancy light controller, or auto fan mode controller", "Draw a state diagram (for example: Green -> Yellow -> Red, with sensor-triggered timing changes)", "Implement transitions and verify each state using repeatable test cases"], materials: "Pico, LEDs, button or distance/motion sensor, resistors, breadboard" }, Advanced: { goal: "Build a richer state-machine system with priority rules and fail-safe behavior.", activities: ["Extend one project: traffic light with pedestrian override + emergency flash mode, occupancy system with idle/sleep states, or climate controller with manual override", "Implement guarded transitions (timeouts, thresholds, and priority events)", "Log current state and transition reason for debugging and demo review"], materials: "Pico, multi-LED setup, 1-2 sensors, button inputs, optional OLED/serial monitor" } } },
  { week: 14, title: "Capstone System Design + Team Split", emoji: "📝", tag: "Project", summary: "Break into flexible team sizes and design one shared system goal: gesture-controlled RC car plus robotic arm over WiFi.", csFocus: "Distributed system design, interfaces, and team contracts", activities: ["Define one shared mission and split into subsystem teams", "Write team interface contracts and WiFi message schema"], materials: "RC car + robotic arm, hand gesture sensor, Pico/Pico W boards, sensor kits, planning docs", forks: { Beginner: { goal: "Contribute the foundational subsystem plan and wiring baseline for the shared capstone system.", activities: ["Create teams by subsystem (for example: wiring/power, motor control, arm servo control, gesture input, integration/test)", "Define simple command interface (example: gesture command -> WiFi message -> car/arm action)", "Build and demo one subsystem proof-of-concept per team"], materials: "Pico/Pico W, RC car + arm kit, gesture sensor, breadboard power modules, team planning template" }, Advanced: { goal: "Own the harder architecture decisions so all beginner-built subsystems integrate reliably.", activities: ["Define packet/message format, command IDs, and acknowledgement behavior between teams", "Specify timing expectations and safe-state behavior if communication drops", "Run an integration simulation where each team validates against the shared interface contract"], materials: "Pico/Pico W, RC car + arm, gesture sensor, sensor kits, interface spec doc, shared repo board" } } },
  { week: 15, title: "Capstone Integration Sprint (Cross-Team)", emoji: "🔧", tag: "Project", summary: "Subsystem teams integrate their modules so gesture control, motor drive, and arm control work together wirelessly.", csFocus: "Cross-team integration, WiFi communication, and debugging workflows", activities: ["Integrate gesture-to-command pipeline over WiFi", "Run end-to-end tests across team boundaries"], materials: "Full project hardware stack, WiFi network, shared repos", forks: { Beginner: { goal: "Implement and validate the core control path that powers the shared capstone demo.", activities: ["Connect gesture team output to motor/arm team input using agreed command format", "Verify at least 3 core commands (for example: move, stop, arm open/close)", "Use a shared test checklist to debug handoff issues between teams"], materials: "Gesture sensor, Pico/Pico W, RC car + arm, debug checklist, serial logs" }, Advanced: { goal: "Harden the same shared control path with reliability, safety, and advanced command handling.", activities: ["Add command validation, timeout handling, and safe-stop behavior for failed WiFi links", "Implement richer command set (speed modes, arm presets, or queued actions)", "Track integration bugs by interface owner and close critical cross-team issues"], materials: "RC car + arm, gesture sensor, multi-sensor add-ons, WiFi diagnostics, issue tracker" } } },
  { week: 16, title: "Capstone Demo Day (Unified System)", emoji: "🏆", tag: "Finale", summary: "All teams jointly present one complete system where gesture input wirelessly controls the car and robotic arm.", csFocus: "System validation, technical communication, and team reflection", activities: ["Run live unified-system scenario tests", "Present team interfaces, integration lessons, and final outcomes"], materials: "Completed integrated build, demo course, slides/notes, GitHub repos", forks: { Beginner: { goal: "Show the shared capstone works end-to-end with clear, reliable baseline functionality.", activities: ["Run a scripted scenario: gesture command -> WiFi transfer -> car movement -> arm action", "Explain each team role and how interfaces enabled integration", "Publish final README with wiring map, command table, and setup steps"], materials: "Integrated RC car + arm + gesture system, demo checklist, final docs" }, Advanced: { goal: "Show the same shared capstone under harder conditions with polished engineering decisions.", activities: ["Run baseline demo plus stress test (packet loss, rapid commands, or failover case)", "Present protocol design decisions, performance observations, and safety trade-offs", "Publish next-iteration roadmap focused on scalability and reliability"], materials: "Integrated advanced build, metrics/log files, architecture slides, polished repo docs" } } },
];

const TAG_STYLES: Record<WeekTag, string> = {
  Foundation: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  "Core Skills": "bg-blue-500/15 text-blue-300 border-blue-500/40",
  "Level Up": "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  Project: "bg-violet-500/15 text-violet-300 border-violet-500/40",
  GitHub: "bg-purple-500/15 text-purple-300 border-purple-500/40",
  Spotlight: "bg-orange-500/15 text-orange-300 border-orange-500/40",
  Finale: "bg-red-500/15 text-red-300 border-red-500/40",
};

function getGitPhase(weekNumber: number) {
  if (weekNumber <= 7) return "No Git yet";
  if (weekNumber <= 9) return "Solo Git basics";
  if (weekNumber <= 15) return "Branches & PRs";
  return "Pro workflow";
}

export default function Home() {
  const [activeTag, setActiveTag] = useState<WeekTag | "All">("All");
  const [selectedWeek, setSelectedWeek] = useState<WeekItem>(WEEKS[0]);
  const [activePath, setActivePath] = useState<PathTrack>("Beginner");
  const [selectedLayer, setSelectedLayer] = useState(ABSTRACTION_LAYERS[0]);
  const [selectedPhase, setSelectedPhase] = useState(AI_PHASES[0]);

  const visibleWeeks = useMemo(
    () => WEEKS.filter((item) => activeTag === "All" || item.tag === activeTag),
    [activeTag],
  );

  useEffect(() => {
    if (!visibleWeeks.some((item) => item.week === selectedWeek.week)) {
      setSelectedWeek(visibleWeeks[0]);
    }
  }, [visibleWeeks, selectedWeek.week]);

  const weekCountLabel = activeTag === "All" ? "All 16 weeks" : `${visibleWeeks.length} weeks`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 lg:grid-cols-[1.35fr_1fr] lg:py-20">
        <div className="space-y-4">
          <p className="inline-block rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
            16 Weeks · Grades 7-12
          </p>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            A homeschool coding club where students learn to think and build cool things.
          </h2>
          <p className="max-w-2xl text-slate-200">
            We are based in Bowling Green, Kentucky, and we use different projects to learn how to build.
          </p>
          <p className="max-w-2xl text-slate-200">
            Because this is a club and not just a class, we can stay open-ended and explore ideas together. Our ultimate goal is to enable
            ourselves to build cool things together.
          </p>
          <p className="max-w-2xl text-slate-200">
            This club is an affiliate of{" "}
            <a
              href="https://www.theplacecoopbg.org/home"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-200 underline decoration-cyan-400/70 underline-offset-2 hover:text-cyan-100"
            >
              The Place Homeschool Co-op
            </a>
            .
          </p>
        </div>

        <aside className="rounded-xl border border-violet-300/30 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-violet-100">What Families Can Expect</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            <li>Students explain their decisions, not just copy code that works.</li>
            <li>Projects are portfolio-ready and tracked with GitHub history.</li>
            <li>Teams practice communication, ownership, and peer feedback.</li>
          </ul>
        </aside>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-14 lg:pb-16" aria-labelledby="ai-framework-heading">
        <div className="rounded-xl border border-blue-300/30 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-cyan-600/15 p-5">
          <h3 id="ai-framework-heading" className="text-2xl font-semibold">
            AI Learning Framework
          </h3>
          <p className="mt-2 max-w-4xl text-slate-300">
            We address AI directly: it is a critical part of our stack, but it is never a replacement for student thinking. Students plan first,
            build first, and then use AI to test ideas, improve structure, and speed iteration.
          </p>
          <p className="mt-2 max-w-4xl text-slate-300">
            The rule is clear in every grade band: if you cannot explain it, you do not ship it.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <article className="rounded-lg border border-indigo-300/30 bg-indigo-950/40 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-indigo-100">Abstraction Stack</h4>
              <ul className="mt-3 space-y-2 text-slate-200">
                {ABSTRACTION_LAYERS.map((layer) => (
                  <li key={layer.label}>
                    <button
                      type="button"
                      aria-pressed={selectedLayer.label === layer.label}
                      onClick={() => setSelectedLayer(layer)}
                      className={`w-full rounded-md border bg-gradient-to-r p-2 text-left transition ${
                        selectedLayer.label === layer.label
                          ? `${layer.color} ring-1 ring-white/30`
                          : "border-indigo-200/20 from-slate-800/70 to-slate-900/30 hover:border-indigo-200/40"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-wide text-slate-300">{layer.label}</p>
                      <p className="font-medium">
                        <span className="mr-2">{layer.icon}</span>
                        {layer.name}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 rounded-md border border-indigo-200/30 bg-slate-900/60 p-3 text-sm text-slate-200">
                <p className="font-semibold text-white">
                  {selectedLayer.icon} {selectedLayer.label}: {selectedLayer.name}
                </p>
                <p className="mt-1 text-slate-300">{selectedLayer.detail}</p>
              </div>
            </article>

            <article className="rounded-lg border border-cyan-300/30 bg-cyan-950/35 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-cyan-100">Three-Phase Workflow</h4>
              <ul className="mt-3 flex flex-col gap-2 text-slate-200 md:flex-row md:flex-wrap md:items-center">
                {AI_PHASES.map((phase, index) => (
                  <li key={phase.title} className="flex max-w-full items-center gap-2 md:gap-3">
                    <button
                      type="button"
                      aria-pressed={selectedPhase.title === phase.title}
                      onClick={() => setSelectedPhase(phase)}
                      className={`w-full rounded-md border bg-gradient-to-r p-3 text-center transition sm:w-auto md:min-w-44 ${
                        selectedPhase.title === phase.title
                          ? `${phase.color} ring-1 ring-white/30`
                          : "border-cyan-300/30 from-slate-800/70 to-slate-900/30 hover:border-cyan-200/60"
                      }`}
                    >
                      <p className="text-xl">{phase.icon}</p>
                      <p className="mt-1 text-sm font-medium">{phase.title}</p>
                    </button>
                    {index < AI_PHASES.length - 1 ? (
                      <div className="mx-1 text-lg text-slate-400">→</div>
                    ) : null}
                  </li>
                ))}
              </ul>
              <div className="mt-3 rounded-md border border-cyan-200/30 bg-slate-900/60 p-3 text-sm text-slate-200">
                <p className="font-semibold text-white">
                  {selectedPhase.icon} {selectedPhase.title}
                </p>
                <p className="mt-1 text-slate-300">{selectedPhase.detail}</p>
              </div>
            </article>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <article className="rounded-lg border border-emerald-300/25 bg-emerald-950/30 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-emerald-100">By Grade Band</h4>
              <ul className="mt-2 space-y-2 text-slate-200">
                {GRADE_BAND_EMPHASIS.map((band) => (
                  <li key={band.title} className="rounded-md border border-emerald-200/20 bg-slate-900/50 p-2">
                    <p className="text-sm font-medium">{band.title}</p>
                    <p className="text-xs text-slate-300">{band.detail}</p>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-lg border border-amber-300/25 bg-amber-950/30 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-100">Class Rules</h4>
              <ul className="mt-2 grid gap-2 text-slate-200">
                {AI_PRACTICES.map((practice) => (
                  <li key={practice} className="rounded-md border border-amber-200/20 bg-slate-900/50 px-3 py-2 text-sm">
                    {practice}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-14 lg:pb-16" aria-labelledby="curriculum-heading">
        <div className="rounded-xl border border-violet-300/20 bg-gradient-to-br from-violet-600/10 via-purple-600/10 to-fuchsia-600/10 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 id="curriculum-heading" className="text-2xl font-semibold">Curriculum by Week</h3>
            <p className="text-sm text-slate-300">{weekCountLabel}</p>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={activeTag === "All"}
              className={`rounded-full border px-3 py-1 text-sm ${activeTag === "All" ? "border-violet-300 bg-violet-500/25 text-violet-100" : "border-violet-200/30 text-slate-200 hover:bg-violet-500/15"}`}
              onClick={() => setActiveTag("All")}
            >
              All
            </button>
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                aria-pressed={activeTag === tag}
                className={`rounded-full border px-3 py-1 text-sm ${activeTag === tag ? "border-violet-300 bg-violet-500/25 text-violet-100" : "border-violet-200/30 text-slate-200 hover:bg-violet-500/15"}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="max-h-[34rem] overflow-auto rounded-xl border border-purple-200/20 bg-slate-900/55 p-3">
              <ul className="space-y-2">
                {visibleWeeks.map((item) => {
                  const isSelected = selectedWeek.week === item.week;
                  return (
                    <li key={item.week}>
                      <button
                        type="button"
                        aria-current={isSelected ? "true" : undefined}
                        aria-label={`Select Week ${item.week}: ${item.title}`}
                        onClick={() => setSelectedWeek(item)}
                        className={`w-full rounded-lg border p-3 text-left transition ${isSelected ? "border-fuchsia-300/60 bg-fuchsia-500/15" : "border-purple-200/20 bg-slate-900/70 hover:border-purple-200/40 hover:bg-purple-500/10"}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium">
                            Week {item.week}: {item.title}
                          </p>
                          <span className="text-lg">{item.emoji}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-300">{item.csFocus}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <article className="rounded-xl border border-fuchsia-200/25 bg-slate-900/55 p-5" aria-live="polite">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-purple-200/35 px-2 py-1 text-xs uppercase tracking-wide text-purple-100">
                  Week {selectedWeek.week}
                </span>
                <span className={`rounded-md border px-2 py-1 text-xs font-medium ${TAG_STYLES[selectedWeek.tag]}`}>{selectedWeek.tag}</span>
                <span className="rounded-md border border-pink-300/40 bg-pink-500/20 px-2 py-1 text-xs text-pink-100">
                  {getGitPhase(selectedWeek.week)}
                </span>
              </div>
              <h4 className="mt-3 text-2xl font-semibold">
                {selectedWeek.emoji} {selectedWeek.title}
              </h4>
              <p className="mt-2 text-slate-200">{selectedWeek.summary}</p>

              <div className="mt-4">
                <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-300">CS Focus</h5>
                <p className="mt-1 text-slate-200">{selectedWeek.csFocus}</p>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">Learning Path</p>
                <div className="mt-2 inline-flex rounded-full border border-fuchsia-200/30 p-1">
                  {(["Beginner", "Advanced"] as PathTrack[]).map((path) => (
                    <button
                      key={path}
                      type="button"
                      aria-pressed={activePath === path}
                      className={`rounded-full px-3 py-1 text-sm transition ${activePath === path ? "bg-fuchsia-500/25 text-fuchsia-100" : "text-slate-200 hover:bg-fuchsia-500/15"}`}
                      onClick={() => setActivePath(path)}
                    >
                      {path}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Project Goal</h5>
                <p className="mt-1 text-slate-200">{selectedWeek.forks[activePath].goal}</p>
              </div>

              <div className="mt-4">
                <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Path Activities</h5>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-200">
                  {selectedWeek.forks[activePath].activities.map((activity) => (
                    <li key={activity}>{activity}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Path Materials</h5>
                <p className="mt-1 text-slate-200">{selectedWeek.forks[activePath].materials}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20" aria-labelledby="capstone-kit-heading">
        <div className="rounded-xl border border-emerald-300/20 bg-gradient-to-br from-emerald-600/10 via-teal-600/10 to-cyan-600/10 p-5">
          <h3 id="capstone-kit-heading" className="mb-4 text-2xl font-semibold">Capstone Kit Preview</h3>
          <p className="max-w-3xl text-slate-200">
            Final project teams build one shared system with these kits: a robotic arm car platform and a motion-sensing glove controller.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-emerald-200/30 bg-emerald-950/30 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://m.media-amazon.com/images/I/71wfSsqaopL._AC_SL1500_.jpg"
                alt="Robotic arm car kit with mecanum wheels and mounted arm"
                className="h-56 w-full rounded-lg bg-slate-950/40 object-contain"
                loading="lazy"
              />
              <h4 className="mt-3 font-semibold text-emerald-100">Robotic Arm Car Platform</h4>
              <p className="mt-1 text-sm text-slate-300">Used for drive control, arm movement, and multi-team integration over WiFi.</p>
            </article>
            <article className="rounded-xl border border-cyan-200/30 bg-cyan-950/30 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://m.media-amazon.com/images/I/71I3Y+UhGRL._AC_SL1500_.jpg"
                alt="Wearable motion sensing glove kit for gesture control"
                className="h-56 w-full rounded-lg bg-slate-950/40 object-contain"
                loading="lazy"
              />
              <h4 className="mt-3 font-semibold text-cyan-100">Motion-Sensing Glove</h4>
              <p className="mt-1 text-sm text-slate-300">Used to generate gesture commands that are sent wirelessly to the car and arm teams.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

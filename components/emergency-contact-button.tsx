"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { useForm, ValidationError } from "@formspree/react";
import { LifeBuoy, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FORMSPREE_FORM_ID = "xwvaovyj";

export function EmergencyContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [state, handleSubmit] = useForm(FORMSPREE_FORM_ID);
  const modalTitleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 shadow-lg sm:bottom-6 sm:right-6"
        aria-label="Click here for help"
      >
        <LifeBuoy aria-hidden="true" />
        Click Here for Help
      </Button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-border bg-background p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id={modalTitleId} className="text-lg font-semibold">
                  Need Help?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hi, I am Zach, your teacher, and I built this website. If something is not
                  working, send me a quick note and I will get in contact with you shortly.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close emergency contact form"
              >
                <X aria-hidden="true" />
              </Button>
            </div>

            {state.succeeded ? (
              <p className="rounded-md border border-emerald-300/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                Thanks for reaching out. I got your message and will follow up shortly.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="emergency-name">Name (optional)</Label>
                  <Input id="emergency-name" type="text" name="name" autoComplete="name" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="emergency-email">Email</Label>
                  <Input
                    id="emergency-email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                  />
                  <ValidationError prefix="Email" field="email" errors={state.errors} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="emergency-message">How can I help?</Label>
                  <textarea
                    id="emergency-message"
                    name="message"
                    required
                    minLength={10}
                    placeholder="Tell me what happened and what page you were on."
                    className="min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <ValidationError prefix="Message" field="message" errors={state.errors} />
                </div>

                <input type="hidden" name="source_path" value={pathname} />
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                <p className="text-xs text-muted-foreground">
                  Include the page and steps you took so I can help quickly.
                </p>

                <ValidationError errors={state.errors} />

                <div className="flex justify-end">
                  <Button type="submit" disabled={state.submitting}>
                    {state.submitting ? "Sending..." : "Send Message to Zach"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

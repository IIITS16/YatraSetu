import {
  BadgeCheck,
  ChevronRight,
  MapPin,
  Phone,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { advisories } from "../data";
import { HeroCard } from "../components/HeroCard";

export function Home() {
  return (
    <div className="page-enter space-y-8">
      <section className="overflow-hidden rounded-3xl bg-ink px-6 py-10 text-white shadow-soft sm:px-10 sm:py-14">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-teal-100">
            <ShieldCheck size={15} /> Official tourism safety service
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Travel with confidence.{" "}
            <span className="text-amber-300">Everywhere.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
            Verify tourism services, check your bills, and report concerns
            safely. Your report helps authorities make destinations better for
            everyone.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/verify"
              className="rounded-xl bg-saffron px-4 py-3 text-sm font-bold text-amber-950 transition hover:bg-amber-400"
            >
              Verify a service
            </Link>
            <Link
              to="/report"
              className="rounded-xl border border-white/25 px-4 py-3 text-sm font-semibold hover:bg-white/10"
            >
              Report an issue
            </Link>
          </div>
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-sea">YOUR SAFETY TOOLKIT</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">How can we help?</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <HeroCard
            icon={BadgeCheck}
            title="Verify a business"
            body="Check whether a guide, hotel, restaurant or operator is registered."
            to="/verify"
            tone="bg-teal-100 text-teal-700"
          />
          <HeroCard
            icon={ScanLine}
            title="Scan your bill"
            body="Get a quick check for billing details and possible anomalies."
            to="/scan-bill"
            tone="bg-amber-100 text-amber-700"
          />
          <HeroCard
            icon={ShieldAlert}
            title="Report a concern"
            body="Share an issue with optional photos, bill and current location."
            to="/report"
            tone="bg-rose-100 text-rose-700"
          />
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-5">
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5 lg:col-span-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white p-2 text-sea">
              <MapPin size={20} />
            </div>
            <div>
              <p className="font-semibold text-ink">Traveling in Jaipur?</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Always choose a verified guide, ask for an itemised bill, and
                save the tourist helpline.
              </p>
              <Link
                to="/verify"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sea"
              >
                Explore verified services <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5 lg:col-span-2">
          <p className="text-sm font-semibold text-slate-500">TOURIST HELPLINE</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-ink">
            <Phone className="text-saffron" size={21} />
            1363
          </p>
          <p className="mt-1 text-xs text-slate-500">24/7 India Tourist Helpline</p>
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">Official advisories</h2>
          <button className="text-sm font-semibold text-sea">View all</button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {advisories.map(({ title, text, icon: Icon }) => (
            <div key={title} className="flex gap-3 rounded-xl border bg-white p-4">
              <Icon size={20} className="mt-0.5 shrink-0 text-saffron" />
              <div>
                <p className="font-semibold text-ink">{title}</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

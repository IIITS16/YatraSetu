import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroCard({ icon: Icon, title, body, to, tone }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-teal-200"
    >
      <span
        className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${tone}`}
      >
        <Icon size={22} />
      </span>
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
      <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-sea">
        Get started{" "}
        <ArrowRight
          size={16}
          className="transition group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}

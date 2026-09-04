import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold text-ink">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lg text-white">
        Y
      </span>
      <span>
        Yatra<span className="text-saffron">Setu</span>
      </span>
    </Link>
  );
}

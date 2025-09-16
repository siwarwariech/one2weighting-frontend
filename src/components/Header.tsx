import { Link } from "react-router-dom";

export default function Header() {
  return (
    // mêmes paddings que .signup/.signin (px-8 sm:px-16)
    <header className="app-header px-8 sm:px-16">
      <Link
        to="/"
        className="app-header px-8 sm:px-16"
      >
        one<span className="text-yellow-300">2</span>weighting
      </Link>
    </header>
  );
}

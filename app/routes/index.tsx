import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="grid place-items-center pt-8">
      <h1 className="text-2xl font-bold">Human Collectives</h1>
      <div className="mt-8">
        <Link className="btn btn-primary" to="/login">
          Login
        </Link>
      </div>
    </div>
  );
}

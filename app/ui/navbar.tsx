import * as React from "react";
import { Link } from "@remix-run/react";

const Navbar = React.forwardRef<HTMLDivElement, NavbarProps>(
  ({ children, authenticated, env, ...props }, ref) => {
    // [Close the dropdown menu upon menu item click](https://github.com/saadeghi/daisyui/issues/157#issuecomment-1119796119)
    const closeMenu = () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };

    return (
      <div ref={ref} {...props} className="navbar bg-base-100">
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex="0" className="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
            <ul
              tabIndex="0"
              className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-200 p-2 shadow"
            >
              <li className="hover-bordered" onClick={closeMenu}>
                <Link to="/">Home</Link>
              </li>
              <li className="hover-bordered" onClick={closeMenu}>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li className="menu-title">
                <span>Polls</span>
              </li>
              <li className="hover-bordered" onClick={closeMenu}>
                <Link to="/polls">List Polls</Link>
              </li>
              <li className="hover-bordered" onClick={closeMenu}>
                <Link to="/polls/new">Create Poll</Link>
              </li>
              <li className="menu-title">
                <span>Account</span>
              </li>
              <li className="hover-bordered" onClick={closeMenu}>
                {authenticated ? (
                  <Link to="/logout">Logout</Link>
                ) : (
                  <Link to="/login">Login</Link>
                )}
              </li>
              {env === "development" && (
                <>
                  <li className="menu-title">
                    <span>Development</span>
                  </li>
                  <li className="hover-bordered" onClick={closeMenu}>
                    <Link to="/dev/info">/dev/info</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="navbar-center">
          <Link to="/" className="btn btn-ghost text-xl normal-case">
            Humans 4 Solutions
          </Link>
        </div>
        <div className="navbar-end">
          <button className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          <button className="btn btn-ghost btn-circle">
            <div className="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="badge indicator-item badge-xs badge-primary"></span>
            </div>
          </button>
        </div>
      </div>
    );
  }
);

Navbar.displayName = "Navbar";

interface NavbarProps extends React.ComponentPropsWithRef<"div"> {
  authenticated?: boolean;
  env?: "development" | "production" | "test" | undefined;
  // align?: Alignment | Record<"default" | Viewport, Alignment>;
  // gap?: Gap | Record<"default" | Viewport, Gap>;
}

// type Alignment = "start" | "center" | "end";
// type Viewport = "sm" | "md" | "lg" | "xl" | "2x" | "3x";
// type Gap = 0 | 1 | 2 | 3 | 4 | 5;
// type BaseClass = `ui--stack`;
// type AlignClass = `${BaseClass}--align-${"default" | Viewport}-${Alignment}`;
// type GapClass = `${BaseClass}--gap-${"default" | Viewport}-${Gap}`;

export type { NavbarProps };
export { Navbar };

//            <svg
//              xmlns="http://www.w3.org/2000/svg"
//              fill="none"
//              viewBox="0 0 24 24"
//              className="inline-block w-5 h-5 stroke-current"
//            >
//              <path
//                stroke-linecap="round"
//                stroke-linejoin="round"
//                stroke-width="2"
//                d="M4 6h16M4 12h16M4 18h16"
//              ></path>
//            </svg>

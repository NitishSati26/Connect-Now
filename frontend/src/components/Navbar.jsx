import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, Sun, Moon } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";
import { scrollToHero } from "../pages/Home";

function scrollToSection(id) {
  const yOffset = -80; // Navbar height
  const el = document.getElementById(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

const Navbar = ({ variant }) => {
  const { logout, authUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useThemeStore();

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname === "/") {
      scrollToHero();
      return;
    }
    if (authUser) {
      logout();
    }
    navigate("/");
  };

  // Dynamic icon for theme
  let themeIcon = (
    <span className="absolute left-2 text-lg pointer-events-none">🎨</span>
  );
  if (theme === "light")
    themeIcon = (
      <Sun className="absolute left-2 w-5 h-5 text-yellow-500 pointer-events-none" />
    );
  else if (theme === "dark")
    themeIcon = (
      <Moon className="absolute left-2 w-5 h-5 text-blue-500 pointer-events-none" />
    );

  // Theme selector component
  const ThemeSelector = (
    <div className="relative flex items-center ml-4">
      {themeIcon}
      <select
        className="pl-8 pr-6 py-1 rounded-full bg-base-200 border-none focus:ring-2 focus:ring-primary text-sm font-medium text-base-content hover:bg-base-300 transition-colors appearance-none shadow-sm"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        aria-label="Theme selector"
        style={{ minWidth: 110 }}
      >
        {THEMES.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/60"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <a
              href="/"
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">ConnectNow</h1>
            </a>
          </div>
          {variant === "home" ? (
            <nav className="flex items-center gap-8 text-base font-medium">
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("about");
                }}
                className="hover:text-primary transition-colors"
              >
                About
              </a>
              <a
                href="#service"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("service");
                }}
                className="hover:text-primary transition-colors"
              >
                Service
              </a>
              <a
                href="#product"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("product");
                }}
                className="hover:text-primary transition-colors"
              >
                Product
              </a>
              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("faq");
                }}
                className="hover:text-primary transition-colors"
              >
                FAQ
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("contact");
                }}
                className="hover:text-primary transition-colors"
              >
                Contact
              </a>
              <button
                onClick={() => navigate("/login")}
                className="btn btn-primary rounded-full px-8 py-2 text-base font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-150"
              >
                Log In
              </button>
              {ThemeSelector}
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              {!(
                location.pathname === "/login" ||
                location.pathname === "/signup"
              ) && (
                <>
                  <Link
                    to={"/settings"}
                    className={`btn btn-sm gap-2 transition-colors`}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </Link>
                  {authUser && (
                    <>
                      <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                        <User className="size-5" />
                        <span className="hidden sm:inline">Profile</span>
                      </Link>
                      <button
                        className="flex gap-2 items-center"
                        onClick={logout}
                      >
                        <LogOut className="size-5" />
                        <span className="hidden sm:inline">Logout</span>
                      </button>
                    </>
                  )}
                </>
              )}
              {/* Only show ThemeSelector on login/signup pages */}
              {(location.pathname === "/login" ||
                location.pathname === "/signup") &&
                ThemeSelector}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;

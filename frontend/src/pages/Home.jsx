import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AboutSection from "../components/AboutSection";
import ServiceSection from "../components/ServiceSection";
import ProductSection from "../components/ProductSection";
import FAQSection from "../components/FAQSection";
import ContactSection from "../components/ContactSection";

// Helper to scroll to hero/top with offset
export function scrollToHero() {
  const yOffset = -80; // Navbar height
  const el = document.getElementById("hero-section");
  if (el) {
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

const Home = () => {
  // Animate hero text and button on mount
  const textRef = useRef(null);
  const btnRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (textRef.current) textRef.current.classList.add("animate-fadeinup");
    if (btnRef.current)
      btnRef.current.classList.add("animate-fadeinup", "delay-200");
  }, []);

  // Fix anchor scroll offset for Navbar
  useEffect(() => {
    const handleHashScroll = () => {
      if (window.location.hash) {
        const id = window.location.hash.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
          const yOffset = -80; // Navbar height
          const y =
            el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }
    };
    // On mount (refresh)
    handleHashScroll();
    // On hash change
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-base-100 via-base-200 to-base-300 pt-16">
      {/* Hero Section */}
      <main
        id="hero-section"
        className="flex flex-1 flex-col lg:flex-row items-center justify-between px-6 md:px-12 py-12 gap-12 relative overflow-hidden min-h-screen"
      >
        {/* Decorative background shape with pulse */}
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-60 pointer-events-none z-0 animate-pulse-slow" />
        {/* Left: Text */}
        <div className="max-w-xl z-10">
          <h1
            ref={textRef}
            className="opacity-0 translate-y-8 text-5xl md:text-6xl font-extrabold text-primary leading-tight mb-4 drop-shadow-sm transition-all duration-700"
          >
            Connect Instantly.
            <br />
            <span className="text-base-content">Message Freely.</span>
          </h1>
          <p className="opacity-0 translate-y-8 text-lg md:text-xl text-base-content/70 mb-8 font-medium transition-all duration-700 delay-100 animate-fadeinup">
            Welcome to ConnectNow — your modern, secure, and lightning-fast chat
            platform. Stay in touch, collaborate, and share with ease.
          </p>
          <button
            ref={btnRef}
            className="opacity-0 translate-y-8 btn btn-primary px-10 py-3 text-lg font-bold rounded-full shadow-xl transition-all duration-700 delay-200 animate-fadeinup hover:scale-105 hover:shadow-2xl"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>
        </div>
        {/* Right: Illustration */}
        <div className="flex-1 flex items-center justify-center z-10">
          <div className="bg-base-100/80 rounded-3xl shadow-2xl p-6 md:p-10 flex items-center justify-center">
            {/* Custom SVG: Chat app illustration */}
            <svg
              width="340"
              height="300"
              viewBox="0 0 340 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Phone device */}
              <rect
                x="90"
                y="40"
                width="160"
                height="220"
                rx="32"
                fill="#E0E7FF"
                stroke="#A5B4FC"
                strokeWidth="2"
              />
              <rect
                x="110"
                y="70"
                width="120"
                height="140"
                rx="18"
                fill="#fff"
              />
              {/* Chat bubbles inside phone */}
              <rect
                x="125"
                y="90"
                width="70"
                height="22"
                rx="10"
                fill="#A5B4FC"
                className="animate-float"
              />
              <rect
                x="125"
                y="120"
                width="90"
                height="22"
                rx="10"
                fill="#C7D2FE"
                className="animate-float delay-100"
              />
              <rect
                x="125"
                y="150"
                width="60"
                height="22"
                rx="10"
                fill="#A5B4FC"
                className="animate-float delay-200"
              />
              <rect
                x="125"
                y="180"
                width="80"
                height="22"
                rx="10"
                fill="#C7D2FE"
                className="animate-float delay-300"
              />
              {/* Avatars outside phone */}
              {/* Left avatar */}
              <circle
                cx="60"
                cy="120"
                r="28"
                fill="#F472B6"
                className="animate-bounce-slow"
              />
              <circle cx="60" cy="120" r="14" fill="#fff" />
              <circle cx="60" cy="120" r="10" fill="#F472B6" />
              {/* Right avatar */}
              <circle
                cx="280"
                cy="180"
                r="28"
                fill="#60A5FA"
                className="animate-bounce-slow delay-200"
              />
              <circle cx="280" cy="180" r="14" fill="#fff" />
              <circle cx="280" cy="180" r="10" fill="#60A5FA" />
              {/* Chat bubbles between avatars */}
              <rect
                x="90"
                y="110"
                width="40"
                height="18"
                rx="8"
                fill="#A5B4FC"
                className="animate-float"
              />
              <rect
                x="210"
                y="170"
                width="40"
                height="18"
                rx="8"
                fill="#C7D2FE"
                className="animate-float delay-200"
              />
              {/* Dots in chat bubbles */}
              <circle cx="110" cy="119" r="2.5" fill="#fff" />
              <circle cx="120" cy="119" r="2.5" fill="#fff" />
              <circle cx="130" cy="119" r="2.5" fill="#fff" />
              <circle cx="230" cy="179" r="2.5" fill="#fff" />
              <circle cx="240" cy="179" r="2.5" fill="#fff" />
              <circle cx="250" cy="179" r="2.5" fill="#fff" />
              {/* Soft shadow under phone */}
              <ellipse cx="170" cy="270" rx="80" ry="14" fill="#E0E7FF" />
            </svg>
          </div>
        </div>
      </main>
      <AboutSection />
      <ServiceSection />
      <ProductSection />
      <FAQSection />
      <ContactSection />
      {/* Custom keyframes for animation */}
      <style>{`
        @keyframes fadeinup { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeinup { animation: fadeinup 0.7s cubic-bezier(.4,0,.2,1) forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 2.5s ease-in-out infinite; }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
        .animate-bounce-slow { animation: bounce-slow 3.2s cubic-bezier(.4,0,.2,1) infinite; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.9; } }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default Home;

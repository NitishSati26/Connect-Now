import { useEffect, useRef, useState } from "react";
import { Info, Users, Lock, Globe, Rocket } from "lucide-react";

const AboutSection = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className={`scroll-mt-20 min-h-[calc(100vh-4rem)] flex flex-col justify-center py-16 px-4 md:px-0 bg-base-100/80 border-t border-base-200 relative overflow-hidden transition-all duration-700 ${
        visible ? "animate-fadeinup-section" : "opacity-0 translate-y-16"
      }`}
    >
      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none z-0" />
      <div className="max-w-3xl mx-auto text-center z-10 relative">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Info className="w-12 h-12 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            About ConnectNow
          </h2>
        </div>
        <p className="text-lg text-base-content/70 font-medium mb-8">
          ConnectNow is a next-generation chat platform designed for seamless,
          secure, and real-time communication. Whether for friends, teams, or
          communities, ConnectNow brings people together with a beautiful,
          intuitive interface and powerful features.
        </p>
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2 text-primary">
            Our Mission
          </h3>
          <p className="text-base-content/80 mb-4">
            To empower people everywhere to connect, collaborate, and
            communicate without barriers—securely and instantly.
          </p>
          <h3 className="text-xl font-semibold mb-2 text-primary">
            Why ConnectNow?
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            <li className="flex items-center gap-3 bg-base-200 rounded-xl p-4 shadow-sm">
              <Users className="w-6 h-6 text-primary" /> Community-driven and
              user-friendly
            </li>
            <li className="flex items-center gap-3 bg-base-200 rounded-xl p-4 shadow-sm">
              <Lock className="w-6 h-6 text-primary" /> End-to-end encrypted for
              your privacy
            </li>
            <li className="flex items-center gap-3 bg-base-200 rounded-xl p-4 shadow-sm">
              <Globe className="w-6 h-6 text-primary" /> Accessible anywhere,
              anytime
            </li>
            <li className="flex items-center gap-3 bg-base-200 rounded-xl p-4 shadow-sm">
              <Rocket className="w-6 h-6 text-primary" /> Fast, reliable, and
              always evolving
            </li>
          </ul>
        </div>
        <div className="flex justify-center">
          <span className="inline-block px-6 py-2 rounded-full bg-primary/10 text-primary font-semibold text-base shadow">
            Join thousands of users worldwide!
          </span>
        </div>
      </div>
      <style>{`
        @keyframes fadeinup-section { from { opacity: 0; transform: translateY(64px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeinup-section { animation: fadeinup-section 1s cubic-bezier(.4,0,.2,1) forwards; }
      `}</style>
    </section>
  );
};

export default AboutSection;

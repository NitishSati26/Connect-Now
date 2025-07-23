import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Globe,
  Smartphone,
  Rocket,
  ShieldCheck,
  Users,
} from "lucide-react";

const ProductSection = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

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
      id="product"
      ref={sectionRef}
      className={`scroll-mt-20 min-h-[calc(100vh-4rem)] flex flex-col justify-center py-16 px-4 md:px-0 bg-base-100 border-t border-base-200 relative overflow-hidden transition-all duration-700 ${
        visible ? "animate-fadeinup-section" : "opacity-0 translate-y-16"
      }`}
    >
      <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none z-0" />
      <div className="max-w-4xl mx-auto text-center z-10 relative">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Package className="w-12 h-12 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Our Product</h2>
        </div>
        <p className="text-lg text-base-content/70 font-medium mb-10">
          ConnectNow is available everywhere you are. Enjoy a seamless
          experience on any device.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
          <div className="flex flex-col items-center gap-2 bg-base-200 rounded-2xl p-6 shadow">
            <Globe className="w-8 h-8 text-primary" />
            <span className="font-semibold">Web App</span>
            <span className="text-base-content/70 text-sm">
              Access from any browser, no install required.
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-base-200 rounded-2xl p-6 shadow">
            <Smartphone className="w-8 h-8 text-primary" />
            <span className="font-semibold">Mobile App</span>
            <span className="text-base-content/70 text-sm">
              iOS & Android apps coming soon!
            </span>
          </div>
        </div>
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2 text-primary">
            What’s Next?
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            <li className="flex items-center gap-3 bg-base-200 rounded-xl p-4 shadow-sm">
              <Rocket className="w-6 h-6 text-primary" /> Video calls and screen
              sharing
            </li>
            <li className="flex items-center gap-3 bg-base-200 rounded-xl p-4 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-primary" /> Advanced
              moderation tools
            </li>
            <li className="flex items-center gap-3 bg-base-200 rounded-xl p-4 shadow-sm">
              <Users className="w-6 h-6 text-primary" /> Community channels and
              events
            </li>
            <li className="flex items-center gap-3 bg-base-200 rounded-xl p-4 shadow-sm">
              <Package className="w-6 h-6 text-primary" /> Integrations with
              your favorite tools
            </li>
          </ul>
        </div>
        <div className="flex justify-center">
          <button
            className="btn btn-primary px-8 py-2 text-lg font-semibold rounded-full shadow-lg hover:scale-105 hover:shadow-2xl transition-transform"
            onClick={() => navigate("/signup")}
          >
            Try ConnectNow Today
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeinup-section { from { opacity: 0; transform: translateY(64px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeinup-section { animation: fadeinup-section 1s cubic-bezier(.4,0,.2,1) forwards; }
      `}</style>
    </section>
  );
};

export default ProductSection;

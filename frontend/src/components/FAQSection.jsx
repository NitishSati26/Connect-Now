import { useState, useRef, useEffect } from "react";
import { MessageSquare } from "lucide-react";

const FAQS = [
  {
    q: "Is ConnectNow free to use?",
    a: "Yes! ConnectNow is free for all users. We also offer premium features for teams and businesses.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. All messages are end-to-end encrypted and your privacy is our top priority.",
  },
  {
    q: "Can I use ConnectNow on my phone?",
    a: "Yes! Our web app is mobile-friendly, and native iOS/Android apps are coming soon.",
  },
  {
    q: "How do I create a group chat?",
    a: "Just click the 'Create Group' button in the sidebar, give your group a name, and invite your friends!",
  },
];

const FAQSection = () => {
  const [open, setOpen] = useState(null);
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
      id="faq"
      ref={sectionRef}
      className={`scroll-mt-20 min-h-[calc(100vh-4rem)] flex flex-col justify-center py-16 px-4 md:px-0 bg-base-200 border-t border-base-300 relative overflow-hidden transition-all duration-700 ${
        visible ? "animate-fadeinup-section" : "opacity-0 translate-y-16"
      }`}
    >
      <div className="max-w-2xl mx-auto text-center z-10 relative">
        <div className="flex flex-col items-center gap-4 mb-6">
          <MessageSquare className="w-12 h-12 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-4 text-left mt-8">
          {FAQS.map((item, idx) => (
            <div
              key={idx}
              className="bg-base-100 rounded-2xl shadow p-4 transition-all duration-300"
            >
              <button
                className="w-full flex justify-between items-center text-lg font-semibold text-primary focus:outline-none"
                onClick={() => setOpen(open === idx ? null : idx)}
                aria-expanded={open === idx}
                aria-controls={`faq-panel-${idx}`}
              >
                <span>{item.q}</span>
                <span
                  className={`transition-transform ${
                    open === idx
                      ? "rotate-90 text-primary"
                      : "rotate-0 text-base-content/60"
                  }`}
                >
                  ▶
                </span>
              </button>
              <div
                id={`faq-panel-${idx}`}
                className={`overflow-hidden transition-all duration-500 ${
                  open === idx
                    ? "max-h-40 mt-2 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
                aria-hidden={open !== idx}
              >
                <p className="text-base-content/80 text-base pl-1 pr-2">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes fadeinup-section { from { opacity: 0; transform: translateY(64px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeinup-section { animation: fadeinup-section 1s cubic-bezier(.4,0,.2,1) forwards; }
      `}</style>
    </section>
  );
};

export default FAQSection;

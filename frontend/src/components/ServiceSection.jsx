import { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Users,
  FileText,
  Mic,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

const ServiceSection = () => {
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
      id="service"
      ref={sectionRef}
      className={`scroll-mt-20 min-h-[calc(100vh-4rem)] flex flex-col justify-center py-16 px-4 md:px-0 bg-base-200 border-t border-base-300 relative overflow-hidden transition-all duration-700 ${
        visible ? "animate-fadeinup-section" : "opacity-0 translate-y-16"
      }`}
    >
      <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none z-0" />
      <div className="max-w-5xl mx-auto text-center z-10 relative">
        <div className="flex flex-col items-center gap-4 mb-6">
          <MessageSquare className="w-12 h-12 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Our Services</h2>
        </div>
        <p className="text-lg text-base-content/70 font-medium mb-10">
          Everything you need for modern communication, all in one place.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            {
              icon: MessageSquare,
              title: "Real-time Messaging",
              desc: "Send and receive messages instantly, with typing indicators and read receipts.",
            },
            {
              icon: Users,
              title: "Group Chats",
              desc: "Create groups for friends, teams, or communities—share, collaborate, and stay connected.",
            },
            {
              icon: FileText,
              title: "File Sharing",
              desc: "Share images, documents, and more with a simple drag-and-drop interface.",
            },
            {
              icon: Mic,
              title: "Voice Notes",
              desc: "Send quick voice messages for when typing isn’t enough.",
            },
            {
              icon: ShieldCheck,
              title: "Security",
              desc: "Your data is protected with industry-leading encryption and privacy controls.",
            },
            {
              icon: Smartphone,
              title: "Cross-Platform",
              desc: "Use ConnectNow on web or mobile—your chats sync everywhere, instantly.",
            },
          ].map((service) => (
            <div
              key={service.title}
              className="relative group bg-gradient-to-br from-base-100 to-base-200 rounded-2xl shadow p-6 flex flex-col items-center gap-3 transition-all duration-300 border border-base-300 hover:shadow-2xl hover:-translate-y-1"
              tabIndex={0}
              aria-label={service.title}
            >
              {/* Icon with animation */}
              <div className="mt-2 mb-1 flex items-center justify-center">
                <service.icon className="w-10 h-10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:text-primary-focus" />
              </div>
              <h4
                className="font-semibold text-lg md:text-xl mt-1 mb-1 text-base-content"
                style={{ fontWeight: 500 }}
              >
                {service.title}
              </h4>
              <p
                className="text-base-content/70 text-sm font-normal"
                style={{ fontWeight: 400 }}
              >
                {service.desc}
              </p>
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

export default ServiceSection;

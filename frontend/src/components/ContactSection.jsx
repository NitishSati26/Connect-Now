import { useState, useRef, useEffect } from "react";
import { Mail, Phone } from "lucide-react";

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(false);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: "", email: "", message: "" });
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again later.");
    }
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className={`scroll-mt-20 min-h-[calc(80vh)] flex flex-col justify-center py-8 px-1 md:px-0 bg-base-100 border-t border-base-200 relative overflow-hidden transition-all duration-700 ${
        visible ? "animate-fadeinup-section" : "opacity-0 translate-y-16"
      }`}
    >
      <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row bg-base-100 rounded-2xl shadow-lg overflow-hidden">
        {/* Left: Contact Form */}
        <div className="flex-1 p-5 md:p-8 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-1 text-left">
            Contact Us
          </h2>
          <p className="text-base text-base-content/70 font-medium mb-4 text-left">
            Have a question or feedback? Fill out the form below.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-left">
              <label
                htmlFor="name"
                className="font-medium text-base-content text-sm"
              >
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="input input-bordered input-sm"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <label
                htmlFor="email"
                className="font-medium text-base-content text-sm"
              >
                Your Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="input input-bordered input-sm"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <label
                htmlFor="message"
                className="font-medium text-base-content text-sm"
              >
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                className="textarea textarea-bordered min-h-[80px] textarea-sm"
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="w-32 mt-1 py-1.5 rounded-lg text-base font-semibold text-white shadow-md transition-transform bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:shadow-lg"
            >
              {submitted ? "Thank you!" : "SUBMIT"}
            </button>
            {error && <div className="text-error text-xs mt-1">{error}</div>}
          </form>
        </div>
        {/* Right: Contact Info & Socials */}
        <div className="flex-1 bg-primary text-primary-content flex flex-col justify-center p-5 md:p-8 gap-4 min-h-[280px]">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-sm">nitishsati321@email.com</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-sm">+91 8630158989</span>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <SocialLink
              icon={
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0" />
                </svg>
              }
              label="Facebook"
              href="#"
            />
            <SocialLink
              icon={
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.675 3.5 12 3.5 12 3.5s-7.675 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.897 0 12 0 12s0 4.103.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.325 20.5 12 20.5 12 20.5s7.675 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 16.103 24 12 24 12s0-4.103-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              }
              label="Youtube"
              href="#"
            />
            <SocialLink
              icon={
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.414 3.678 1.395c-.98.98-1.263 2.092-1.322 3.373C2.013 8.332 2 8.741 2 12c0 3.259.013 3.668.072 4.948.059 1.281.342 2.393 1.322 3.373.981.981 2.093 1.264 3.374 1.323C8.332 23.987 8.741 24 12 24c3.259 0 3.668-.013 4.948-.072 1.281-.059 2.393-.342 3.374-1.323.98-.98 1.263-2.092 1.322-3.373.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.281-.342-2.393-1.322-3.373-.981-.981-2.093-1.264-3.374-1.323C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
                </svg>
              }
              label="Instagram"
              href="https://www.instagram.com/nitishsati321/"
            />
            <SocialLink
              icon={
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.363.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z" />
                </svg>
              }
              label="Whatsapp"
              href="https://wa.me/918630158989"
            />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeinup-section { from { opacity: 0; transform: translateY(64px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeinup-section { animation: fadeinup-section 1s cubic-bezier(.4,0,.2,1) forwards; }
      `}</style>
    </section>
  );

  // SocialLink helper component
  function SocialLink({ icon, label, href }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
      >
        <span className="bg-white/20 rounded-full p-2 flex items-center justify-center">
          {icon}
        </span>
        <span className="text-base">{label}</span>
      </a>
    );
  }
};

export default ContactSection;

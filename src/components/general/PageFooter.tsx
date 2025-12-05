import React from "react";

const PageFooter: React.FC = () => {
  const links = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms & Conditions", href: "#" },
    { label: "Support", href: "#" }
  ];

  return (
    <footer className="mt-10 border-t border-slate-200 pt-6">
      <div className="flex flex-col gap-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-slate-900">©</span>
          <span className="font-semibold text-slate-900">Aparte</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          {links.map((link, index) => (
            <React.Fragment key={link.label}>
              <a
                href={link.href}
                className="text-slate-600 transition-colors hover:text-primary"
              >
                {link.label}
              </a>
              {index < links.length - 1 && (
                <span className="text-slate-300">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;

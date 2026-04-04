"use client";

import { ArrowUpRight, BriefcaseBusiness, Github, Linkedin } from "lucide-react";

const footerLinks = {
  Product: [
    { name: "Agent capabilities", href: "#features" },
    { name: "How it works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "Integrations", href: "#integrations" }
  ],
  Developers: [
    { name: "Documentation", href: "#developers" },
    { name: "Agent SDK", href: "#developers" },
    { name: "API Reference", href: "#developers" },
    { name: "Status", href: "#developers" }
  ],
  Company: [
    { name: "About", href: "#features" },
    { name: "Blog", href: "#features" },
    { name: "Careers", href: "#features", badge: "Hiring" },
    { name: "Contact", href: "#pricing" }
  ],
  Legal: [
    { name: "Privacy", href: "#security" },
    { name: "Terms", href: "#security" },
    { name: "Security", href: "#security" }
  ]
};

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/vishalgupta-28",
    icon: Github
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/vishal-gupta-9baaa1265/",
    icon: Linkedin
  },
  {
    name: "Portfolio",
    href: "https://portfolio-nu-plum-19.vercel.app/",
    icon: BriefcaseBusiness
  }
];

export function FooterSection() {
  return (
    <footer className="relative bg-black text-white">
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-6 lg:gap-8">
            <div className="col-span-2">
              <a className="mb-6 inline-flex items-center gap-2" href="/landing">
                <span className="font-display text-2xl text-white">COMPUTE</span>
                <span className="font-mono text-xs text-white/40">TM</span>
              </a>

              <p className="mb-8 max-w-xs text-sm leading-relaxed text-white/55">
                Autonomous AI agents for distributed computing. Delegate complex tasks to intelligent workers.
              </p>

              <div className="flex flex-wrap gap-6">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      className="group flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
                      href={link.href}
                      key={link.name}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Icon className="h-4 w-4" />
                      {link.name}
                      <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </a>
                  );
                })}
              </div>
            </div>

            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="mb-6 text-sm font-medium text-white">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a className="inline-flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-white" href={link.href}>
                        {link.name}
                        {"badge" in link && link.badge ? (
                          <span className="rounded-full bg-white px-2 py-0.5 text-xs text-black">{link.badge}</span>
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 md:flex-row">
          <p className="text-sm text-white/35">&copy; 2026 COMPUTE. All rights reserved.</p>

          <div className="flex items-center gap-4 text-sm text-white/35">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/70" />
              All agents operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

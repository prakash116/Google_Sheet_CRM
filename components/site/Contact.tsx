import { httpsUrl, whatsappUrl } from "@/lib/portfolio/content";

import ContactForm from "./ContactForm";
import Reveal from "./Reveal";

export default function Contact({
  email,
  businessEmail,
  phone,
  whatsapp,
  location,
  socials,
  services,
  packages,
}: {
  email: string | null;
  businessEmail: string | null;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  socials: { label: string; url: string | null }[];
  services: string[];
  packages: { id: string; name: string }[];
}) {
  const wa = whatsappUrl(whatsapp);
  const links = socials
    .map((s) => ({ label: s.label, url: httpsUrl(s.url) }))
    .filter((s): s is { label: string; url: string } => s.url !== null);

  return (
    <section id="contact" className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 md:px-10 lg:grid-cols-[1fr_1.5fr]">
        <Reveal>
          <p className="eyebrow mb-4">Contact</p>
          <h2 className="font-display text-5xl leading-[1.02] md:text-6xl">
            Have a project <em className="text-accent">in mind?</em>
          </h2>

          <dl className="mt-10 space-y-6">
            {email && (
              <div>
                <dt className="eyebrow mb-1">Email</dt>
                <dd>
                  <a href={`mailto:${email}`} className="text-lg hover:text-accent">{email}</a>
                </dd>
              </div>
            )}
            {businessEmail && businessEmail !== email && (
              <div>
                <dt className="eyebrow mb-1">Business</dt>
                <dd>
                  <a href={`mailto:${businessEmail}`} className="text-lg hover:text-accent">{businessEmail}</a>
                </dd>
              </div>
            )}
            {phone && (
              <div>
                <dt className="eyebrow mb-1">Phone</dt>
                <dd>
                  <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="text-lg hover:text-accent">{phone}</a>
                </dd>
              </div>
            )}
            {wa && (
              <div>
                <dt className="eyebrow mb-1">WhatsApp</dt>
                <dd>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="text-lg hover:text-accent">{whatsapp}</a>
                </dd>
              </div>
            )}
            {location && (
              <div>
                <dt className="eyebrow mb-1">Based in</dt>
                <dd className="text-lg">{location}</dd>
              </div>
            )}
          </dl>

          {links.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-3">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full border border-line px-5 py-2 text-sm transition hover:border-accent hover:text-accent"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <Reveal delay={0.1} className="rounded-3xl border border-line bg-surface p-6 md:p-10">
          <ContactForm services={services} packages={packages} />
        </Reveal>
      </div>
    </section>
  );
}

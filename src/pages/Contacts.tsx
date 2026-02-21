import { motion } from "framer-motion";
import { Mail, Youtube, Twitch, ExternalLink } from "lucide-react";
import { Header } from "@/components/layout/Header";

const CONTACT_EMAIL = "geral@ricteamracing.pt";
const YOUTUBE_URL = "https://www.youtube.com/@RicFazeres";
const TWITCH_URL = "https://www.twitch.tv/ricfazeres";
const YOUTUBE_URL2 = "https://www.youtube.com/@RicTeamRacing";

const contactLinks = [
  {
    icon: Mail,
    label: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    description: "Para questões gerais da equipa",
  },
];

export default function Contacts() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(4_90%_58%_/_0.1)_0%,_transparent_50%)]" />
        <div className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="font-racing text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
              Contactos
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Fica em contacto com a Ric Team Racing. Envia-nos um email ou acompanha as transmissões do RicFazeres.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <main className="container py-12">
        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
          {contactLinks.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.a
                key={item.label}
                href={item.href}
                target={item.label !== "Email" ? "_blank" : undefined}
                rel={item.label !== "Email" ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-racing overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors flex flex-col w-full max-w-sm"
              >
                <div className="p-4 sm:p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="h-8 w-8 text-primary" />
                    {item.label !== "Email" && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  <h3 className="font-racing text-lg font-bold mb-1">
                    {item.value}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.a>
            );
          })}
        </div>
      </main>
    </div>
  );
}

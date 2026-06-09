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
    <div className="page-shell">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,_hsl(24_90%_50%_/_0.1)_0%,_hsl(268_40%_30%_/_0.05)_40%,_transparent_70%)]" />
        <div className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 12 }}
            >
              <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="font-racing text-2xl sm:text-4xl md:text-5xl font-bold mb-4"
            >
              Contactos
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              Fica em contacto com a Ric Team Racing. Envia-nos um email ou acompanha as transmissões do RicFazeres.
            </motion.p>
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
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="card-racing overflow-hidden group cursor-pointer flex flex-col w-full max-w-sm"
              >
                <div className="p-4 sm:p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
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

export const siteConfig = {
  name: "Winform",
  description: "AI-Powered Form Scoring Platform",
  url: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000",
  ogImage: "/og-image.png",
  links: {
    github: "https://github.com/yourusername/winform",
    whatsapp: "https://wa.me/+22966895973",
  },
  pricing: {
    free: {
      id: "free",
      name: "Gratuit",
      price: "0€",
      description: "Parfait pour commencer",
      features: [
        "2 formulaires maximum",
        "Scoring IA de base",
        "Notifications email",
        "Support communautaire",
      ],
      cta: "Commencer gratuitement",
    },
    premium: {
      id: "premium",
      name: "Premium",
      price: "19€",
      description: "Pour les professionnels",
      features: [
        "Formulaires illimités",
        "Scoring IA avancé",
        "Export de données",
        "Notifications personnalisées",
        "Support prioritaire",
        "Analyses avancées",
      ],
      cta: "Passer au Premium",
    },
  },
  whatsapp: {
    paymentNumber: "+22966895973",
    paymentMessage: "Bonjour, je souhaite passer au niveau supérieur de Winform.",
  },
  colors: {
    primary: "#2563eb",
    secondary: "#1e293b",
    accent: "#7c3aed",
    background: "#ffffff",
    text: "#1f2937",
    light: "#f8fafc",
    dark: "#0f172a",
  },
  animations: {
    fadeIn: "fade-in",
    slideUp: "slide-up",
    scaleIn: "scale-in",
  },
};
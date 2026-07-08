export const SITE_CONFIG = {
  name: "HWL by SMD",
  tagline: "Body · Beauty · Being",
  description:
    "Luxury facial rituals, movement, and intentional wellness experiences designed to restore your glow from the inside out.",
  email: "shannonmarydixon@gmail.com",
  phone: "617.671.8636",
  instagramPersonal: "@shannmarydix",
  instagramBrand: "@hwl.bysmd",
  instagramPersonalUrl: "https://instagram.com/shannmarydix",
  instagramBrandUrl: "https://instagram.com/hwl.bysmd",
  location: "Palm Springs, CA",
  region: "Coachella Valley",
};

export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Experiences",
    href: "/experiences",
    children: [
      {
        label: "Beauty",
        href: "/experiences/beauty",
        description:
          "Luxury facial rituals that restore skin while creating space to slow down.",
      },
      {
        label: "Movement",
        href: "/experiences/movement",
        description:
          "Private yoga, restorative movement, and sound healing to reconnect with your body.",
      },
      {
        label: "Ritual",
        href: "/experiences/ritual",
        description:
          "Seasonal gatherings, astrology, Reiki, meditation, and intentional ceremony.",
      },
      {
        label: "Retreats",
        href: "/experiences/retreats",
        description:
          "Custom wellness programming for boutique retreats and luxury hospitality.",
      },
    ],
  },
  { label: "Journal", href: "/journal" },
  { label: "LIFT Guide", href: "/lift" },
];

export const FOOTER_NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Beauty", href: "/experiences/beauty" },
  { label: "Movement", href: "/experiences/movement" },
  { label: "Ritual", href: "/experiences/ritual" },
  { label: "Retreats", href: "/experiences/retreats" },
  { label: "LIFT Guide", href: "/lift" },
  { label: "Journal", href: "/journal" },
  { label: "Book", href: "/book" },
  { label: "Contact", href: "/contact" },
];

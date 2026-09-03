export const navItems = [
  { key: "home", href: "/" },
  { key: "projects", href: "/projects" },
  { key: "skills", href: "/skills" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

export type NavKey = (typeof navItems)[number]["key"];

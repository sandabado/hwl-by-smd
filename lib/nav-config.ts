import { NAV_ITEMS } from "./constants";

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; description: string }[];
}

export const MAIN_NAV: NavItem[] = NAV_ITEMS;

import {
  Sparkles, Wrench, Package, Sofa, Zap, Wifi, Sprout, Landmark, ShieldCheck,
  FileText, Building2, Percent, AppWindow, Megaphone, Briefcase, Stamp,
  CreditCard, Car, UtensilsCrossed, Printer, Tag,
} from "lucide-react";

const ICONS = {
  sparkles: Sparkles, wrench: Wrench, package: Package, sofa: Sofa, zap: Zap, wifi: Wifi,
  sprout: Sprout, landmark: Landmark, shield: ShieldCheck, file: FileText, building: Building2,
  percent: Percent, app: AppWindow, megaphone: Megaphone, briefcase: Briefcase, stamp: Stamp,
  card: CreditCard, car: Car, meals: UtensilsCrossed, printer: Printer, tag: Tag,
};

export default function Icon({ name, size = 16, ...p }) {
  const C = ICONS[name] || Tag;
  return <C size={size} {...p} />;
}

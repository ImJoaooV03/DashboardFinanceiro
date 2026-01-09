import React from 'react';
import { 
  Wallet, Briefcase, TrendingUp, Home, Car, Utensils, 
  ShoppingCart, HeartPulse, GraduationCap, Gamepad2, 
  Plane, Smartphone, Wifi, Zap, Gift, Music, 
  Coffee, Anchor, Camera, Dumbbell, BookOpen,
  Laptop, Truck, Megaphone, FileText, Settings, Users,
  Tag, AlertCircle
} from 'lucide-react';

// Mapa de ícones disponíveis para seleção
export const ICON_MAP: Record<string, React.ElementType> = {
  'wallet': Wallet,
  'briefcase': Briefcase,
  'trending-up': TrendingUp,
  'home': Home,
  'car': Car,
  'utensils': Utensils,
  'shopping-cart': ShoppingCart,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  'gamepad-2': Gamepad2,
  'plane': Plane,
  'smartphone': Smartphone,
  'wifi': Wifi,
  'zap': Zap,
  'gift': Gift,
  'music': Music,
  'coffee': Coffee,
  'anchor': Anchor,
  'camera': Camera,
  'dumbbell': Dumbbell,
  'book-open': BookOpen,
  'laptop': Laptop,
  'truck': Truck,
  'megaphone': Megaphone,
  'file-text': FileText,
  'settings': Settings,
  'users': Users,
  'tag': Tag
};

interface IconRendererProps {
  iconName?: string;
  size?: number;
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ iconName, size = 20, className }) => {
  if (!iconName || !ICON_MAP[iconName]) {
    return <Tag size={size} className={className} />; // Fallback icon
  }

  const IconComponent = ICON_MAP[iconName];
  return <IconComponent size={size} className={className} />;
};

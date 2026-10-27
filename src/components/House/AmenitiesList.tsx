import React from 'react';
import { 
  Waves, Flame, Home, Trees, Bath, Wind, Wifi, 
  UtensilsCrossed, ShieldCheck, HeartHandshake, Award, UserCheck, Car 
} from 'lucide-react';
import { AMENITIES } from '../../data/houseData';

const iconMap: Record<string, React.ElementType> = {
  Waves,
  Flame,
  Home,
  Trees,
  Bath,
  Wind,
  Wifi,
  UtensilsCrossed,
  ShieldCheck,
  HeartHandshake,
  Award,
  UserCheck,
  Car,
};

export const AmenitiesList: React.FC = () => {
  return (
    <div className="mt-16 pt-12 border-t border-sand-200">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600">Equipamiento & Confort</span>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-timber-950 mt-1">
          Todo lo necesario para sentirte en casa
        </h3>
        <p className="text-sm text-timber-700 mt-2">
          Vivienda totalmente equipada para una estancia autónoma, cómoda y relajada.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
        {AMENITIES.map((amenity, index) => {
          const Icon = iconMap[amenity.iconName] || Home;
          return (
            <div
              key={index}
              className="p-3.5 sm:p-4 rounded-xl bg-white border border-sand-200/80 hover:border-terracotta-200 hover:shadow-md transition-all duration-200 flex items-start gap-3 min-w-0"
            >
              <div className="p-2 sm:p-2.5 rounded-lg bg-sand-100 text-terracotta-600 flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-timber-950 text-sm">{amenity.name}</h4>
                <p className="text-xs text-timber-600 mt-0.5 leading-snug">{amenity.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


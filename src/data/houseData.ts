import { Amenity, GalleryPhoto, SpaceDetail } from '../types';

export const HOUSE_INFO = {
  name: 'Casa Vacacional Imasaru',
  registrationNumber: 'RTA: VTAR/CA/01451',
  tagline: 'Tu refugio de madera y tranquilidad en Conil de la Frontera',
  description: 'Acogedora casa de madera con encanto rural situada en una tranquila parcela privada de Conil de la Frontera (Cádiz). Diseñada para desconectar del ritmo diario, rodeada de naturaleza y a pocos minutos de las mejores calas gaditanas.',
  address: {
    street: 'Diseminado Pago Zorro, 657',
    locality: 'Conil de la Frontera',
    province: 'Cádiz',
    postalCode: '11149',
    country: 'España',
    googleMapsUrl: 'https://maps.google.com/?q=Diseminado+Pago+Zorro+657+11149+Conil+de+la+Frontera+Cadiz'
  },
  hosts: {
    names: 'Pilar y Paco',
    phone: '+34699278630',
    phoneFormatted: '699 27 86 30',
    email: 'pilirufinofer@gmail.com',
    whatsappUrl: 'https://wa.me/34699278630?text=Hola%20Pilar,%20estoy%20interesado/a%20en%20consultar%20disponibilidad%20para%20Casa%20Vacacional%20Imasaru.'
  },
  capacity: {
    standardGuests: 4,
    maxGuests: 5,
    note: 'Capacidad máxima de 4 personas. Posibilidad de alojamiento para 5 personas si al menos una de ellas es menor de 16 años (se facilita cama supletoria bajo petición).'
  },
  distances: [
    {
      place: 'Senda de las Calas de Conil',
      time: '~5 minutos a pie',
      description: 'Paseo natural con vistas directas a los acantilados y calas',
      icon: 'Footprints'
    },
    {
      place: 'Centro urbano de Conil de la Frontera',
      time: '~2 minutos en coche',
      description: 'Restaurantes, comercios locales, terrazas y casco histórico',
      icon: 'Car'
    },
    {
      place: 'Cala de Roche y Cala del Aceite',
      time: 'Pocos minutos en vehículo',
      description: 'Calas resguardadas del viento de levante con aguas cristalinas',
      icon: 'Compass'
    },
    {
      place: 'Playa de la Fontanilla',
      time: 'Acceso rápido en coche o bicicleta',
      description: 'Amplia playa de arena dorada con chiringuitos tradicionales',
      icon: 'Sun'
    }
  ]
};

export const SPACES: SpaceDetail[] = [
  {
    id: 'master-bedroom',
    title: 'Dormitorio Principal Abuhardillado',
    subtitle: 'Planta Alta · Vistas Panorámicas',
    description: 'Ocupa la planta superior casi en su totalidad. Un espacio cálido de madera con techos inclinados y vigas vistas, cama de matrimonio y acceso directo a una amplia terraza privada con vistas a la piscina y a las puestas de sol de Conil.',
    features: ['Cama de matrimonio', 'Terraza privada', 'Vistas a la piscina y atardecer', 'Techos y suelos de madera', 'Climatización'],
    image: '/images/dormitorio-principal.jpg',
    badge: 'Planta Alta'
  },
  {
    id: 'twin-bedroom',
    title: 'Dormitorio de Camas Individuales',
    subtitle: 'Planta Baja · Confort y Descanso',
    description: 'Dormitorio acogedor situado en la planta baja, equipado con dos camas individuales confortables, ventana exterior con luz natural y armarios de madera.',
    features: ['2 camas individuales', 'Ropa de cama incluida', 'Luz natural', 'Armario'],
    image: '/images/dormitorio-individuales.jpg',
    badge: 'Planta Baja'
  },
  {
    id: 'living-dining',
    title: 'Salón Comedor',
    subtitle: 'Ambiente Familiar y Acogedor',
    description: 'Zona de reunión con sofá, televisión, mesa de comedor familiar y climatización frío/calor para estancias en cualquier época del año.',
    features: ['Mesa de comedor', 'Sofás confortables', 'Televisión plana', 'Aire acondicionado frío/calor'],
    image: '/images/salon-comedor.jpg',
    badge: 'Zona Común'
  },
  {
    id: 'kitchen',
    title: 'Cocina Totalmente Equipada',
    subtitle: 'Comunicada Directamente con el Porche',
    description: 'Cocina rústica decorada con azulejería andaluza tradicional. Cuenta con lavavajillas, microondas, frigorífico, lavadora y placa de fogones. Salida directa al porche exterior.',
    features: ['Lavavajillas', 'Lavadora', 'Frigorífico y congelador', 'Microondas', 'Placa de fogones', 'Menaje completo'],
    image: '/images/cocina-equipada.jpg',
    badge: 'Equipada'
  },
  {
    id: 'pool-garden',
    title: 'Piscina Privada & Jardín',
    subtitle: 'Exteriores Cerrados y Seguros',
    description: 'Piscina privada vallada con césped natural, sombrilla de brezo artesanal, tumbonas y muro de mampostería de piedra. Dispone de iluminación nocturna para disfrutar de baños bajo las estrellas.',
    features: ['Piscina vallada (seguridad)', 'Iluminación nocturna', 'Césped natural', 'Sombrilla de brezo y tumbonas', 'Baño exterior en jardín'],
    image: '/images/piscina-solarium.jpg',
    badge: 'Exterior Privado'
  },
  {
    id: 'porch-bbq',
    title: 'Porche de Madera & Barbacoa',
    subtitle: 'Vida al Aire Libre',
    description: 'Espacioso porche cubierto de madera amueblado con sofás de exterior y mesa de mosaico, junto a una pérgola con barbacoa de obra y mesa de picnic.',
    features: ['Porche cubierto amueblado', 'Barbacoa de obra', 'Mesa de picnic rústica', 'Zona de sombra'],
    image: '/images/porche-sofas.jpg',
    badge: 'Exteriores'
  }
];

export const AMENITIES: Amenity[] = [
  { name: 'Piscina Privada', description: 'Con valla perimetral de seguridad e iluminación nocturna', iconName: 'Waves', category: 'exterior' },
  { name: 'Barbacoa de Obra', description: 'Pérgola techada con mesa de picnic rústica', iconName: 'Flame', category: 'exterior' },
  { name: 'Porche Amueblado', description: 'Terraza de madera con sofás y mesa de mosaico', iconName: 'Home', category: 'exterior' },
  { name: 'Jardín con Césped', description: 'Amplia parcela cerrada con vegetación y sombra natural', iconName: 'Trees', category: 'exterior' },
  { name: '2 Baños Completos', description: '1 baño interior en la casa y 1 baño en el jardín/piscina', iconName: 'Bath', category: 'interior' },
  { name: 'Aire Acondicionado', description: 'Climatización frío/calor para máximo confort', iconName: 'Wind', category: 'comfort' },
  { name: 'Internet Wi-Fi', description: 'Conexión inalámbrica gratuita en toda la vivienda', iconName: 'Wifi', category: 'comfort' },
  { name: 'Cocina Completa', description: 'Lavavajillas, lavadora, microondas, frigorífico y fogones', iconName: 'UtensilsCrossed', category: 'interior' },
  { name: 'Aparcamiento Privado', description: 'Espacio dentro de la propia parcela cerrada', iconName: 'ShieldCheck', category: 'comfort' },
  { name: 'Mascotas bienvenidas', description: 'Suplemento de 5 € por mascota y por noche.', iconName: 'HeartHandshake', category: 'comfort' },
  { name: 'Registro Oficial Junta Andalucía', description: 'Vivienda Turística de Alojamiento Rural VTAR/CA/01451', iconName: 'Award', category: 'comfort' },
  { name: 'Atención Directa Propietarios', description: 'Trato cercano y personal con Pilar y Paco', iconName: 'UserCheck', category: 'comfort' }
];

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  { id: '1', src: '/images/exterior-casa.jpg', title: 'Fachada y jardín bajo el sol de Conil', category: 'exterior', alt: 'Fachada principal de la casa de madera Imasaru con jardín' },
  { id: '2', src: '/images/piscina-solarium.jpg', title: 'Piscina privada y zona solárium', category: 'piscina', alt: 'Piscina privada con sombrilla de brezo y tumbonas' },
  { id: '3', src: '/images/porche-sofas.jpg', title: 'Porche cubierto de madera', category: 'porche', alt: 'Porche de madera con sofá blanco y mesa de mosaico' },
  { id: '4', src: '/images/dormitorio-principal.jpg', title: 'Dormitorio principal abuhardillado', category: 'interior', alt: 'Dormitorio de matrimonio abuhardillado con techos de madera' },
  { id: '5', src: '/images/barbacoa-pergola.jpg', title: 'Barbacoa de obra y pérgola', category: 'exterior', alt: 'Barbacoa de obra con mesa de picnic en el jardín' },
  { id: '6', src: '/images/piscina-agua.jpg', title: 'Agua cristalina y muro rústico', category: 'piscina', alt: 'Vista de la piscina privada con muro de piedra natural' },
  { id: '7', src: '/images/cocina-equipada.jpg', title: 'Cocina con azulejos tradicionales', category: 'interior', alt: 'Cocina equipada con lavavajillas, microondas y fogones' },
  { id: '8', src: '/images/salon-comedor.jpg', title: 'Salón comedor familiar', category: 'interior', alt: 'Salón comedor amueblado en madera con aire acondicionado' },
  { id: '9', src: '/images/dormitorio-individuales.jpg', title: 'Segundo dormitorio (camas individuales)', category: 'interior', alt: 'Dormitorio de dos camas individuales' },
  { id: '10', src: '/images/porche-comedor.jpg', title: 'Comedor en porche exterior', category: 'porche', alt: 'Mesa de comedor en el porche de madera' },
  { id: '11', src: '/images/jardin-flores.jpg', title: 'Jardín y vegetación mediterránea', category: 'exterior', alt: 'Jardín con enredadera de flores y césped' },
  { id: '12', src: '/images/cartel-madera-imasaru.jpg', title: 'Letrero artesanal Casa Imasaru', category: 'exterior', alt: 'Rótulo de madera tallado Casa Imasaru' },
  { id: '13', src: '/images/salon-estar.jpg', title: 'Salón y zona de televisión', category: 'interior', alt: 'Zona de estar con sofá, televisión y muebles de madera' },
  { id: '14', src: '/images/placa-oficial-turismo.jpg', title: 'Placa oficial RTA VTAR/CA/01451', category: 'exterior', alt: 'Placa oficial de Vivienda Turística de Alojamiento Rural de la Junta de Andalucía' }
];


import scooterImage from '@assets/generated_images/ather_450x_electric_scooter_side_profile.png';
import bikeImage from '@assets/generated_images/futuristic_black_electric_motorbike_side_profile.png';

export interface Vehicle {
  id: string;
  name: string;
  type: 'scooter' | 'bike' | 'car';
  brand: string;
  battery_capacity_kwh: number;
  full_range_km: number;
  charging_speed_kw: number;
  charger_type_supported: ('AC' | 'DC')[];
  connector_type: 'Type 2' | 'CCS2' | 'Ather Grid' | 'Bharat AC001';
  image_url: string;
  brand_logo_url?: string;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  charger_power_kw: number;
  charger_type: 'AC' | 'DC';
  connector_type: 'Type 2' | 'CCS2' | 'Ather Grid' | 'Bharat AC001';
  price_per_unit: number;
  status: 'available' | 'busy' | 'offline';
  reliability_score: number;
  queue_wait_minutes: number;
  distance_km?: number;
}

// Track active charging sessions for queue calculation
export const activeChargingSessions: Map<string, { vehicleId: string; startTime: number; estimatedEndTime: number }[]> = new Map();

// Get queue wait time based on active sessions
export const getQueueWaitTime = (stationId: string, estimatedChargeTime: number): number => {
  const sessions = activeChargingSessions.get(stationId) || [];
  const now = Date.now();
  
  // Remove expired sessions
  const activeSessions = sessions.filter(s => s.estimatedEndTime > now);
  
  if (activeSessions.length === 0) return 0;
  
  // Calculate total wait based on sessions ahead in queue
  let totalWait = 0;
  for (let i = 0; i < Math.min(activeSessions.length, 2); i++) {
    const remainingTime = Math.max(0, activeSessions[i].estimatedEndTime - now) / 60000;
    totalWait += Math.ceil(remainingTime);
  }
  
  return totalWait;
};

// Add a charging session
export const addChargingSession = (stationId: string, vehicleId: string, chargeTime: number) => {
  if (!activeChargingSessions.has(stationId)) {
    activeChargingSessions.set(stationId, []);
  }
  activeChargingSessions.get(stationId)!.push({
    vehicleId,
    startTime: Date.now(),
    estimatedEndTime: Date.now() + (chargeTime * 60000)
  });
};

// Generated from Excel dataset - 95 EV vehicles
export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'tata-nexon-ev',
    name: 'Nexon EV',
    brand: 'Tata',
    type: 'car',
    battery_capacity_kwh: 40.5,
    full_range_km: 312,
    charging_speed_kw: 44.2,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'tata-nexon-ev-max',
    name: 'Nexon EV Max',
    brand: 'Tata',
    type: 'car',
    battery_capacity_kwh: 52,
    full_range_km: 385,
    charging_speed_kw: 69.3,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'tata-tiago-ev',
    name: 'Tiago EV',
    brand: 'Tata',
    type: 'car',
    battery_capacity_kwh: 24,
    full_range_km: 250,
    charging_speed_kw: 24,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'tata-punch-ev',
    name: 'Punch EV',
    brand: 'Tata',
    type: 'car',
    battery_capacity_kwh: 30,
    full_range_km: 315,
    charging_speed_kw: 31,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'tata-tigor-ev',
    name: 'Tigor EV',
    brand: 'Tata',
    type: 'car',
    battery_capacity_kwh: 26,
    full_range_km: 280,
    charging_speed_kw: 24,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'tata-curvv-ev',
    name: 'Curvv EV',
    brand: 'Tata',
    type: 'car',
    battery_capacity_kwh: 55,
    full_range_km: 430,
    charging_speed_kw: 66,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'tata-harrier-ev',
    name: 'Harrier EV',
    brand: 'Tata',
    type: 'car',
    battery_capacity_kwh: 60,
    full_range_km: 420,
    charging_speed_kw: 75,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mg-zs-ev',
    name: 'ZS EV',
    brand: 'MG',
    type: 'car',
    battery_capacity_kwh: 50.3,
    full_range_km: 340,
    charging_speed_kw: 62.9,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mg-comet-ev',
    name: 'Comet EV',
    brand: 'MG',
    type: 'car',
    battery_capacity_kwh: 35,
    full_range_km: 305,
    charging_speed_kw: 40.4,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mg-windsor-ev',
    name: 'Windsor EV',
    brand: 'MG',
    type: 'car',
    battery_capacity_kwh: 50,
    full_range_km: 375,
    charging_speed_kw: 60,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mg-atto3',
    name: 'Atto 3',
    brand: 'MG',
    type: 'car',
    battery_capacity_kwh: 60.8,
    full_range_km: 420,
    charging_speed_kw: 81.1,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mg-cyberster',
    name: 'Cyberster',
    brand: 'MG',
    type: 'car',
    battery_capacity_kwh: 84,
    full_range_km: 550,
    charging_speed_kw: 126,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mg-m9-ev',
    name: 'M9 EV',
    brand: 'MG',
    type: 'car',
    battery_capacity_kwh: 101,
    full_range_km: 620,
    charging_speed_kw: 173.1,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mahindra-xuv400',
    name: 'XUV400',
    brand: 'Mahindra',
    type: 'car',
    battery_capacity_kwh: 40,
    full_range_km: 289,
    charging_speed_kw: 36.9,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mahindra-xuv400-pro',
    name: 'XUV400 Pro Range',
    brand: 'Mahindra',
    type: 'car',
    battery_capacity_kwh: 45,
    full_range_km: 360,
    charging_speed_kw: 45,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mahindra-be6',
    name: 'BE 6',
    brand: 'Mahindra',
    type: 'car',
    battery_capacity_kwh: 59,
    full_range_km: 450,
    charging_speed_kw: 77,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mahindra-xev9e',
    name: 'XEV 9e',
    brand: 'Mahindra',
    type: 'car',
    battery_capacity_kwh: 60,
    full_range_km: 460,
    charging_speed_kw: 80,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mahindra-xev4e',
    name: 'XEV 4e',
    brand: 'Mahindra',
    type: 'car',
    battery_capacity_kwh: 45,
    full_range_km: 380,
    charging_speed_kw: 49.1,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'hyundai-kona-ev',
    name: 'Kona EV',
    brand: 'Hyundai',
    type: 'car',
    battery_capacity_kwh: 39.2,
    full_range_km: 289,
    charging_speed_kw: 39.2,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'hyundai-creta-ev',
    name: 'Creta EV',
    brand: 'Hyundai',
    type: 'car',
    battery_capacity_kwh: 50,
    full_range_km: 420,
    charging_speed_kw: 60,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'citroen-ec3',
    name: 'eC3',
    brand: 'Citroen',
    type: 'car',
    battery_capacity_kwh: 30.2,
    full_range_km: 250,
    charging_speed_kw: 36.2,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'kia-ev6',
    name: 'EV6',
    brand: 'Kia',
    type: 'car',
    battery_capacity_kwh: 58,
    full_range_km: 384,
    charging_speed_kw: 82.9,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'kia-ev9',
    name: 'EV9',
    brand: 'Kia',
    type: 'car',
    battery_capacity_kwh: 99.8,
    full_range_km: 560,
    charging_speed_kw: 157.6,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'kia-carens-clavis-ev',
    name: 'Carens Clavis EV',
    brand: 'Kia',
    type: 'car',
    battery_capacity_kwh: 55,
    full_range_km: 440,
    charging_speed_kw: 68.8,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'bmw-i4',
    name: 'i4',
    brand: 'BMW',
    type: 'car',
    battery_capacity_kwh: 81.5,
    full_range_km: 450,
    charging_speed_kw: 128.7,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'bmw-ix',
    name: 'iX',
    brand: 'BMW',
    type: 'car',
    battery_capacity_kwh: 111,
    full_range_km: 500,
    charging_speed_kw: 190.3,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'bmw-i7',
    name: 'i7',
    brand: 'BMW',
    type: 'car',
    battery_capacity_kwh: 111.5,
    full_range_km: 520,
    charging_speed_kw: 196.8,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'byd-atto3',
    name: 'Atto 3',
    brand: 'BYD',
    type: 'car',
    battery_capacity_kwh: 60.8,
    full_range_km: 420,
    charging_speed_kw: 81.1,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'byd-seal',
    name: 'Seal',
    brand: 'BYD',
    type: 'car',
    battery_capacity_kwh: 44.9,
    full_range_km: 450,
    charging_speed_kw: 51.8,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'byd-sealion-7',
    name: 'Sealion 7',
    brand: 'BYD',
    type: 'car',
    battery_capacity_kwh: 82.5,
    full_range_km: 550,
    charging_speed_kw: 117.9,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'audi-etron-gt',
    name: 'e-tron GT',
    brand: 'Audi',
    type: 'car',
    battery_capacity_kwh: 93,
    full_range_km: 520,
    charging_speed_kw: 146.8,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'audi-q6-etron',
    name: 'Q6 e-tron',
    brand: 'Audi',
    type: 'car',
    battery_capacity_kwh: 100,
    full_range_km: 560,
    charging_speed_kw: 166.7,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'volvo-xc40-recharge',
    name: 'XC40 Recharge',
    brand: 'Volvo',
    type: 'car',
    battery_capacity_kwh: 75,
    full_range_km: 450,
    charging_speed_kw: 112.5,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'volvo-c40-recharge',
    name: 'C40 Recharge',
    brand: 'Volvo',
    type: 'car',
    battery_capacity_kwh: 78,
    full_range_km: 480,
    charging_speed_kw: 120,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mercedes-eqa',
    name: 'EQA',
    brand: 'Mercedes-Benz',
    type: 'car',
    battery_capacity_kwh: 60,
    full_range_km: 400,
    charging_speed_kw: 80,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mercedes-eqb',
    name: 'EQB',
    brand: 'Mercedes-Benz',
    type: 'car',
    battery_capacity_kwh: 66.5,
    full_range_km: 420,
    charging_speed_kw: 95,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mercedes-eqe',
    name: 'EQE',
    brand: 'Mercedes-Benz',
    type: 'car',
    battery_capacity_kwh: 90,
    full_range_km: 520,
    charging_speed_kw: 142.1,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'mercedes-eqs',
    name: 'EQS 580 4MATIC',
    brand: 'Mercedes-Benz',
    type: 'car',
    battery_capacity_kwh: 120,
    full_range_km: 600,
    charging_speed_kw: 225,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'porsche-taycan',
    name: 'Taycan',
    brand: 'Porsche',
    type: 'car',
    battery_capacity_kwh: 93.3,
    full_range_km: 530,
    charging_speed_kw: 223.9,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'rolls-royce-spectre',
    name: 'Spectre',
    brand: 'Rolls-Royce',
    type: 'car',
    battery_capacity_kwh: 120,
    full_range_km: 580,
    charging_speed_kw: 225,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'jaguar-i-pace',
    name: 'I-PACE',
    brand: 'Jaguar',
    type: 'car',
    battery_capacity_kwh: 84.7,
    full_range_km: 470,
    charging_speed_kw: 127.1,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'nissan-leaf',
    name: 'Leaf',
    brand: 'Nissan',
    type: 'car',
    battery_capacity_kwh: 62,
    full_range_km: 385,
    charging_speed_kw: 74.4,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'vayve-eva',
    name: 'Eva',
    brand: 'Vayve',
    type: 'car',
    battery_capacity_kwh: 28,
    full_range_km: 280,
    charging_speed_kw: 27.1,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'toyota-urban-cruiser',
    name: 'Urban Cruiser EV',
    brand: 'Toyota',
    type: 'car',
    battery_capacity_kwh: 50,
    full_range_km: 400,
    charging_speed_kw: 60,
    charger_type_supported: ['AC', 'DC'],
    connector_type: 'Type 2',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'revolt-rv400',
    name: 'RV400',
    brand: 'Revolt',
    type: 'bike',
    battery_capacity_kwh: 3.24,
    full_range_km: 150,
    charging_speed_kw: 9.7,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'revolt-rv400-max',
    name: 'RV400 Max',
    brand: 'Revolt',
    type: 'bike',
    battery_capacity_kwh: 4.5,
    full_range_km: 200,
    charging_speed_kw: 15,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'tork-kratos',
    name: 'Kratos',
    brand: 'Tork',
    type: 'bike',
    battery_capacity_kwh: 7.2,
    full_range_km: 100,
    charging_speed_kw: 17.3,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'tork-kratos-r',
    name: 'Kratos R',
    brand: 'Tork',
    type: 'bike',
    battery_capacity_kwh: 9,
    full_range_km: 150,
    charging_speed_kw: 24.5,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'ultraviolette-f77',
    name: 'F77',
    brand: 'Ultraviolette',
    type: 'bike',
    battery_capacity_kwh: 10.3,
    full_range_km: 150,
    charging_speed_kw: 17.7,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'ultraviolette-f77-raptor',
    name: 'F77 Raptor',
    brand: 'Ultraviolette',
    type: 'bike',
    battery_capacity_kwh: 12,
    full_range_km: 180,
    charging_speed_kw: 22.5,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'oben-rorr',
    name: 'Rorr',
    brand: 'Oben',
    type: 'bike',
    battery_capacity_kwh: 5.5,
    full_range_km: 120,
    charging_speed_kw: 11.8,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'oben-rorr-s',
    name: 'Rorr S',
    brand: 'Oben',
    type: 'bike',
    battery_capacity_kwh: 6.5,
    full_range_km: 140,
    charging_speed_kw: 15,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'hop-oxo',
    name: 'OXO',
    brand: 'Hop Electric',
    type: 'bike',
    battery_capacity_kwh: 5,
    full_range_km: 110,
    charging_speed_kw: 10,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'kabira-km3000',
    name: 'KM3000',
    brand: 'Kabira',
    type: 'bike',
    battery_capacity_kwh: 6,
    full_range_km: 130,
    charging_speed_kw: 13.3,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'kabira-km4000',
    name: 'KM4000',
    brand: 'Kabira',
    type: 'bike',
    battery_capacity_kwh: 7.5,
    full_range_km: 160,
    charging_speed_kw: 18.8,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'matter-aera',
    name: 'Aera 5000+',
    brand: 'Matter',
    type: 'bike',
    battery_capacity_kwh: 8,
    full_range_km: 140,
    charging_speed_kw: 18.5,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'odysse-evoqis',
    name: 'Evoqis',
    brand: 'Odysse',
    type: 'bike',
    battery_capacity_kwh: 5.5,
    full_range_km: 120,
    charging_speed_kw: 11.8,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'pure-etryst',
    name: 'eTryst 350',
    brand: 'Pure EV',
    type: 'bike',
    battery_capacity_kwh: 6,
    full_range_km: 130,
    charging_speed_kw: 13.3,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'hero-lectro-c5i',
    name: 'Lectro C5i',
    brand: 'Hero',
    type: 'bike',
    battery_capacity_kwh: 4.4,
    full_range_km: 130,
    charging_speed_kw: 8.8,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'bajaj-chetak-premium',
    name: 'Chetak Premium',
    brand: 'Bajaj',
    type: 'bike',
    battery_capacity_kwh: 4,
    full_range_km: 130,
    charging_speed_kw: 8.6,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: bikeImage
  },
  {
    id: 'ola-s1-pro',
    name: 'S1 Pro',
    brand: 'Ola Electric',
    type: 'scooter',
    battery_capacity_kwh: 3.97,
    full_range_km: 181,
    charging_speed_kw: 13.2,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'ola-s1-pro-plus',
    name: 'S1 Pro Plus',
    brand: 'Ola Electric',
    type: 'scooter',
    battery_capacity_kwh: 4.56,
    full_range_km: 220,
    charging_speed_kw: 17.1,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'ola-s1-air',
    name: 'S1 Air',
    brand: 'Ola Electric',
    type: 'scooter',
    battery_capacity_kwh: 3.68,
    full_range_km: 165,
    charging_speed_kw: 11.6,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'ather-450x',
    name: '450X',
    brand: 'Ather',
    type: 'scooter',
    battery_capacity_kwh: 3.7,
    full_range_km: 146,
    charging_speed_kw: 11.1,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'ather-450s',
    name: '450S',
    brand: 'Ather',
    type: 'scooter',
    battery_capacity_kwh: 2.88,
    full_range_km: 108,
    charging_speed_kw: 6.9,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'ather-450-apex',
    name: '450 Apex',
    brand: 'Ather',
    type: 'scooter',
    battery_capacity_kwh: 3.7,
    full_range_km: 145,
    charging_speed_kw: 11.1,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'ather-450-pro',
    name: '450 Pro',
    brand: 'Ather',
    type: 'scooter',
    battery_capacity_kwh: 3.7,
    full_range_km: 140,
    charging_speed_kw: 10.6,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'tvs-iqube',
    name: 'iQube',
    brand: 'TVS',
    type: 'scooter',
    battery_capacity_kwh: 3.4,
    full_range_km: 150,
    charging_speed_kw: 11.3,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'tvs-iqube-st',
    name: 'iQube ST',
    brand: 'TVS',
    type: 'scooter',
    battery_capacity_kwh: 3.4,
    full_range_km: 145,
    charging_speed_kw: 11.3,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'bajaj-chetak',
    name: 'Chetak',
    brand: 'Bajaj',
    type: 'scooter',
    battery_capacity_kwh: 3.9,
    full_range_km: 140,
    charging_speed_kw: 11.7,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'bajaj-chetak-cruiser',
    name: 'Chetak Cruiser',
    brand: 'Bajaj',
    type: 'scooter',
    battery_capacity_kwh: 4.8,
    full_range_km: 165,
    charging_speed_kw: 16,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'simple-one',
    name: 'One',
    brand: 'Simple Energy',
    type: 'scooter',
    battery_capacity_kwh: 3.5,
    full_range_km: 140,
    charging_speed_kw: 11.1,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'hero-vida-v1-pro',
    name: 'Vida V1 Pro',
    brand: 'Hero',
    type: 'scooter',
    battery_capacity_kwh: 3.44,
    full_range_km: 150,
    charging_speed_kw: 11.5,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'hero-vida-v1-plus',
    name: 'Vida V1 Plus',
    brand: 'Hero',
    type: 'scooter',
    battery_capacity_kwh: 3.9,
    full_range_km: 180,
    charging_speed_kw: 14.6,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'hero-lectro-pro',
    name: 'Lectro Pro',
    brand: 'Hero',
    type: 'scooter',
    battery_capacity_kwh: 3.7,
    full_range_km: 160,
    charging_speed_kw: 12.3,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'piaggio-vespa-prima',
    name: 'Vespa Primavera',
    brand: 'Piaggio',
    type: 'scooter',
    battery_capacity_kwh: 4.2,
    full_range_km: 160,
    charging_speed_kw: 13.3,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'ampere-reo-elite',
    name: 'Reo Elite',
    brand: 'Ampere',
    type: 'scooter',
    battery_capacity_kwh: 3.2,
    full_range_km: 120,
    charging_speed_kw: 8.7,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'ampere-reo-pro',
    name: 'Reo Pro',
    brand: 'Ampere',
    type: 'scooter',
    battery_capacity_kwh: 3.8,
    full_range_km: 140,
    charging_speed_kw: 11.4,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'bgauss-d15',
    name: 'D15',
    brand: 'BGauss',
    type: 'scooter',
    battery_capacity_kwh: 3.5,
    full_range_km: 130,
    charging_speed_kw: 10,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'bgauss-c12i-ex',
    name: 'C12i EX',
    brand: 'BGauss',
    type: 'scooter',
    battery_capacity_kwh: 3.8,
    full_range_km: 145,
    charging_speed_kw: 11.4,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'bgauss-ruv-350',
    name: 'RUV 350',
    brand: 'BGauss',
    type: 'scooter',
    battery_capacity_kwh: 4.5,
    full_range_km: 170,
    charging_speed_kw: 15,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'lml-star',
    name: 'Star Electric',
    brand: 'LML',
    type: 'scooter',
    battery_capacity_kwh: 3.5,
    full_range_km: 130,
    charging_speed_kw: 10,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'okinawa-okhi-90',
    name: 'Okhi 90',
    brand: 'Okinawa',
    type: 'scooter',
    battery_capacity_kwh: 3.5,
    full_range_km: 135,
    charging_speed_kw: 10.5,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'okinawa-praise-pro',
    name: 'PraisePro',
    brand: 'Okinawa',
    type: 'scooter',
    battery_capacity_kwh: 4,
    full_range_km: 150,
    charging_speed_kw: 13.3,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'bounce-infinity-e1',
    name: 'Infinity E1',
    brand: 'Bounce',
    type: 'scooter',
    battery_capacity_kwh: 3.5,
    full_range_km: 130,
    charging_speed_kw: 10.5,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'hero-electric-optima',
    name: 'Optima CX',
    brand: 'Hero Electric',
    type: 'scooter',
    battery_capacity_kwh: 3.2,
    full_range_km: 125,
    charging_speed_kw: 8.7,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'hero-electric-photon',
    name: 'Photon HX',
    brand: 'Hero Electric',
    type: 'scooter',
    battery_capacity_kwh: 3.5,
    full_range_km: 135,
    charging_speed_kw: 10.5,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'hero-electric-nyx',
    name: 'NYX HX',
    brand: 'Hero Electric',
    type: 'scooter',
    battery_capacity_kwh: 3.8,
    full_range_km: 145,
    charging_speed_kw: 12,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'hero-electric-flash',
    name: 'Flash LX',
    brand: 'Hero Electric',
    type: 'scooter',
    battery_capacity_kwh: 3,
    full_range_km: 110,
    charging_speed_kw: 7.5,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'quantum-milan',
    name: 'Milan',
    brand: 'Quantum Energy',
    type: 'scooter',
    battery_capacity_kwh: 3.3,
    full_range_km: 128,
    charging_speed_kw: 9.4,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'quantum-plasma',
    name: 'Plasma',
    brand: 'Quantum Energy',
    type: 'scooter',
    battery_capacity_kwh: 3.6,
    full_range_km: 138,
    charging_speed_kw: 10.8,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'quantum-elektron',
    name: 'Elektron',
    brand: 'Quantum Energy',
    type: 'scooter',
    battery_capacity_kwh: 4,
    full_range_km: 155,
    charging_speed_kw: 13.3,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'joy-wolf-plus',
    name: 'Wolf+',
    brand: 'Joy e-Bike',
    type: 'scooter',
    battery_capacity_kwh: 3.5,
    full_range_km: 132,
    charging_speed_kw: 10.5,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'joy-gen-nxt',
    name: 'Gen Nxt Nanu',
    brand: 'Joy e-Bike',
    type: 'scooter',
    battery_capacity_kwh: 3.2,
    full_range_km: 122,
    charging_speed_kw: 8.7,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  },
  {
    id: 'joy-mihos',
    name: 'Mihos',
    brand: 'Joy e-Bike',
    type: 'scooter',
    battery_capacity_kwh: 3.8,
    full_range_km: 148,
    charging_speed_kw: 12,
    charger_type_supported: ['AC'],
    connector_type: 'Type 2',
    image_url: scooterImage
  }
];

const BASE_LAT = 13.0067;
const BASE_LNG = 80.2206;

// Real charging stations from Excel
export const MOCK_STATIONS: Station[] = [
  { id: 'tata-power-guindy', name: 'Tata Power Guindy', address: 'Tata Power Guindy, Chennai', latitude: 13.0046, longitude: 80.246, charger_power_kw: 60, charger_type: 'DC', connector_type: 'CCS2', price_per_unit: 8.5, status: 'available', reliability_score: 95, queue_wait_minutes: 0 },
  { id: 'ather-grid-saidapet', name: 'Ather Grid Saidapet', address: 'Ather Grid Saidapet, Chennai', latitude: 13.025, longitude: 80.215, charger_power_kw: 50, charger_type: 'DC', connector_type: 'CCS2', price_per_unit: 8.8, status: 'available', reliability_score: 95, queue_wait_minutes: 0 },
  { id: 'kabali-ev-hub', name: 'Kabali EV Hub', address: 'Kabali EV Hub, Chennai', latitude: 13.05, longitude: 80.25, charger_power_kw: 40, charger_type: 'AC', connector_type: 'Type 2', price_per_unit: 8.2, status: 'available', reliability_score: 95, queue_wait_minutes: 0 },
  { id: 'ev-matrix-kilpauk', name: 'EV Matrix Kilpauk', address: 'EV Matrix Kilpauk, Chennai', latitude: 13.01, longitude: 80.26, charger_power_kw: 55, charger_type: 'DC', connector_type: 'CCS2', price_per_unit: 8.9, status: 'available', reliability_score: 95, queue_wait_minutes: 0 },
  { id: 'exicom-chetpet', name: 'Exicom Chetpet', address: 'Exicom Chetpet, Chennai', latitude: 13.03, longitude: 80.24, charger_power_kw: 45, charger_type: 'AC', connector_type: 'Type 2', price_per_unit: 9.1, status: 'available', reliability_score: 95, queue_wait_minutes: 0 },
  { id: 'e-charger-perambur', name: 'E-Charger Perambur', address: 'E-Charger Perambur, Chennai', latitude: 13.06, longitude: 80.27, charger_power_kw: 65, charger_type: 'DC', connector_type: 'CCS2', price_per_unit: 8.6, status: 'available', reliability_score: 95, queue_wait_minutes: 0 },
  { id: 'ev-dash-velachery', name: 'EV Dash Velachery', address: 'EV Dash Velachery, Chennai', latitude: 12.97, longitude: 80.21, charger_power_kw: 50, charger_type: 'DC', connector_type: 'CCS2', price_per_unit: 8.7, status: 'available', reliability_score: 95, queue_wait_minutes: 0 },
  { id: 'charge-hub-mylapore', name: 'ChargeHub Mylapore', address: 'ChargeHub Mylapore, Chennai', latitude: 13.04, longitude: 80.27, charger_power_kw: 55, charger_type: 'AC', connector_type: 'Type 2', price_per_unit: 8.4, status: 'available', reliability_score: 95, queue_wait_minutes: 0 },
  { id: 's1', name: 'Ather Grid - Phoenix Marketcity', address: 'Velachery Main Rd, Chennai', latitude: BASE_LAT + 0.01, longitude: BASE_LNG + 0.01, charger_power_kw: 3.3, charger_type: 'DC', connector_type: 'Ather Grid', price_per_unit: 15, status: 'available', reliability_score: 98, queue_wait_minutes: 0 }
];

export const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

export const calculateChargeTime = (currentSoc: number, targetSoc: number, batteryKwh: number, chargerPowerKw: number) => {
  if (currentSoc >= targetSoc) return 0;
  const neededKwh = ((targetSoc - currentSoc) / 100) * batteryKwh;
  return Math.ceil((neededKwh / chargerPowerKw) * 60);
};

export const OLA_SERVICE_CENTERS: Station[] = [
  { id: 'ola_sc_1', name: 'Ola Experience Center - Velachery', address: '100 Feet Road, Velachery, Chennai', latitude: 13.0012, longitude: 80.2180, charger_power_kw: 3.3, charger_type: 'AC', connector_type: 'Type 2', price_per_unit: 0, status: 'available', reliability_score: 100, queue_wait_minutes: 0 },
  { id: 'ola_sc_2', name: 'Ola Showroom - Anna Nagar', address: '2nd Avenue, Anna Nagar, Chennai', latitude: 13.0827, longitude: 80.2089, charger_power_kw: 3.3, charger_type: 'AC', connector_type: 'Type 2', price_per_unit: 0, status: 'available', reliability_score: 100, queue_wait_minutes: 0 },
  { id: 'ola_sc_3', name: 'Ola Service Center - Guindy', address: 'Mount Poonamallee Road, Guindy, Chennai', latitude: 13.0100, longitude: 80.2150, charger_power_kw: 3.3, charger_type: 'AC', connector_type: 'Type 2', price_per_unit: 0, status: 'available', reliability_score: 100, queue_wait_minutes: 0 },
  { id: 'ola_sc_4', name: 'Ola Experience Center - T Nagar', address: 'Pondy Bazaar, T Nagar, Chennai', latitude: 13.0416, longitude: 80.2339, charger_power_kw: 3.3, charger_type: 'AC', connector_type: 'Type 2', price_per_unit: 0, status: 'available', reliability_score: 100, queue_wait_minutes: 0 },
  { id: 'ola_sc_5', name: 'Ola Service Center - Porur', address: 'Mount Poonamallee High Road, Porur, Chennai', latitude: 13.0382, longitude: 80.1584, charger_power_kw: 3.3, charger_type: 'AC', connector_type: 'Type 2', price_per_unit: 0, status: 'available', reliability_score: 100, queue_wait_minutes: 0 },
  { id: 'ola_sc_6', name: 'Ola Showroom - OMR', address: 'Sholinganallur, OMR, Chennai', latitude: 12.9010, longitude: 80.2279, charger_power_kw: 3.3, charger_type: 'AC', connector_type: 'Type 2', price_per_unit: 0, status: 'available', reliability_score: 100, queue_wait_minutes: 0 },
  { id: 'ola_sc_7', name: 'Ola Experience Center - Adyar', address: 'LB Road, Adyar, Chennai', latitude: 13.0059, longitude: 80.2577, charger_power_kw: 3.3, charger_type: 'AC', connector_type: 'Type 2', price_per_unit: 0, status: 'available', reliability_score: 100, queue_wait_minutes: 0 }
];

export const getOlaServiceCenters = (userLat: number, userLng: number): Station[] => {
  return OLA_SERVICE_CENTERS.map(center => ({
    ...center,
    distance_km: haversineDistance(userLat, userLng, center.latitude, center.longitude)
  }));
};

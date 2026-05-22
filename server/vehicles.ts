export interface Vehicle {
  id: string;
  name: string;
  type: "scooter" | "bike" | "car";
  brand: string;
  battery_capacity_kwh: number;
  full_range_km: number;
  charging_speed_kw: number;
  charger_type_supported: ("AC" | "DC")[];
  connector_type: "Type 2" | "CCS2" | "Ather Grid" | "Bharat AC001" | "Unknown";
  image_url: string;
}

// Universal images per vehicle type
const IMG_CAR = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800";
const IMG_BIKE = "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800";
const IMG_SCOOTER = "https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&q=80&w=800";

export const VEHICLES: Vehicle[] = [
  // ==========================================
  // CARS (India Market)
  // ==========================================

  // TATA MOTORS
  { id: "tata-nexon-ev-mr", name: "Nexon.ev Medium Range", brand: "Tata", type: "car", battery_capacity_kwh: 30.0, full_range_km: 325, charging_speed_kw: 30, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "tata-nexon-ev-lr", name: "Nexon.ev Long Range", brand: "Tata", type: "car", battery_capacity_kwh: 40.5, full_range_km: 465, charging_speed_kw: 50, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "tata-nexon-ev-45", name: "Nexon.ev 45 (Red Dark)", brand: "Tata", type: "car", battery_capacity_kwh: 45.0, full_range_km: 489, charging_speed_kw: 60, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "tata-punch-ev-mr", name: "Punch.ev Medium Range", brand: "Tata", type: "car", battery_capacity_kwh: 25.0, full_range_km: 315, charging_speed_kw: 30, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "tata-punch-ev-lr", name: "Punch.ev Long Range", brand: "Tata", type: "car", battery_capacity_kwh: 35.0, full_range_km: 421, charging_speed_kw: 50, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "tata-tiago-ev-mr", name: "Tiago.ev Medium Range", brand: "Tata", type: "car", battery_capacity_kwh: 19.2, full_range_km: 250, charging_speed_kw: 25, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "tata-tiago-ev-lr", name: "Tiago.ev Long Range", brand: "Tata", type: "car", battery_capacity_kwh: 24.0, full_range_km: 315, charging_speed_kw: 25, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "tata-tigor-ev", name: "Tigor.ev", brand: "Tata", type: "car", battery_capacity_kwh: 26.0, full_range_km: 315, charging_speed_kw: 25, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "tata-curvv-ev-45", name: "Curvv.ev 45", brand: "Tata", type: "car", battery_capacity_kwh: 45.0, full_range_km: 502, charging_speed_kw: 70, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "tata-curvv-ev-55", name: "Curvv.ev 55", brand: "Tata", type: "car", battery_capacity_kwh: 55.0, full_range_km: 585, charging_speed_kw: 70, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },

  // MAHINDRA
  { id: "mahindra-xuv400-ec", name: "XUV400 EC Pro", brand: "Mahindra", type: "car", battery_capacity_kwh: 34.5, full_range_km: 375, charging_speed_kw: 50, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "mahindra-xuv400-el", name: "XUV400 EL Pro", brand: "Mahindra", type: "car", battery_capacity_kwh: 39.4, full_range_km: 456, charging_speed_kw: 50, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "mahindra-be-6e-59", name: "BE 6e (59 kWh)", brand: "Mahindra", type: "car", battery_capacity_kwh: 59.0, full_range_km: 550, charging_speed_kw: 175, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "mahindra-be-6e-79", name: "BE 6e (79 kWh)", brand: "Mahindra", type: "car", battery_capacity_kwh: 79.0, full_range_km: 682, charging_speed_kw: 175, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "mahindra-xev-9e-59", name: "XEV 9e (59 kWh)", brand: "Mahindra", type: "car", battery_capacity_kwh: 59.0, full_range_km: 539, charging_speed_kw: 175, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "mahindra-xev-9e-79", name: "XEV 9e (79 kWh)", brand: "Mahindra", type: "car", battery_capacity_kwh: 79.0, full_range_km: 671, charging_speed_kw: 175, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },

  // MG MOTORS
  { id: "mg-zs-ev", name: "ZS EV", brand: "MG", type: "car", battery_capacity_kwh: 50.3, full_range_km: 461, charging_speed_kw: 80, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "mg-comet-ev", name: "Comet EV", brand: "MG", type: "car", battery_capacity_kwh: 17.3, full_range_km: 230, charging_speed_kw: 3.3, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_CAR },
  { id: "mg-windsor-ev", name: "Windsor EV", brand: "MG", type: "car", battery_capacity_kwh: 38.0, full_range_km: 331, charging_speed_kw: 45, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },

  // BYD
  { id: "byd-atto-3-dynamic", name: "Atto 3 Dynamic", brand: "BYD", type: "car", battery_capacity_kwh: 49.92, full_range_km: 468, charging_speed_kw: 70, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "byd-atto-3-premium", name: "Atto 3 Premium/Superior", brand: "BYD", type: "car", battery_capacity_kwh: 60.48, full_range_km: 521, charging_speed_kw: 80, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "byd-seal-dynamic", name: "Seal Dynamic", brand: "BYD", type: "car", battery_capacity_kwh: 61.44, full_range_km: 510, charging_speed_kw: 110, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "byd-seal-premium", name: "Seal Premium", brand: "BYD", type: "car", battery_capacity_kwh: 82.56, full_range_km: 650, charging_speed_kw: 150, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "byd-seal-performance", name: "Seal Performance (AWD)", brand: "BYD", type: "car", battery_capacity_kwh: 82.56, full_range_km: 580, charging_speed_kw: 150, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "byd-e6", name: "e6", brand: "BYD", type: "car", battery_capacity_kwh: 71.7, full_range_km: 520, charging_speed_kw: 60, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },

  // HYUNDAI / KIA
  { id: "hyundai-ioniq-5", name: "Ioniq 5", brand: "Hyundai", type: "car", battery_capacity_kwh: 72.6, full_range_km: 631, charging_speed_kw: 350, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "hyundai-kona-ev", name: "Kona Electric", brand: "Hyundai", type: "car", battery_capacity_kwh: 39.2, full_range_km: 452, charging_speed_kw: 50, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "kia-ev6", name: "EV6 GT-Line", brand: "Kia", type: "car", battery_capacity_kwh: 77.4, full_range_km: 708, charging_speed_kw: 350, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "kia-ev9", name: "EV9", brand: "Kia", type: "car", battery_capacity_kwh: 99.8, full_range_km: 561, charging_speed_kw: 240, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },

  // LUXURY BRANDS
  { id: "bmw-ix1", name: "iX1", brand: "BMW", type: "car", battery_capacity_kwh: 66.4, full_range_km: 440, charging_speed_kw: 130, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "bmw-i4", name: "i4", brand: "BMW", type: "car", battery_capacity_kwh: 83.9, full_range_km: 590, charging_speed_kw: 205, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "bmw-ix", name: "iX xDrive50", brand: "BMW", type: "car", battery_capacity_kwh: 111.5, full_range_km: 635, charging_speed_kw: 195, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "bmw-i7", name: "i7 xDrive60", brand: "BMW", type: "car", battery_capacity_kwh: 101.7, full_range_km: 625, charging_speed_kw: 195, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "mercedes-eqa", name: "EQA 250+", brand: "Mercedes-Benz", type: "car", battery_capacity_kwh: 70.5, full_range_km: 560, charging_speed_kw: 100, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "mercedes-eqb", name: "EQB 350 4MATIC", brand: "Mercedes-Benz", type: "car", battery_capacity_kwh: 66.5, full_range_km: 423, charging_speed_kw: 100, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "mercedes-eqe-suv", name: "EQE SUV 500 4MATIC", brand: "Mercedes-Benz", type: "car", battery_capacity_kwh: 90.5, full_range_km: 550, charging_speed_kw: 170, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "mercedes-eqs-580", name: "EQS 580 4MATIC", brand: "Mercedes-Benz", type: "car", battery_capacity_kwh: 107.8, full_range_km: 857, charging_speed_kw: 200, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "audi-q8-etron", name: "Q8 e-tron", brand: "Audi", type: "car", battery_capacity_kwh: 95.0, full_range_km: 582, charging_speed_kw: 170, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "audi-etron-gt", name: "e-tron GT", brand: "Audi", type: "car", battery_capacity_kwh: 93.4, full_range_km: 500, charging_speed_kw: 270, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "volvo-xc40-recharge", name: "XC40 Recharge", brand: "Volvo", type: "car", battery_capacity_kwh: 69.0, full_range_km: 475, charging_speed_kw: 150, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "volvo-c40-recharge", name: "C40 Recharge", brand: "Volvo", type: "car", battery_capacity_kwh: 78.0, full_range_km: 530, charging_speed_kw: 150, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "porsche-taycan", name: "Taycan", brand: "Porsche", type: "car", battery_capacity_kwh: 93.4, full_range_km: 484, charging_speed_kw: 270, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },
  { id: "rolls-royce-spectre", name: "Spectre", brand: "Rolls-Royce", type: "car", battery_capacity_kwh: 102.0, full_range_km: 530, charging_speed_kw: 195, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_CAR },

  // ==========================================
  // TWO-WHEELERS (India Market)
  // ==========================================

  // ATHER ENERGY (Comprehensive Lineup)
  { id: "ather-450s", name: "450S", brand: "Ather", type: "scooter", battery_capacity_kwh: 2.9, full_range_km: 115, charging_speed_kw: 3.0, charger_type_supported: ["AC"], connector_type: "Ather Grid", image_url: IMG_SCOOTER },
  { id: "ather-450x-2-9", name: "450X (2.9 kWh)", brand: "Ather", type: "scooter", battery_capacity_kwh: 2.9, full_range_km: 111, charging_speed_kw: 3.0, charger_type_supported: ["AC"], connector_type: "Ather Grid", image_url: IMG_SCOOTER },
  { id: "ather-450x-3-7", name: "450X (3.7 kWh)", brand: "Ather", type: "scooter", battery_capacity_kwh: 3.7, full_range_km: 150, charging_speed_kw: 3.0, charger_type_supported: ["AC"], connector_type: "Ather Grid", image_url: IMG_SCOOTER },
  { id: "ather-rizta-s-2-9", name: "Rizta S (2.9 kWh)", brand: "Ather", type: "scooter", battery_capacity_kwh: 2.9, full_range_km: 123, charging_speed_kw: 3.0, charger_type_supported: ["AC"], connector_type: "Ather Grid", image_url: IMG_SCOOTER },
  { id: "ather-rizta-z-2-9", name: "Rizta Z (2.9 kWh)", brand: "Ather", type: "scooter", battery_capacity_kwh: 2.9, full_range_km: 123, charging_speed_kw: 3.0, charger_type_supported: ["AC"], connector_type: "Ather Grid", image_url: IMG_SCOOTER },
  { id: "ather-rizta-z-3-7", name: "Rizta Z (3.7 kWh)", brand: "Ather", type: "scooter", battery_capacity_kwh: 3.7, full_range_km: 160, charging_speed_kw: 3.0, charger_type_supported: ["AC"], connector_type: "Ather Grid", image_url: IMG_SCOOTER },
  { id: "ather-450-apex", name: "450 Apex", brand: "Ather", type: "scooter", battery_capacity_kwh: 3.7, full_range_km: 157, charging_speed_kw: 3.0, charger_type_supported: ["AC"], connector_type: "Ather Grid", image_url: IMG_SCOOTER },

  // OLA ELECTRIC
  { id: "ola-s1-x-2", name: "S1 X (2 kWh)", brand: "Ola", type: "scooter", battery_capacity_kwh: 2.0, full_range_km: 95, charging_speed_kw: 0.5, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_SCOOTER },
  { id: "ola-s1-x-3", name: "S1 X (3 kWh)", brand: "Ola", type: "scooter", battery_capacity_kwh: 3.0, full_range_km: 143, charging_speed_kw: 0.5, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_SCOOTER },
  { id: "ola-s1-x-4", name: "S1 X (4 kWh)", brand: "Ola", type: "scooter", battery_capacity_kwh: 4.0, full_range_km: 190, charging_speed_kw: 0.5, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_SCOOTER },
  { id: "ola-s1-air", name: "S1 Air", brand: "Ola", type: "scooter", battery_capacity_kwh: 3.0, full_range_km: 151, charging_speed_kw: 0.5, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_SCOOTER },
  { id: "ola-s1-pro-g2", name: "S1 Pro (Gen 2)", brand: "Ola", type: "scooter", battery_capacity_kwh: 4.0, full_range_km: 195, charging_speed_kw: 0.5, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_SCOOTER },

  // TVS
  { id: "tvs-iqube-2-2", name: "iQube (2.2 kWh)", brand: "TVS", type: "scooter", battery_capacity_kwh: 2.2, full_range_km: 75, charging_speed_kw: 0.6, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_SCOOTER },
  { id: "tvs-iqube-3-4", name: "iQube (3.4 kWh)", brand: "TVS", type: "scooter", battery_capacity_kwh: 3.4, full_range_km: 100, charging_speed_kw: 0.6, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_SCOOTER },
  { id: "tvs-iqube-st-3-4", name: "iQube ST (3.4 kWh)", brand: "TVS", type: "scooter", battery_capacity_kwh: 3.4, full_range_km: 100, charging_speed_kw: 0.6, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_SCOOTER },
  { id: "tvs-iqube-st-5-1", name: "iQube ST (5.1 kWh)", brand: "TVS", type: "scooter", battery_capacity_kwh: 5.1, full_range_km: 150, charging_speed_kw: 0.9, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_SCOOTER },
  { id: "tvs-x", name: "TVS X", brand: "TVS", type: "scooter", battery_capacity_kwh: 4.4, full_range_km: 140, charging_speed_kw: 3.0, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_SCOOTER },

  // BAJAJ
  { id: "bajaj-chetak-2901", name: "Chetak 2901", brand: "Bajaj", type: "scooter", battery_capacity_kwh: 2.9, full_range_km: 123, charging_speed_kw: 0.6, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_SCOOTER },
  { id: "bajaj-chetak-urbane", name: "Chetak Urbane", brand: "Bajaj", type: "scooter", battery_capacity_kwh: 2.9, full_range_km: 113, charging_speed_kw: 0.6, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_SCOOTER },
  { id: "bajaj-chetak-premium", name: "Chetak Premium", brand: "Bajaj", type: "scooter", battery_capacity_kwh: 3.2, full_range_km: 126, charging_speed_kw: 0.8, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_SCOOTER },

  // HERO VIDA
  { id: "vida-v1-plus", name: "Vida V1 Plus", brand: "Vida", type: "scooter", battery_capacity_kwh: 3.44, full_range_km: 143, charging_speed_kw: 1.2, charger_type_supported: ["AC", "DC"], connector_type: "Type 2", image_url: IMG_SCOOTER },
  { id: "vida-v1-pro", name: "Vida V1 Pro", brand: "Vida", type: "scooter", battery_capacity_kwh: 3.94, full_range_km: 165, charging_speed_kw: 1.2, charger_type_supported: ["AC", "DC"], connector_type: "Type 2", image_url: IMG_SCOOTER },

  // ULTRAVIOLETTE
  { id: "ultraviolette-f77-m2", name: "F77 Mach 2", brand: "Ultraviolette", type: "bike", battery_capacity_kwh: 10.3, full_range_km: 323, charging_speed_kw: 3.3, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },
  { id: "ultraviolette-f77-recon", name: "F77 Recon", brand: "Ultraviolette", type: "bike", battery_capacity_kwh: 7.1, full_range_km: 206, charging_speed_kw: 3.3, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },

  // REVOLT MOTORS
  { id: "revolt-rv400", name: "RV400", brand: "Revolt", type: "bike", battery_capacity_kwh: 3.24, full_range_km: 150, charging_speed_kw: 0.8, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },
  { id: "revolt-rv400-brd", name: "RV400 BRD", brand: "Revolt", type: "bike", battery_capacity_kwh: 3.24, full_range_km: 160, charging_speed_kw: 0.8, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },
  { id: "revolt-rv1", name: "RV1+", brand: "Revolt", type: "bike", battery_capacity_kwh: 1.5, full_range_km: 80, charging_speed_kw: 0.5, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },

  // OBEN ELECTRIC
  { id: "oben-rorr", name: "Oben Rorr", brand: "Oben", type: "bike", battery_capacity_kwh: 4.4, full_range_km: 187, charging_speed_kw: 1.2, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },

  // MATTER
  { id: "matter-aera-5-0", name: "Aera 5000", brand: "Matter", type: "bike", battery_capacity_kwh: 5.0, full_range_km: 125, charging_speed_kw: 1.0, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },
  { id: "matter-aera-5-0-plus", name: "Aera 5000+", brand: "Matter", type: "bike", battery_capacity_kwh: 5.0, full_range_km: 150, charging_speed_kw: 1.0, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },

  // TORK MOTORS
  { id: "tork-kratos", name: "Kratos", brand: "Tork", type: "bike", battery_capacity_kwh: 4.0, full_range_km: 120, charging_speed_kw: 1.2, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },
  { id: "tork-kratos-r", name: "Kratos R", brand: "Tork", type: "bike", battery_capacity_kwh: 4.0, full_range_km: 180, charging_speed_kw: 1.2, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },

  // OLA ELECTRIC (BIKE)
  { id: "ola-roadster-x", name: "Roadster X", brand: "Ola", type: "bike", battery_capacity_kwh: 2.5, full_range_km: 200, charging_speed_kw: 1.5, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },
  { id: "ola-roadster", name: "Roadster", brand: "Ola", type: "bike", battery_capacity_kwh: 4.5, full_range_km: 400, charging_speed_kw: 2.5, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },
  { id: "ola-roadster-pro", name: "Roadster Pro", brand: "Ola", type: "bike", battery_capacity_kwh: 8.0, full_range_km: 579, charging_speed_kw: 5.0, charger_type_supported: ["AC", "DC"], connector_type: "CCS2", image_url: IMG_BIKE },

  // PURE EV
  { id: "pureev-etrance-neo", name: "eTrance Neo", brand: "Pure EV", type: "bike", battery_capacity_kwh: 2.0, full_range_km: 120, charging_speed_kw: 0.6, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },
  { id: "pureev-etryst-350", name: "eTryst 350", brand: "Pure EV", type: "bike", battery_capacity_kwh: 3.0, full_range_km: 150, charging_speed_kw: 0.8, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },

  // ORXA ENERGIES
  { id: "orxa-mantis", name: "Mantis", brand: "Orxa", type: "bike", battery_capacity_kwh: 9.0, full_range_km: 221, charging_speed_kw: 3.3, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },

  // BOUNCE INFINITY
  { id: "bounce-infinity-e1", name: "Infinity E1", brand: "Bounce", type: "bike", battery_capacity_kwh: 2.9, full_range_km: 85, charging_speed_kw: 0.5, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },

  // KABIRA MOBILITY
  { id: "kabira-km3000", name: "KM3000", brand: "Kabira", type: "bike", battery_capacity_kwh: 3.5, full_range_km: 120, charging_speed_kw: 1.0, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },
  { id: "kabira-km4000", name: "KM4000", brand: "Kabira", type: "bike", battery_capacity_kwh: 4.0, full_range_km: 150, charging_speed_kw: 1.2, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },

  // EMOTORAD
  { id: "emotorad-t-rex-plus", name: "T-Rex+ (E-Cycle)", brand: "EMotorad", type: "bike", battery_capacity_kwh: 0.54, full_range_km: 100, charging_speed_kw: 0.15, charger_type_supported: ["AC"], connector_type: "Type 2", image_url: IMG_BIKE },
];

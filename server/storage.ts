import { randomUUID } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// File path for persistent profile storage
const PROFILES_FILE = join(process.cwd(), "profiles.json");

function loadProfilesFromFile(): Map<string, UserProfile> {
  try {
    if (existsSync(PROFILES_FILE)) {
      const raw = readFileSync(PROFILES_FILE, "utf-8");
      const obj = JSON.parse(raw) as Record<string, UserProfile>;
      return new Map(Object.entries(obj));
    }
  } catch (e) {
    console.error("[storage] Failed to load profiles.json:", e);
  }
  return new Map();
}

function saveProfilesToFile(profiles: Map<string, UserProfile>) {
  try {
    const obj = Object.fromEntries(profiles.entries());
    writeFileSync(PROFILES_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (e) {
    console.error("[storage] Failed to save profiles.json:", e);
  }
}

/* =======================
   TYPES
======================= */

export interface Wallet {
  userId: string;
  balance: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  timestamp: number;
}

export interface Review {
  id: string;
  stationId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: number;
}

export interface ChargingSession {
  id: string;
  userId: string;
  stationId: string;
  stationName: string;
  vehicleId: string;
  startTime: number;
  endTime?: number;
  kwhUsed: number;
  cost: number;
  status: "active" | "completed";
}

export interface CheckIn {
  id: string;
  stationId: string;
  userId: string;
  timestamp: number;
}

export interface ContributedStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  charger_power_kw: number;
  connector_type: string;
  price_per_unit: number;
  status: string;
  isContributed: true;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
}

/* =======================
   STORAGE INTERFACE
======================= */

export interface IStorage {
  getWallet(userId: string): Promise<Wallet>;
  getTransactions(userId: string): Promise<Transaction[]>;
  addFunds(userId: string, amount: number, source: string): Promise<Wallet>;
  deductFunds(userId: string, amount: number, reason: string): Promise<Wallet>;
  
  // User Profile
  getUserProfile(userId: string): Promise<UserProfile>;
  updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
  
  // Reviews
  getReviews(stationId: string): Promise<Review[]>;
  addReview(review: Omit<Review, "id" | "timestamp">): Promise<Review>;
  
  // Sessions
  getSessions(userId: string): Promise<ChargingSession[]>;
  getActiveSession(userId: string): Promise<ChargingSession | undefined>;
  startSession(session: Omit<ChargingSession, "id" | "startTime" | "status" | "kwhUsed" | "cost">): Promise<ChargingSession>;
  endSession(sessionId: string, kwhUsed: number, cost: number): Promise<ChargingSession>;
  
  // Favourites
  getFavourites(userId: string): Promise<string[]>;
  toggleFavourite(userId: string, stationId: string): Promise<boolean>;

  // Check-Ins
  getCheckIns(stationId: string): Promise<CheckIn[]>;
  addCheckIn(stationId: string, userId: string): Promise<CheckIn>;

  // Contributed Stations
  getContributedStations(): Promise<ContributedStation[]>;
  addContributedStation(station: Omit<ContributedStation, "id" | "isContributed">): Promise<ContributedStation>;
}

/* =======================
   IN-MEMORY STORAGE
======================= */

export class MemStorage implements IStorage {
  private wallets = new Map<string, Wallet>();
  private transactions = new Map<string, Transaction[]>();
  private reviews = new Map<string, Review[]>();
  private sessions = new Map<string, ChargingSession[]>();
  private favourites = new Map<string, Set<string>>();
  private checkIns = new Map<string, CheckIn[]>();
  private profiles = loadProfilesFromFile(); // ← file-backed
  private contributedStations: ContributedStation[] = [];

  private ensureWallet(userId: string) {
    if (!this.wallets.has(userId)) {
      this.wallets.set(userId, { userId, balance: 0 });
      this.transactions.set(userId, []);
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    if (!this.profiles.has(userId)) {
      const defaultProfile: UserProfile = {
        id: userId,
        name: "Driver",
        email: userId,
        photoUrl: ""
      };
      this.profiles.set(userId, defaultProfile);
      saveProfilesToFile(this.profiles);
    }
    return this.profiles.get(userId)!;
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const profile = await this.getUserProfile(userId);
    const updated = { ...profile, ...data };
    this.profiles.set(userId, updated);
    saveProfilesToFile(this.profiles); // ← persist immediately
    return updated;
  }

  async getWallet(userId: string): Promise<Wallet> {
    this.ensureWallet(userId);
    return this.wallets.get(userId)!;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    this.ensureWallet(userId);
    return this.transactions.get(userId)!;
  }

  async addFunds(
    userId: string,
    amount: number,
    source: string
  ): Promise<Wallet> {
    this.ensureWallet(userId);

    const wallet = this.wallets.get(userId)!;
    wallet.balance += amount;

    this.transactions.get(userId)!.push({
      id: randomUUID(),
      userId,
      amount,
      type: "credit",
      description: `Added via ${source}`,
      timestamp: Date.now(),
    });

    return wallet;
  }

  async deductFunds(
    userId: string,
    amount: number,
    reason: string
  ): Promise<Wallet> {
    this.ensureWallet(userId);

    const wallet = this.wallets.get(userId)!;

    if (wallet.balance < amount) {
      throw new Error("Insufficient balance");
    }

    wallet.balance -= amount;

    this.transactions.get(userId)!.push({
      id: randomUUID(),
      userId,
      amount,
      type: "debit",
      description: reason,
      timestamp: Date.now(),
    });

    return wallet;
  }
  // Reviews
  async getReviews(stationId: string): Promise<Review[]> {
    return this.reviews.get(stationId) || [];
  }

  async addReview(reviewData: Omit<Review, "id" | "timestamp">): Promise<Review> {
    const review: Review = {
      ...reviewData,
      id: randomUUID(),
      timestamp: Date.now(),
    };
    if (!this.reviews.has(review.stationId)) {
      this.reviews.set(review.stationId, []);
    }
    this.reviews.get(review.stationId)!.push(review);
    return review;
  }

  // Sessions
  async getSessions(userId: string): Promise<ChargingSession[]> {
    return this.sessions.get(userId) || [];
  }

  async getActiveSession(userId: string): Promise<ChargingSession | undefined> {
    const userSessions = this.sessions.get(userId) || [];
    return userSessions.find((s: ChargingSession) => s.status === "active");
  }

  async startSession(sessionData: Omit<ChargingSession, "id" | "startTime" | "status" | "kwhUsed" | "cost">): Promise<ChargingSession> {
    const session: ChargingSession = {
      ...sessionData,
      id: randomUUID(),
      startTime: Date.now(),
      status: "active",
      kwhUsed: 0,
      cost: 0,
    };
    if (!this.sessions.has(session.userId)) {
      this.sessions.set(session.userId, []);
    }
    this.sessions.get(session.userId)!.push(session);
    return session;
  }

  async endSession(sessionId: string, kwhUsed: number, cost: number): Promise<ChargingSession> {
    const allUsersSessions = Array.from(this.sessions.values());
    for (const userSessions of allUsersSessions) {
      const sessionIndex = userSessions.findIndex((s: ChargingSession) => s.id === sessionId);
      if (sessionIndex !== -1) {
        const session = userSessions[sessionIndex];
        session.status = "completed";
        session.endTime = Date.now();
        session.kwhUsed = kwhUsed;
        session.cost = cost;
        return session;
      }
    }
    throw new Error("Session not found");
  }

  // Favourites
  async getFavourites(userId: string): Promise<string[]> {
    const userFavs = this.favourites.get(userId);
    return userFavs ? Array.from(userFavs) : [];
  }

  async toggleFavourite(userId: string, stationId: string): Promise<boolean> {
    if (!this.favourites.has(userId)) {
      this.favourites.set(userId, new Set());
    }
    const userFavs = this.favourites.get(userId)!;
    if (userFavs.has(stationId)) {
      userFavs.delete(stationId);
      return false;
    } else {
      userFavs.add(stationId);
      return true;
    }
  }

  // Check-Ins
  async getCheckIns(stationId: string): Promise<CheckIn[]> {
    return this.checkIns.get(stationId) || [];
  }

  async addCheckIn(stationId: string, userId: string): Promise<CheckIn> {
    const checkIn: CheckIn = {
      id: randomUUID(),
      stationId,
      userId,
      timestamp: Date.now(),
    };
    if (!this.checkIns.has(stationId)) {
      this.checkIns.set(stationId, []);
    }
    this.checkIns.get(stationId)!.push(checkIn);
    return checkIn;
  }

  // Contributed Stations
  async getContributedStations(): Promise<ContributedStation[]> {
    return this.contributedStations;
  }

  async addContributedStation(stationData: Omit<ContributedStation, "id" | "isContributed">): Promise<ContributedStation> {
    const station: ContributedStation = {
      ...stationData,
      id: `contrib_${randomUUID()}`,
      isContributed: true,
    };
    this.contributedStations.push(station);
    return station;
  }
}

export const storage = new MemStorage();

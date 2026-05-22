import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, Eye, EyeOff, Check, X, Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface PasswordValidation {
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const validatePassword = (password: string): PasswordValidation => ({
  minLength: password.length >= 8,
  hasLetter: /[a-zA-Z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/`~]/.test(password),
});

const isPasswordValid = (v: PasswordValidation) =>
  v.minLength && v.hasLetter && v.hasNumber && v.hasSpecial;

// Defined OUTSIDE component so it's stable across renders
const inputClass =
  "w-full h-14 pl-12 pr-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-white text-base placeholder:text-zinc-600 outline-none transition-all focus:border-primary/60 focus:shadow-[0_0_20px_-8px_rgba(255,165,0,0.4)]";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signIn, signUp, isConfigured, refreshProfile } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const pv = validatePassword(password);
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast({ variant: "destructive", title: "Enter your email address." });
    if (isSignUp && !isPasswordValid(pv)) return toast({ variant: "destructive", title: "Password doesn't meet requirements." });
    if (isSignUp && !passwordsMatch) return toast({ variant: "destructive", title: "Passwords don't match." });
    if (!password) return toast({ variant: "destructive", title: "Enter your password." });

    setIsLoading(true);

    if (!isConfigured) {
      setTimeout(async () => {
        setIsLoading(false);
        const storedUsers = JSON.parse(localStorage.getItem("registeredUsers") || "{}");
        if (isSignUp) {
          storedUsers[email] = { password, name, createdAt: Date.now() };
          localStorage.setItem("registeredUsers", JSON.stringify(storedUsers));
          localStorage.setItem("userEmail", email);
          if (name) localStorage.setItem("userName", name);
          // NEW: Sync with backend profile
          await refreshProfile(); 
          toast({ title: "Account Created!", description: "Sign in with your new credentials." });
          setIsSignUp(false);
        } else {
          const u = storedUsers[email];
          if (!u) { toast({ variant: "destructive", title: "Account not found", description: "Please sign up first." }); return; }
          if (u.password !== password) { toast({ variant: "destructive", title: "Incorrect password" }); return; }
          // Set email first so fetchProfile inside refreshProfile works
          localStorage.setItem("userEmail", email);
          // refreshProfile will load from backend (profiles.json) — that is the source of truth
          await refreshProfile();
          toast({ title: "Welcome back!", description: "Getting your location..." });
          setLocation("/location");
        }
      }, 1000);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name);
        if (error) toast({ variant: "destructive", title: "Sign up failed", description: error.message });
        else {
          toast({ title: "Account Created!", description: "Sign in with your credentials." });
          localStorage.setItem("userEmail", email);
          if (name) localStorage.setItem("userName", name);
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) toast({ variant: "destructive", title: "Login failed", description: error.message });
        else {
          toast({ title: "Welcome back!" });
          localStorage.setItem("userEmail", email);
          setLocation("/location");
        }
      }
    } catch {
      toast({ variant: "destructive", title: "Unexpected error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[70vw] h-[70vw] bg-gradient-to-br from-primary/25 to-transparent rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[70vw] h-[70vw] bg-gradient-to-tl from-orange-600/15 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <motion.div
            animate={{ boxShadow: ["0 0 20px -5px rgba(255,165,0,0.3)", "0 0 40px -5px rgba(255,165,0,0.6)", "0 0 20px -5px rgba(255,165,0,0.3)"] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-zinc-900 border border-primary/30 mb-5"
          >
            <Zap size={40} className="text-primary" fill="currentColor" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-1">
            Charge<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Sense</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Intelligent EV Charging</p>
        </motion.div>

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-xl border border-white/8 rounded-3xl p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]"
        >
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-black/40 rounded-2xl border border-white/5 mb-6">
            {(["Sign In", "Sign Up"] as const).map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => setIsSignUp(i === 1)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isSignUp === (i === 1)
                    ? "bg-gradient-to-r from-primary to-orange-500 text-black shadow-[0_0_15px_-5px_rgba(255,165,0,0.5)]"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name — only sign up */}
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors z-10"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Sign-up extras */}
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  key="signup-extra"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-3"
                >
                  {/* Password rules */}
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5 grid grid-cols-2 gap-1.5">
                    {[
                      [pv.minLength, "8+ characters"],
                      [pv.hasLetter, "Letter (a-z)"],
                      [pv.hasNumber, "Number (0-9)"],
                      [pv.hasSpecial, "Special (!@#...)"],
                    ].map(([valid, label]) => (
                      <div key={label as string} className={`flex items-center gap-1.5 text-xs ${valid ? "text-green-400" : "text-zinc-600"}`}>
                        {valid ? <Check size={11} /> : <X size={11} />}
                        {label as string}
                      </div>
                    ))}
                  </div>

                  {/* Confirm password */}
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`${inputClass} pr-12 ${
                        confirmPassword && !passwordsMatch ? "border-red-500/70" : ""
                      } ${confirmPassword && passwordsMatch ? "border-green-500/70" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors z-10"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {confirmPassword && (
                    <div className={`flex items-center gap-2 text-xs ${passwordsMatch ? "text-green-400" : "text-red-400"}`}>
                      {passwordsMatch ? <Check size={11} /> : <X size={11} />}
                      {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !isPasswordValid(pv) || (isSignUp && !passwordsMatch)}
              className="w-full h-14 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2
                bg-gradient-to-r from-primary to-orange-500 text-black
                shadow-[0_0_25px_-5px_rgba(255,165,0,0.4)]
                hover:shadow-[0_0_35px_-5px_rgba(255,165,0,0.6)]
                hover:scale-[1.01]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
            >
              {isLoading ? (
                <span className="animate-pulse">{isSignUp ? "Creating Account..." : "Signing In..."}</span>
              ) : (
                <>{isSignUp ? "Create Account" : "Sign In"} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {!isSignUp && (
            <div className="text-center mt-5">
              <a href="#" className="text-xs text-zinc-600 hover:text-primary transition-colors">
                Forgot your password?
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

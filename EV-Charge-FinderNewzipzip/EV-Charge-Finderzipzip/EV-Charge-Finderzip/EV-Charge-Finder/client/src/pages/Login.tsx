import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password),
});

const isPasswordValid = (validation: PasswordValidation): boolean => {
  return validation.minLength && validation.hasLetter && validation.hasNumber && validation.hasSpecial;
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signIn, signUp, isConfigured } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address.",
      });
      return;
    }

    if (isSignUp) {
      if (!isPasswordValid(passwordValidation)) {
        toast({
          variant: "destructive",
          title: "Invalid Password",
          description: "Password must meet all requirements.",
        });
        return;
      }

      if (!passwordsMatch) {
        toast({
          variant: "destructive",
          title: "Passwords Don't Match",
          description: "Please ensure both passwords are the same.",
        });
        return;
      }
    }

    if (!password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your password.",
      });
      return;
    }

    if (!isSignUp && !isPasswordValid(passwordValidation)) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: "Password must be at least 8 characters with letters, numbers, and special characters.",
      });
      return;
    }

    setIsLoading(true);

    if (!isConfigured) {
      setTimeout(() => {
        setIsLoading(false);
        
        let storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
        
        if (isSignUp) {
          // For signup, delete old entry first and create new one
          delete storedUsers[email];
          storedUsers[email] = { password, name, createdAt: Date.now() };
          localStorage.setItem('registeredUsers', JSON.stringify(storedUsers));
          localStorage.setItem('userEmail', email);
          if (name) localStorage.setItem('userName', name);
          toast({
            title: "Account Created!",
            description: "Please sign in with your credentials.",
          });
          setIsSignUp(false);
        } else {
          const storedUser = storedUsers[email];
          if (!storedUser) {
            toast({
              variant: "destructive",
              title: "Account Not Found",
              description: "No account found with this email. Please sign up first.",
            });
            return;
          }
          if (storedUser.password !== password) {
            toast({
              variant: "destructive",
              title: "Incorrect Password",
              description: "The password you entered is incorrect. Please try again.",
            });
            return;
          }
          localStorage.setItem('userEmail', email);
          if (storedUser.name) localStorage.setItem('userName', storedUser.name);
          toast({
            title: "Welcome back!",
            description: "Syncing your vehicle data...",
          });
          setLocation("/vehicles");
        }
      }, 1000);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name);
        if (error) {
          toast({
            variant: "destructive",
            title: "Sign Up Failed",
            description: error.message,
          });
        } else {
          toast({
            title: "Account Created!",
            description: "Please sign in with your credentials.",
          });
          localStorage.setItem('userEmail', email);
          if (name) localStorage.setItem('userName', name);
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message,
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "Syncing your vehicle data...",
          });
          localStorage.setItem('userEmail', email);
          setLocation("/vehicles");
        }
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-xs ${valid ? 'text-green-500' : 'text-zinc-500'}`}>
      {valid ? <Check size={12} /> : <X size={12} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-background to-background">
      <div className="w-full max-w-sm space-y-8">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 border border-primary/20 shadow-[0_0_30px_-5px_rgba(0,255,157,0.3)]">
            <Zap size={32} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-sans">ChargeSense</h1>
          <p className="text-muted-foreground">Intelligent EV Charging</p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                !isSignUp ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                isSignUp ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-4">
            {isSignUp && (
              <div className="relative group">
                <Input 
                  type="text" 
                  placeholder="Name" 
                  className="h-12 bg-zinc-900/50 border-zinc-800 focus:border-primary/50 transition-all text-lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            
            <div className="relative group">
              <Input 
                type="email" 
                placeholder="Email address" 
                className="h-12 bg-zinc-900/50 border-zinc-800 focus:border-primary/50 transition-all text-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <Input 
                type={showPassword ? "text" : "password"}
                placeholder="Password" 
                className="h-12 bg-zinc-900/50 border-zinc-800 focus:border-primary/50 transition-all text-lg pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {isSignUp && (
              <>
                <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 space-y-2">
                  <p className="text-xs text-zinc-400 font-medium mb-2">Password Requirements:</p>
                  <ValidationItem valid={passwordValidation.minLength} text="At least 8 characters" />
                  <ValidationItem valid={passwordValidation.hasLetter} text="Contains a letter (a-z, A-Z)" />
                  <ValidationItem valid={passwordValidation.hasNumber} text="Contains a number (0-9)" />
                  <ValidationItem valid={passwordValidation.hasSpecial} text="Contains a special character (!@#$...)" />
                </div>

                <div className="relative group">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password" 
                    className={`h-12 bg-zinc-900/50 border-zinc-800 focus:border-primary/50 transition-all text-lg pr-12 ${
                      confirmPassword && !passwordsMatch ? 'border-red-500' : ''
                    } ${confirmPassword && passwordsMatch ? 'border-green-500' : ''}`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {confirmPassword && (
                  <div className={`flex items-center gap-2 text-xs ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordsMatch ? <Check size={12} /> : <X size={12} />}
                    <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            disabled={isLoading || !isPasswordValid(passwordValidation) || (isSignUp && !passwordsMatch)}
          >
            {isLoading ? (
              <span className="animate-pulse">
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={20} />
              </span>
            )}
          </Button>
        </motion.form>

        {!isSignUp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <a href="#" className="text-sm text-zinc-500 hover:text-primary transition-colors">
              Forgot your password?
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}

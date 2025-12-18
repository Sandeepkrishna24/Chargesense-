import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LocationProvider } from "@/contexts/LocationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/WalletContext";
import Login from "@/pages/Login";
import VehicleSelect from "@/pages/VehicleSelect";
import LocationEntry from "@/pages/LocationEntry";
import LandingPage from "@/pages/LandingPage";
import MyVehicle from "@/pages/MyVehicle";
import Recommendations from "@/pages/Recommendations";
import Session from "@/pages/Session";
import Analytics from "@/pages/Analytics";
import MapPage from "@/pages/MapPage";
import Profile from "@/pages/Profile";
import Wallet from "@/pages/Wallet";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/home" component={LandingPage} />
      <Route path="/vehicles" component={VehicleSelect} />
      <Route path="/location" component={LocationEntry} />
      <Route path="/my-vehicle" component={MyVehicle} />
      <Route path="/recommendations" component={Recommendations} />
      <Route path="/session" component={Session} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/map" component={MapPage} />
      <Route path="/profile" component={Profile} />
      <Route path="/wallet" component={Wallet} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WalletProvider>
          <LocationProvider>
            <Toaster />
            <Router />
          </LocationProvider>
        </WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

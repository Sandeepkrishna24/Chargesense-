import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, User, Mail, Camera, Upload, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/contexts/AuthContext";

export default function EditProfile() {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isViewingPhoto, setIsViewingPhoto] = useState(false);
  const { profile, updateProfile } = useAuth();

  const [name, setName] = useState(profile?.name || "");
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl || "");
  const [email] = useState(profile?.email || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl("");
  };

  const handleSave = async () => {
    await updateProfile({ name, photoUrl });
    setLocation("/profile");
  };

  return (
    <MobileLayout>
      <div className="p-6 space-y-6 relative overflow-hidden min-h-screen">
        {/* Background glow elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[60vw] h-[60vw] bg-gradient-to-tl from-cyan-500/10 to-transparent rounded-full blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 relative z-10 mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-white/10"
            onClick={() => setLocation("/profile")}
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
        </div>

        <div className="space-y-6 relative z-10">
          {/* Profile Photo */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block ml-1">Profile Photo</label>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            <div className="flex flex-col items-center gap-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div 
                    className="relative w-32 h-32 rounded-full bg-zinc-900 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden cursor-pointer group hover:border-primary/50 transition-all shadow-2xl"
                  >
                     {photoUrl ? (
                       <>
                         <img src={photoUrl} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <Camera size={32} className="text-white drop-shadow-lg" />
                         </div>
                       </>
                     ) : (
                       <div className="flex flex-col items-center gap-2 text-zinc-600 group-hover:text-primary transition-colors">
                         <Camera size={32} />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Add photo</span>
                       </div>
                     )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48 bg-zinc-900/90 backdrop-blur-xl border-white/10 rounded-2xl p-2 shadow-2xl">
                  {photoUrl && (
                    <DropdownMenuItem 
                      onClick={() => setIsViewingPhoto(true)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer text-sm font-medium"
                    >
                      <Eye size={16} className="text-primary" />
                      View Photo
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer text-sm font-medium"
                  >
                    <Upload size={16} className="text-primary" />
                    {photoUrl ? "Change Photo" : "Upload Photo"}
                  </DropdownMenuItem>
                  {photoUrl && (
                    <DropdownMenuItem 
                      onClick={handleRemovePhoto}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 cursor-pointer text-sm font-medium text-red-400"
                    >
                      <Trash2 size={16} />
                      Remove
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Full Photo Dialog */}
              <Dialog open={isViewingPhoto} onOpenChange={setIsViewingPhoto}>
                <DialogContent className="max-w-[90vw] bg-black/95 border-none p-0 flex items-center justify-center overflow-hidden rounded-3xl">
                  <img src={photoUrl} alt="Full view" className="w-full h-auto max-h-[80vh] object-contain" />
                </DialogContent>
              </Dialog>

              <div className="w-full space-y-4">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-white/10 bg-zinc-900/40 backdrop-blur-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 group"
                >
                  <Upload size={14} className="mr-2 text-primary group-hover:scale-110 transition-transform" />
                  Select from Gallery
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5"></span>
                  </div>
                  <div className="relative flex justify-center text-[8px] uppercase tracking-[0.3em] font-black text-zinc-700">
                    <span className="bg-black px-2">or use external link</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 shadow-inner focus-within:border-primary/50 transition-colors">
                  <input
                    value={photoUrl.startsWith('data:') ? '' : photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="bg-transparent outline-none flex-1 text-white font-medium text-xs"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block ml-1">Name</label>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 shadow-inner focus-within:border-primary/50 transition-colors">
              <User size={18} className="text-zinc-400" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent outline-none flex-1 text-white font-medium"
                placeholder="Your name"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block ml-1">Email</label>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/20 backdrop-blur-xl border border-white/5 opacity-70">
              <Mail size={18} className="text-zinc-500" />
              <input
                value={email}
                disabled
                className="bg-transparent outline-none flex-1 text-white font-medium cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-zinc-500 ml-1 mt-1 font-medium">Email address cannot be changed.</p>
          </div>
        </div>

        {/* Save */}
        <div className="relative z-10 pt-8">
          <Button
            className="w-full h-14 rounded-2xl font-bold tracking-wide bg-gradient-to-r from-primary to-orange-500 text-black shadow-[0_0_20px_rgba(255,165,0,0.3)] hover:scale-[1.02] transition-transform"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}

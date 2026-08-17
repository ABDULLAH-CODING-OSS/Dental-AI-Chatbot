"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, Loader2, ShieldCheck, Activity, Sparkles, Star, HeartPulse, Microscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring" as const, stiffness: 300, damping: 24 } 
  }
};

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const validate = () => {
    let isValid = true;
    const newErrors = { name: "", email: "", password: "", confirmPassword: "" };

    if (!formData.name) {
      newErrors.name = "Full name is required";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Simulate API call
    console.log("Signup Form Data:", formData);
    
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
      {/* Right Video Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden items-center justify-center p-16 xl:p-24 order-2">
        {/* Animated Gradient Mesh */}
        <div className="absolute inset-0 opacity-80">
          <motion.div
            animate={{
              x: [0, -100, 50, 0],
              y: [0, 100, -50, 0],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-purple-600/40 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              x: [0, 80, -60, 0],
              y: [0, -120, 40, 0],
              scale: [1, 1.1, 1.3, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 2 }}
            className="absolute top-[30%] -left-[20%] w-[600px] h-[600px] bg-fuchsia-500/30 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              x: [0, -50, 80, 0],
              y: [0, -80, -100, 0],
              scale: [1, 1.4, 0.8, 1],
            }}
            transition={{ duration: 22, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-[20%] right-[20%] w-[700px] h-[700px] bg-violet-700/50 rounded-full blur-[120px]"
          />
        </div>

        {/* Floating Decorative Icons */}
        <motion.div
          animate={{ y: [0, -30, 0], rotate: [0, 10, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          className="absolute top-[15%] left-[25%] text-white/20"
        >
          <ShieldCheck size={72} strokeWidth={1.5} />
        </motion.div>
        
        <motion.div
          animate={{ y: [0, 40, 0], rotate: [0, -15, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 1 }}
          className="absolute top-[40%] right-[15%] text-white/10"
        >
          <Activity size={96} strokeWidth={1} />
        </motion.div>

        <motion.div
          animate={{ y: [0, -25, 0], rotate: [0, 20, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 3 }}
          className="absolute bottom-[25%] left-[20%] text-white/15"
        >
          <Sparkles size={56} strokeWidth={1.5} />
        </motion.div>

        <motion.div
          animate={{ y: [0, 35, 0], rotate: [0, -10, 5, 0] }}
          transition={{ duration: 14, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] right-[35%] text-white/10"
        >
          <HeartPulse size={64} strokeWidth={1.5} />
        </motion.div>

        <motion.div
          animate={{ y: [0, -45, 0], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 11, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 4 }}
          className="absolute bottom-[15%] right-[30%] text-white/15"
        >
          <Microscope size={80} strokeWidth={1} />
        </motion.div>

        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-slate-950/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_var(--tw-gradient-stops))] from-transparent to-slate-950/80"></div>
        
        {/* Glassmorphism Text Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, type: "spring" as const, stiffness: 200, damping: 20 }}
          className="relative z-10 flex flex-col p-10 md:p-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl max-w-xl w-full"
        >
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 border border-white/20 shadow-inner">
            <Stethoscope className="w-10 h-10 text-purple-300 drop-shadow-md" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight text-white tracking-tight">
            Join the future of dental care.
          </h2>
          <p className="text-xl text-purple-50 leading-relaxed font-medium">
            Create an account to track your symptoms, access 24/7 AI guidance, and seamlessly connect with top-rated professionals.
          </p>
        </motion.div>
      </div>

      {/* Left Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 sm:px-16 lg:px-24 py-12 relative z-10 order-1">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md w-full"
        >
          {/* Logo & Trust Indicator */}
          <motion.div variants={itemVariants} className="mb-10 flex flex-col items-start gap-5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-[0_8px_30px_rgb(147,51,234,0.3)] transition-transform group-hover:scale-105">
                <Stethoscope size={26} />
              </div>
              <span className="text-3xl font-bold tracking-tight text-slate-900">Denova</span>
            </Link>
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-800 bg-purple-50/80 px-4 py-1.5 rounded-full border border-purple-100/50 shadow-sm backdrop-blur-sm">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
              </div>
              <span>Trusted by 10,000+ patients</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Create an account</h1>
            <p className="text-slate-500 mb-10 text-lg">Start your journey to a healthier smile.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`h-14 rounded-2xl bg-slate-50 border-slate-200 transition-all duration-300 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-base shadow-sm ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
              {errors.name && <p className="mt-2 text-sm font-medium text-red-500">{errors.name}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`h-14 rounded-2xl bg-slate-50 border-slate-200 transition-all duration-300 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-base shadow-sm ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
              {errors.email && <p className="mt-2 text-sm font-medium text-red-500">{errors.email}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`h-14 rounded-2xl bg-slate-50 border-slate-200 transition-all duration-300 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-base shadow-sm ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
              {errors.password && <p className="mt-2 text-sm font-medium text-red-500">{errors.password}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`h-14 rounded-2xl bg-slate-50 border-slate-200 transition-all duration-300 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-base shadow-sm ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
              {errors.confirmPassword && <p className="mt-2 text-sm font-medium text-red-500">{errors.confirmPassword}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <motion.div whileHover={{ scale: 1.01, filter: 'brightness(1.05)' }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 rounded-2xl text-lg font-bold bg-purple-600 hover:bg-purple-600 text-white shadow-[0_8px_30px_rgb(147,51,234,0.25)] border-none transition-all shadow-inner relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-50 pointer-events-none"></div>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Sign up"
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </form>

          <motion.p variants={itemVariants} className="mt-10 text-center text-sm font-medium text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-purple-600 hover:text-purple-500 transition-colors">
              Log in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

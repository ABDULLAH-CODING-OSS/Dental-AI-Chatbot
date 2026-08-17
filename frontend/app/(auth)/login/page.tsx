// "use client";

// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Stethoscope, Loader2, AlertCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/app/context/AuthContext";
// import axios from "axios";

// const BACKEND_LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_API_URL || "http://127.0.0.1:8000/api/auth/login";

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//       delayChildren: 0.1
//     }
//   }
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { 
//     opacity: 1, 
//     y: 0, 
//     transition: { type: "spring" as const, stiffness: 300, damping: 24 } 
//   }
// };

// export default function LoginPage() {
//   const router = useRouter();
//   const { login } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({ 
//     email: "", 
//     password: "", 
//     remember: false,
//     adminLogin: false 
//   });
//   const [errors, setErrors] = useState({ email: "", password: "" });
//   const [serverError, setServerError] = useState<string | null>(null);

//   const validate = () => {
//     let isValid = true;
//     const newErrors = { email: "", password: "" };

//     if (!formData.email) {
//       newErrors.email = "Email is required";
//       isValid = false;
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Please enter a valid email address";
//       isValid = false;
//     }

//     if (!formData.password) {
//       newErrors.password = "Password is required";
//       isValid = false;
//     }

//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setServerError(null);
//     if (!validate()) return;

//     setLoading(true);

//     try {
//       const response = await axios.post(BACKEND_LOGIN_URL, {
//         email: formData.email,
//         password: formData.password,
//         admin_login: formData.adminLogin
//       }, {
//         headers: {
//           "Content-Type": "application/json"
//         },
//         timeout: 15000
//       });

//       const { access_token, role, full_name } = response.data || {};
      
//       const userRole = (role === "admin" ? "admin" : "patient") as "admin" | "patient";
//       login(access_token || "mock_token", userRole, full_name || "User", formData.email);

//       if (userRole === "admin") {
//         router.push("/admin");
//       } else {
//         router.push("/dashboard");
//       }
//     } catch (err: unknown) {
//       let message = "Incorrect email or password.";
//       if (axios.isAxiosError(err)) {
//         if (err.response?.data?.detail) {
//           message = typeof err.response.data.detail === "string" 
//             ? err.response.data.detail 
//             : JSON.stringify(err.response.data.detail);
//         } else if (err.response?.data?.message) {
//           message = err.response.data.message;
//         } else if (err.code === "ECONNABORTED" || err.message?.includes("Network Error")) {
//           message = "Unable to connect to authentication server. Please ensure the backend service is running.";
//         }
//       }
//       setServerError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex bg-white font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
//       {/* Left Form Panel */}
//       <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 xl:px-28 py-12 relative z-10">
//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//           className="max-w-md w-full mx-auto"
//         >
//           {/* Logo & Trust Indicator */}
//           <motion.div variants={itemVariants} className="mb-10 flex flex-col items-start gap-4">
//             <Link href="/" className="flex items-center gap-3 group">
//               <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 transition-transform group-hover:scale-105">
//                 <Stethoscope size={26} />
//               </div>
//               <span className="text-2xl font-bold tracking-tight text-slate-900">Denova</span>
//             </Link>
//             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200/50">
//               <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
//               Clinical AI Consultation Portal
//             </div>
//           </motion.div>

//           {/* Form Header */}
//           <motion.div variants={itemVariants} className="mb-8">
//             <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
//               Welcome back
//             </h1>
//             <p className="mt-3 text-base text-slate-600 font-medium">
//               Log in with your credentials to access your dental records or admin console.
//             </p>
//           </motion.div>

//           {/* Server Error Alert */}
//           {serverError && (
//             <motion.div 
//               initial={{ opacity: 0, y: -10 }} 
//               animate={{ opacity: 1, y: 0 }} 
//               className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-3 shadow-2xs"
//             >
//               <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
//               <span>{serverError}</span>
//             </motion.div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
//             <motion.div variants={itemVariants}>
//               <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
//               <Input
//                 type="email"
//                 placeholder="name@example.com"
//                 value={formData.email}
//                 onChange={(e) => {
//                   setFormData({ ...formData, email: e.target.value });
//                   if (errors.email) setErrors({ ...errors, email: "" });
//                   if (serverError) setServerError(null);
//                 }}
//                 className={`h-12 rounded-xl bg-slate-50 border-slate-200 transition-all duration-300 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 text-sm shadow-sm ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
//               />
//               {errors.email && <p className="mt-2 text-sm font-medium text-red-500">{errors.email}</p>}
//             </motion.div>

//             <motion.div variants={itemVariants}>
//               <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
//               <Input
//                 type="password"
//                 placeholder="••••••••"
//                 value={formData.password}
//                 onChange={(e) => {
//                   setFormData({ ...formData, password: e.target.value });
//                   if (errors.password) setErrors({ ...errors, password: "" });
//                   if (serverError) setServerError(null);
//                 }}
//                 className={`h-12 rounded-xl bg-slate-50 border-slate-200 transition-all duration-300 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 text-sm shadow-sm ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
//               />
//               {errors.password && <p className="mt-2 text-sm font-medium text-red-500">{errors.password}</p>}
//             </motion.div>

//             <motion.div variants={itemVariants} className="flex items-center justify-between pt-1 text-sm">
//               <div className="flex items-center group cursor-pointer">
//                 <input
//                   id="remember-me"
//                   type="checkbox"
//                   checked={formData.remember}
//                   onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
//                   className="h-4 w-4 text-emerald-600 focus:ring-emerald-500/30 border-slate-300 rounded cursor-pointer transition-all group-hover:border-emerald-500"
//                 />
//                 <label htmlFor="remember-me" className="ml-2 block font-medium text-slate-600 cursor-pointer group-hover:text-slate-900 transition-colors">
//                   Remember me
//                 </label>
//               </div>
//               <Link href="#" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
//                 Forgot password?
//               </Link>
//             </motion.div>

//             {/* "Log in as admin" checkbox above submit button */}
//             <motion.div variants={itemVariants} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
//               <div className="flex items-center gap-2.5 cursor-pointer">
//                 <input
//                   id="admin-login-checkbox"
//                   type="checkbox"
//                   checked={formData.adminLogin}
//                   onChange={(e) => setFormData({ ...formData, adminLogin: e.target.checked })}
//                   className="h-4 w-4 text-purple-600 focus:ring-purple-500/30 border-slate-300 rounded cursor-pointer transition-all"
//                 />
//                 <label htmlFor="admin-login-checkbox" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
//                   Log in as admin
//                 </label>
//               </div>
//               {formData.adminLogin && (
//                 <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200">
//                   Admin Console Access
//                 </span>
//               )}
//             </motion.div>

//             <motion.div variants={itemVariants} className="pt-1">
//               <Button 
//                 type="submit" 
//                 disabled={loading}
//                 className="w-full h-12 rounded-xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all relative overflow-hidden"
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                     Signing in...
//                   </>
//                 ) : (
//                   "Log in"
//                 )}
//               </Button>
//             </motion.div>
//           </form>

//           <motion.p variants={itemVariants} className="mt-8 text-center text-sm font-medium text-slate-600">
//             Don't have an account?{" "}
//             <Link href="/signup" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
//               Sign up
//             </Link>
//           </motion.p>
//         </motion.div>
//       </div>

//       {/* Right Visual Panel */}
//       <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden items-center justify-center p-16 xl:p-24">
//         <div className="absolute inset-0 opacity-80">
//           <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-emerald-600/30 rounded-full blur-[120px]" />
//           <div className="absolute top-[30%] -right-[20%] w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[100px]" />
//         </div>

//         <div className="relative z-10 flex flex-col p-10 md:p-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl max-w-xl w-full text-white">
//           <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 shadow-inner">
//             <Stethoscope className="w-8 h-8 text-emerald-300" />
//           </div>
//           <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 leading-tight text-white tracking-tight">
//             Empowering your smile with AI precision.
//           </h2>
//           <p className="text-base text-emerald-50 leading-relaxed font-medium">
//             Denova leverages advanced clinical AI intelligence and evidence-based dental literature to provide instant, medically sound guidance.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

//__________________________________________________________________________
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import axios from "axios";

const BACKEND_LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_API_URL || "http://127.0.0.1:8000/api/auth/login";

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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "", 
    remember: false,
    adminLogin: false 
  });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setLoading(true);

    try {
      const response = await axios.post(BACKEND_LOGIN_URL, {
        email: formData.email,
        password: formData.password,
        admin_login: formData.adminLogin
      }, {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 15000
      });

      const { access_token, role, full_name } = response.data || {};
      
      const userRole = (role === "admin" ? "admin" : "patient") as "admin" | "patient";
      login(access_token || "mock_token", userRole, full_name || "User", formData.email);

      if (userRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      let message = "Incorrect email or password.";
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.detail) {
          message = typeof err.response.data.detail === "string" 
            ? err.response.data.detail 
            : JSON.stringify(err.response.data.detail);
        } else if (err.response?.data?.message) {
          message = err.response.data.message;
        } else if (err.code === "ECONNABORTED" || err.message?.includes("Network Error")) {
          message = "Unable to connect to authentication server. Please ensure the backend service is running.";
        }
      }
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Left Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 xl:px-28 py-12 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md w-full mx-auto"
        >
          {/* Logo & Trust Indicator */}
          <motion.div variants={itemVariants} className="mb-10 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 transition-transform group-hover:scale-105">
                <Stethoscope size={26} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">Denova</span>
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200/50">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Clinical AI Consultation Portal
            </div>
          </motion.div>

          {/* Form Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Welcome back
            </h1>
            <p className="mt-3 text-base text-slate-600 font-medium">
              Log in with your credentials to access your dental records or admin console.
            </p>
          </motion.div>

          {/* Server Error Alert */}
          {serverError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-3 shadow-2xs"
            >
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                  if (serverError) setServerError(null);
                }}
                className={`h-12 rounded-xl bg-slate-50 border-slate-200 transition-all duration-300 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 text-sm shadow-sm ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
              {errors.email && <p className="mt-2 text-sm font-medium text-red-500">{errors.email}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: "" });
                  if (serverError) setServerError(null);
                }}
                className={`h-12 rounded-xl bg-slate-50 border-slate-200 transition-all duration-300 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 text-sm shadow-sm ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
              {errors.password && <p className="mt-2 text-sm font-medium text-red-500">{errors.password}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-between pt-1 text-sm">
              <div className="flex items-center group cursor-pointer">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500/30 border-slate-300 rounded cursor-pointer transition-all group-hover:border-emerald-500"
                />
                <label htmlFor="remember-me" className="ml-2 block font-medium text-slate-600 cursor-pointer group-hover:text-slate-900 transition-colors">
                  Remember me
                </label>
              </div>
              <Link href="#" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
                Forgot password?
              </Link>
            </motion.div>

            {/* "Log in as admin" checkbox above submit button */}
            <motion.div variants={itemVariants} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 cursor-pointer">
                <input
                  id="admin-login-checkbox"
                  type="checkbox"
                  checked={formData.adminLogin}
                  onChange={(e) => setFormData({ ...formData, adminLogin: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500/30 border-slate-300 rounded cursor-pointer transition-all"
                />
                <label htmlFor="admin-login-checkbox" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                  Log in as admin
                </label>
              </div>
              {formData.adminLogin && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200">
                  Admin Console Access
                </span>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="pt-1">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 rounded-xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all relative overflow-hidden"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </motion.div>
          </form>

          <motion.p variants={itemVariants} className="mt-8 text-center text-sm font-medium text-slate-600">
            Don't have an account?{" "}
            <Link href="/signup" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
              Sign up
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Right Visual Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden items-center justify-center p-16 xl:p-24">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-emerald-600/30 rounded-full blur-[120px]" />
          <div className="absolute top-[30%] -right-[20%] w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col p-10 md:p-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl max-w-xl w-full text-white">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 shadow-inner">
            <Stethoscope className="w-8 h-8 text-emerald-300" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 leading-tight text-white tracking-tight">
            Empowering your smile with AI precision.
          </h2>
          <p className="text-base text-emerald-50 leading-relaxed font-medium">
            Denova leverages advanced clinical AI intelligence and evidence-based dental literature to provide instant, medically sound guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
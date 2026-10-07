import {customerAuthError} from '@/lib/customerAuthError';
import { createContext,useContext,useEffect,useState,type ReactNode } from "react";
import type { Session,User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
type C={user:User|null;session:Session|null;loading:boolean;signIn:(e:string,p:string)=>Promise<string|null>;signOut:()=>Promise<void>};
const AuthContext=createContext<C|null>(null);
export function AuthProvider({children}:{children:ReactNode}){const[session,setSession]=useState<Session|null>(null),[loading,setLoading]=useState(true);useEffect(()=>{void supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)});const{data}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>data.subscription.unsubscribe()},[]);return <AuthContext.Provider value={{user:session?.user||null,session,loading,signIn:async(e,p)=>{const{error}=await supabase.auth.signInWithPassword({email:e,password:p});return error ? customerAuthError(error) : null},signOut:async()=>{await supabase.auth.signOut()}}}>{children}</AuthContext.Provider>}
export function useAuth(){const c=useContext(AuthContext);if(!c)throw new Error("AuthProvider missing");return c}

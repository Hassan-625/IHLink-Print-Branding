import { createClient } from "@supabase/supabase-js";
const url=import.meta.env.VITE_SUPABASE_URL||"https://lnqsroyiybutkfngbyge.supabase.co";
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY||"sb_publishable_VtL5RtPncmUXxxjrM_tFQw_T4cPPYDq";
export const supabase=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

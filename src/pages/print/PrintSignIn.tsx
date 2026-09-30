import {useState,type FormEvent} from 'react';
import {useNavigate,useSearchParams} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext';
import {supabase} from '@/lib/supabase';
import {PrintHeader,PrintFooter} from '@/components/PrintShell';
export function PrintSignIn(){
 const {signIn}=useAuth();const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const navigate=useNavigate(),[query]=useSearchParams();
 const requested=query.get('next');const next=requested?.startsWith('/print/')?requested:'/print/dashboard';
 async function submit(event:FormEvent){event.preventDefault();if(busy)return;setBusy(true);setMessage('');
 try{const failure=await signIn(email.trim(),password);if(failure)setMessage(failure);else navigate(next,{replace:true});}
 catch{setMessage('Sign in could not complete. Please try again.');}finally{setBusy(false);}}
 async function google(){if(busy)return;setBusy(true);setMessage('');try{const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+next}});if(error){setMessage(error.message);setBusy(false);}}catch{setMessage('Google sign in could not start. Please try again.');setBusy(false);}}
 return <><PrintHeader/><main className="min-h-[65vh] grid place-items-center bg-slate-50 p-5"><div className="w-full max-w-md rounded-2xl border bg-white p-7"><h1 className="text-2xl font-extrabold">Print & Branding sign in</h1><p className="mt-3 text-sm text-muted">Use your IHLink account to access your authorized workspace.</p><form className="mt-5 space-y-4" onSubmit={event=>void submit(event)}><label className="block font-semibold" htmlFor="print-email">Email<input id="print-email" className="mt-2 w-full rounded-xl border p-3" type="email" autoComplete="username" required value={email} onChange={event=>setEmail(event.target.value)}/></label><label className="block font-semibold" htmlFor="print-password">Password<input id="print-password" className="mt-2 w-full rounded-xl border p-3" type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.target.value)}/></label>{message&&<p role="alert" className="text-sm text-red-700">{message}</p>}<button disabled={busy} className="w-full rounded-xl bg-blue-700 p-3 font-bold text-white disabled:opacity-50" type="submit">{busy?'Signing in…':'Sign in'}</button></form><button disabled={busy} className="mt-3 w-full rounded-xl border p-3 disabled:opacity-50" onClick={()=>void google()}>Continue with Google</button></div></main><PrintFooter/></>;
}

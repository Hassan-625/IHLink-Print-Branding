import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {Link,Navigate,Outlet,useLocation} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext';
import {supabase} from '@/lib/supabase';
type Access={userId:string;loading:boolean;view:boolean;edit:boolean;error:string|null;active:boolean;customer:boolean};
const empty:Access={userId:'',loading:true,view:false,edit:false,error:null,active:false,customer:false};
const Context=createContext<Access>(empty);
export function PrintAccessProvider({children}:{children:ReactNode}){
 const {user,loading}=useAuth();const [access,setAccess]=useState<Access>(empty);
 useEffect(()=>{let current=true;setAccess({...empty,userId:user?.id||'',loading});
  if(loading||!user)return;
  setAccess({...empty,userId:user.id});
  void Promise.all([supabase.from('profiles').select('role,status').eq('id',user.id).maybeSingle(),supabase.from('admin_product_access').select('can_view,can_edit,can_manage').eq('user_id',user.id).eq('product','print').maybeSingle(),supabase.from('customer_service_access').select('status').eq('user_id',user.id).eq('product','print').maybeSingle()]).then(([profile,grant,service])=>{
   if(!current)return;const error=profile.error?.message||grant.error?.message||service.error?.message||null;
   const active=profile.data?.status==='active';const admin=active&&profile.data?.role==='super_admin';
   const staff=active&&['platform_admin','support','finance'].includes(profile.data?.role||'');
   setAccess({userId:user.id,loading:false,active,error,customer:!error&&active&&service.data?.status==='active',view:!error&&(admin||staff&&Boolean(grant.data?.can_view)),edit:!error&&(admin||staff&&Boolean(grant.data?.can_edit||grant.data?.can_manage))});
  }).catch(()=>{if(current)setAccess({...empty,userId:user.id,loading:false,error:'Print permissions could not be loaded.'})});
  return()=>{current=false};
 },[user?.id,loading]);
 const visible=access.userId===(user?.id||'')?access:empty;
 return <Context.Provider value={visible}>{children}</Context.Provider>;
}
export function usePrintAccess(){return useContext(Context);}
export function PrintRouteGate({staff=false,edit=false}:{staff?:boolean;edit?:boolean}){
 const {user,loading}=useAuth();const access=useContext(Context);const location=useLocation();
 if(loading||user&&access.loading)return <p role="status" className="p-8">Checking your Print workspace access…</p>;
 if(!user)return <Navigate to={'/signin?next='+encodeURIComponent(location.pathname+location.search)} replace state={{from:location.pathname+location.search}}/>;
 if(access.error)return <p role="alert" className="p-8 text-red-700">{access.error}</p>;
 if(!access.active||!access.customer&&!access.view||staff&&!(edit?access.edit:access.view))return <section className="p-8"><h1 className="text-2xl font-bold">Access restricted</h1><p className="mt-3">Your account does not have permission to open this Print workspace.</p><Link className="mt-4 inline-block underline" to="/print">Return to Print & Branding</Link></section>;
 return <Outlet/>;
}
const customerLinks=[['Dashboard','/print/dashboard'],['Place an order / request quote','/print/order'],['My orders','/print/orders'],['My proofs','/print/proofs'],['My quotations','/print/quotes'],['My invoices','/print/invoices'],['My payments','/print/payments'],['Notifications','/print/notifications'],['Support','/print/get-in-touch']];
const staffLinks=[['Production control','/print/operations'],['Artwork','/print/artwork'],['Inventory','/print/inventory'],['Quality control','/print/qc'],['Delivery','/print/delivery']];
export function PrintWorkspaceLayout(){const access=useContext(Context);const location=useLocation();return <div className="min-h-screen bg-slate-50 md:flex"><aside className="border-r bg-white p-4 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:overflow-y-auto print:hidden"><Link to="/print" className="font-black text-blue-900">IHLink Print & Branding</Link><nav aria-label="Print workspace" className="mt-5 flex flex-wrap gap-1 md:flex-col">{[...customerLinks,...access.view?staffLinks:[],...access.edit?[['Pricing management','/print/manage/pricing']]:[]].map(([label,href])=><Link key={href} to={href} aria-current={location.pathname===href?'page':undefined} className={`rounded-lg px-3 py-2 text-sm font-semibold ${location.pathname===href?'bg-blue-50 text-blue-800':'hover:bg-slate-100'}`}>{label}</Link>)}</nav></aside><div className="min-w-0 flex-1"><Outlet/></div></div>}

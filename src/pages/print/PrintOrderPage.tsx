import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { PrintHeader, PrintFooter } from '@/components/PrintShell';

type Product = { id: string; name: string; category: string };
export function PrintOrderPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [fulfillment, setFulfillment] = useState('pickup');
  const [address, setAddress] = useState('');
  const [options,setOptions]=useState({dimensions:'',material:'',finishing:'',engraving:'',recipient_names:'',deadline:'',design_support:'no'});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => { if (!user) return; void supabase.from('print_products').select('id,name,category').eq('active', true).order('category').then(({data,error}) => {setProducts((data || []) as Product[]); if (error) setNotice(error.message);}); }, [user]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!user || busy) return;
    const product = products.find(x => x.id === productId);
    if (!product) { setNotice('Select a service.'); return; }
    if (fulfillment === 'delivery' && !address.trim()) { setNotice('Enter the delivery address.'); return; }
    setBusy(true); setNotice('');
    const {error}=await supabase.rpc('submit_print_request',{p_product:product.id,p_description:description.trim(),p_quantity:quantity,p_fulfillment:fulfillment,p_address:address.trim()||null,p_options:options});
    setBusy(false);
    if(error){setNotice(error.message);return;}
    navigate('/print/orders');
  }
  return <><PrintHeader/><main className="mx-auto max-w-3xl px-5 py-12"><p className="font-bold text-pink-600">IHLink Print & Branding</p><h1 className="mt-2 text-3xl font-black">Request a service quote</h1><p className="mt-3 text-slate-600">Describe the work. IHLink will confirm specifications and issue a quote before payment.</p>{notice && <p role="alert" className="mt-5 rounded-xl border bg-pink-50 p-3">{notice}</p>}{loading ? <p className="mt-6">Loading account…</p> : !user ? <Link className="mt-6 inline-block rounded-xl bg-pink-600 px-5 py-3 font-bold text-white" to="/signin?next=/print/order">Sign in to request a quote</Link> : <form className="mt-7 space-y-4 rounded-2xl border bg-white p-6" onSubmit={e=>void submit(e)}><label className="block font-semibold">Service<select required className="mt-2 w-full rounded-xl border p-3" value={productId} onChange={e=>setProductId(e.target.value)}><option value="">Select service</option>{products.map(p=><option key={p.id} value={p.id}>{p.category} — {p.name}</option>)}</select></label><label className="block font-semibold">Specifications<textarea required minLength={5} className="mt-2 w-full rounded-xl border p-3" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Size, material, pages, colour, finishing and artwork requirements"/></label><fieldset className="space-y-4 rounded-xl border p-4"><legend className="font-bold">Product configuration</legend>{[['dimensions','Dimensions and units'],['material','Material'],['finishing','Finishing']].map(([key,title])=><label key={key} className="block font-semibold">{title}<input className="mt-2 w-full rounded-xl border p-3" value={options[key as keyof typeof options]} onChange={e=>setOptions({...options,[key]:e.target.value})}/></label>)}{/award|troph|plaque/i.test(products.find(p=>p.id===productId)?.name||'')&&<><label className="block font-semibold">Engraving text<textarea required className="mt-2 w-full rounded-xl border p-3" value={options.engraving} onChange={e=>setOptions({...options,engraving:e.target.value})}/></label><label className="block font-semibold">Recipient names<textarea className="mt-2 w-full rounded-xl border p-3" value={options.recipient_names} onChange={e=>setOptions({...options,recipient_names:e.target.value})}/></label></>}<label className="block font-semibold">Deadline<input type="date" className="mt-2 w-full rounded-xl border p-3" value={options.deadline} onChange={e=>setOptions({...options,deadline:e.target.value})}/></label><label className="block font-semibold">Artwork<select className="mt-2 w-full rounded-xl border p-3" value={options.design_support} onChange={e=>setOptions({...options,design_support:e.target.value})}><option value="no">I will upload my artwork</option><option value="yes">I need design support</option></select></label><p className="text-sm text-slate-600">Upload artwork securely from your Print dashboard after submitting the request.</p></fieldset><label className="block font-semibold">Quantity<input type="number" min="1" step="1" className="mt-2 w-full rounded-xl border p-3" value={quantity} onChange={e=>setQuantity(Math.max(1,Math.floor(Number(e.target.value)||1)))}/></label><label className="block font-semibold">Fulfillment<select className="mt-2 w-full rounded-xl border p-3" value={fulfillment} onChange={e=>setFulfillment(e.target.value)}><option value="pickup">Pickup</option><option value="delivery">Delivery</option></select></label>{fulfillment === 'delivery' && <label className="block font-semibold">Delivery address<textarea required className="mt-2 w-full rounded-xl border p-3" value={address} onChange={e=>setAddress(e.target.value)}/></label>}<button disabled={busy || !products.length} className="rounded-xl bg-pink-600 px-5 py-3 font-bold text-white disabled:opacity-50">{busy?'Submitting…':'Submit for quotation'}</button></form>}</main><PrintFooter/></>;
}

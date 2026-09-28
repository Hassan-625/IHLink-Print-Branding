import { Navigate,Route,Routes } from "react-router-dom";
import { PrintBrandingHome } from "@/pages/print/PrintBrandingHome";
import { PrintWorkspace } from "@/pages/print/PrintWorkspace";
import { PrintOperations } from "@/pages/print/PrintOperations";
import { PrintSignIn } from "@/pages/print/PrintSignIn";
import { PrintFeaturePage } from "@/pages/print/PrintFeaturePage";
import { PrintPayments } from "@/pages/print/PrintPayments";
import { PrintGetInTouch } from "@/pages/print/PrintGetInTouch";
import { PrintPricingManagement } from "@/pages/print/PrintPricingManagement";
import { PrintOrders } from "@/pages/print/PrintOrders";
import { PrintProofs } from "@/pages/print/PrintProofs";
import { PrintInvoices } from "@/pages/print/PrintInvoices";
import { PrintNotifications } from "@/pages/print/PrintNotifications";
export default function App(){return <Routes><Route path="/" element={<PrintBrandingHome/>}/><Route path="/print" element={<PrintBrandingHome/>}/><Route path="/print/order" element={<PrintWorkspace/>}/><Route path="/print/dashboard" element={<PrintWorkspace/>}/><Route path="/print/orders" element={<PrintOrders/>}/><Route path="/print/proofs" element={<PrintProofs/>}/><Route path="/print/invoices" element={<PrintInvoices/>}/><Route path="/print/payments" element={<PrintPayments/>}/><Route path="/print/notifications" element={<PrintNotifications/>}/><Route path="/print/support" element={<Navigate to="/print/get-in-touch" replace/>}/><Route path="/print/get-in-touch" element={<PrintGetInTouch/>}/><Route path="/print/operations" element={<PrintOperations/>}/><Route path="/print/manage" element={<PrintOperations/>}/><Route path="/print/manage/pricing" element={<PrintPricingManagement/>}/><Route path="/print/products" element={<PrintFeaturePage mode="products"/>}/><Route path="/print/artwork" element={<PrintFeaturePage mode="artwork"/>}/><Route path="/print/inventory" element={<PrintFeaturePage mode="inventory"/>}/><Route path="/print/qc" element={<PrintFeaturePage mode="qc"/>}/><Route path="/print/delivery" element={<PrintFeaturePage mode="delivery"/>}/><Route path="/signin" element={<PrintSignIn/>}/><Route path="*" element={<Navigate to="/print" replace/>}/></Routes>}

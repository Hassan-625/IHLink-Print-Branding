import {PrintHeader,PrintFooter} from '@/components/PrintShell';
import {BankTransferPayments} from '@/components/BankTransferPayments';
export function PrintPayments(){return <><PrintHeader/><main className="mx-auto max-w-6xl px-6 py-12"><h1 className="mb-6 text-3xl font-bold">Payments</h1><BankTransferPayments platform="print"/></main><PrintFooter/></>;}

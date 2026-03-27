import { Metadata } from 'next';
import { fetchTx } from '@/lib/api';
import { Hash, Clock, Cpu, ArrowRight, Activity, ArrowRightLeft, Database, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = await params;
  return {
    title: `Tx ${p.id.substring(0, 10)}... | QuaScan Explorer`,
    description: `Details for transaction ${p.id} on the Quanta network.`,
  };
}

export const revalidate = 10;

export default async function TxDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  if (!id) {
    notFound();
  }

  const txData = await fetchTx(id);
  
  if (!txData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-[#FFF8F0] mb-6">
          <div className="w-8 h-8 rounded-full border-2 border-[#F97316] text-[#F97316] flex items-center justify-center font-bold text-xl">
            !
          </div>
        </div>
        <h1 className="text-3xl font-black text-[#1e293b] mb-4">Transaction Not Found</h1>
        <p className="text-gray-500 max-w-lg mx-auto mb-8 leading-relaxed font-sans text-sm flex items-center justify-center flex-wrap gap-2">
          The transaction <span className="text-gray-900 bg-white px-3 py-1.5 rounded inline-block font-mono text-xs shadow-sm shadow-white/10">{id.substring(0, 20)}...</span> could not be found via the<br />Node RPC.
        </p>
        <div className="bg-gradient-to-br from-[#EFE3D5] to-[#D5C2AD] rounded-xl p-8 max-w-3xl mx-auto text-left shadow-lg border border-[#D5C2AD]/50">
          <h3 className="text-[#9F3F13] font-black mb-3 flex items-center gap-2 text-lg">
            <Database className="w-5 h-5" />
            Storage Index Note
          </h3>
          <p className="text-[#A74418] text-sm leading-relaxed mb-6 font-medium">
            This Quanta Node is currently configured to <strong className="font-extrabold text-[#C2410C]">skip indexing Miner Rewards (Coinbase) and Treasury transactions</strong> in its internal database to conserve disk space. If this transaction is a network reward, it safely exists on the active blockchain but cannot be queried directly by its hash.
          </p>
          <div className="pt-4 border-t border-[#D5C2AD]">
             <span className="text-[#C2410C] text-sm font-bold flex items-center gap-2"><ArrowRight className="w-4 h-4"/> To view Miner Rewards:</span>
             <p className="text-[#A74418] text-xs mt-1 ml-6 font-medium">Check the details of the specific blocks mined by the exact addresses.</p>
          </div>
        </div>
        <div className="mt-12">
          <Link href="/" className="inline-flex items-center justify-center px-8 py-3 bg-[#00E599] text-white font-bold rounded shadow-[0_0_25px_rgba(0,229,153,0.3)] hover:shadow-[0_0_35px_rgba(0,229,153,0.5)] transition-shadow">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const { tx_hash, status, transaction: tx, block_height } = txData;
  const isCoinbase = tx.sender === 'COINBASE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded bg-[#111827] border border-[#1f2937] flex items-center justify-center text-[#00E599] flex-shrink-0 shadow-lg mt-1">
          <ArrowRightLeft className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-[#e2e8f0] flex items-center gap-3">
            Transaction Details
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="dark-card p-6">
            <h3 className="text-lg font-bold text-[#e2e8f0] mb-6 flex items-center gap-2">
              <Hash className="w-5 h-5 text-[#00E599]" />
              Transaction Identifiers
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Transaction Hash</p>
                <div className="bg-[#0b0e14] border border-[#1f2937] rounded p-3 font-mono text-sm text-gray-300 break-all select-all flex items-center gap-2">
                  {tx_hash}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="dark-card p-6">
            <h3 className="text-lg font-bold text-[#e2e8f0] mb-6 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-[#00E599]" />
              Transfer Details
            </h3>
            
            <div className="space-y-4">
               <div className="bg-[#0b0e14] rounded p-5 border border-[#1f2937]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div>
                      <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">From</p>
                      {isCoinbase ? (
                         <span className="font-mono text-sm font-bold text-yellow-500 bg-[#111827] px-3 py-1.5 rounded border border-[#1f2937] flex items-center gap-2">
                           System (Coinbase)
                         </span>
                      ) : (
                         <Link href={`/address/${tx.sender}`} className="font-mono text-sm text-[#00E599] hover:text-[#00f0ff] break-all bg-[#111827] border border-[#1f2937] p-2 rounded block transition-colors">
                           {tx.sender}
                         </Link>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">To</p>
                      <Link href={`/address/${tx.recipient}`} className="font-mono text-sm text-[#00E599] hover:text-[#00f0ff] break-all bg-[#111827] border border-[#1f2937] p-2 rounded block transition-colors">
                        {tx.recipient}
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[#1f2937] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Amount</p>
                      <span className="font-black font-mono text-2xl text-[#00E599]">
                        {(tx.amount / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA
                      </span>
                    </div>

                    {!isCoinbase && (
                      <div className="sm:text-right">
                         <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Network Fee</p>
                         <span className="font-bold font-mono text-gray-400">
                           {(tx.fee / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA
                         </span>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="dark-card rounded p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#e2e8f0] mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#00E599]" />
              Status & Block Info
            </h3>
            
            <ul className="space-y-6">
              <li>
                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Status</p>
                {status === 'confirmed' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00E599]/10 text-[#00E599] rounded border border-[#00E599]/30 text-xs font-bold tracking-widest uppercase">
                     <div className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse"></div>
                     Confirmed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0b0e14] text-yellow-500 rounded border border-[#1f2937] text-xs font-bold tracking-widest uppercase">
                     <Clock className="w-3 h-3" />
                     Pending
                  </span>
                )}
              </li>

              {block_height !== null && status === 'confirmed' && (
                <li>
                  <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Included in Block</p>
                  <Link href={`/block/${block_height}`} className="font-mono text-sm font-bold text-[#e2e8f0] hover:text-[#00E599] bg-[#0b0e14] border border-[#1f2937] px-3 py-1.5 rounded inline-block transition-colors">
                    #{block_height}
                  </Link>
                </li>
              )}

              <li>
                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Nonce</p>
                <span className="font-mono text-sm text-[#e2e8f0] bg-[#0b0e14] border border-[#1f2937] px-3 py-1.5 rounded inline-block">
                  {tx.nonce}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

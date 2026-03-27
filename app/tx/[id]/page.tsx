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
        <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-orange-50 text-orange-500 mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Transaction Not Found</h1>
        <p className="text-gray-600 max-w-lg mx-auto mb-8 leading-relaxed">
          The transaction <span className="font-mono text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded inline-block mx-1 shadow-sm border border-gray-200">{id.substring(0, 20)}...</span> could not be found via the Node RPC.
        </p>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/60 p-6 rounded-2xl max-w-2xl mx-auto text-left shadow-sm">
          <h3 className="text-orange-800 font-bold mb-3 flex items-center gap-2 text-lg">
            <Database className="w-5 h-5 text-orange-600" />
            Storage Index Note
          </h3>
          <p className="text-orange-800/80 text-sm leading-relaxed">
            This Quanta Node is currently configured to <strong>skip indexing Miner Rewards (Coinbase) and Treasury transactions</strong> in its internal database to conserve disk space. If this transaction is a network reward, it safely exists on the active blockchain but cannot be queried directly by its hash.
          </p>
          <div className="mt-4 pt-4 border-t border-orange-200/50">
             <span className="text-orange-900 text-sm font-semibold flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-orange-600"/> To view Miner Rewards:</span>
             <p className="text-orange-800/80 text-sm mt-1 ml-5">Check the details of the specific blocks mined by the exact addresses.</p>
          </div>
        </div>
        <div className="mt-10">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#00E599] text-white font-bold rounded-xl shadow-lg shadow-[#00E599]/20 hover:shadow-[#00E599]/40 hover:-translate-y-0.5 transition-all">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const { tx_hash, status, transaction: tx, block_height } = txData;
  const isCoinbase = tx.sender === 'COINBASE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#00E599]/10 flex items-center justify-center text-[#00E599]">
          <ArrowRightLeft className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-black flex items-center gap-3">
            Transaction Details
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="sol-card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Hash className="w-5 h-5 text-[#00E599]" />
              Transaction Identifiers
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Transaction Hash</p>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-600 break-all select-all flex items-center gap-2">
                  {tx_hash}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="sol-card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-[#00E599]" />
              Transfer Details
            </h3>
            
            <div className="space-y-4">
               <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">From</p>
                      {isCoinbase ? (
                         <div className="font-mono text-sm text-gray-800 bg-yellow-100 inline-block px-3 py-1 rounded-md">
                           System (Coinbase) 🏆
                         </div>
                      ) : (
                         <Link href={`/address/${tx.sender}`} className="font-mono text-sm text-[#00E599] hover:text-emerald-500 break-all bg-[#00E599]/5 p-2 rounded-md block">
                           {tx.sender}
                         </Link>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">To</p>
                      <Link href={`/address/${tx.recipient}`} className="font-mono text-sm text-[#00E599] hover:text-emerald-500 break-all bg-[#00E599]/5 p-2 rounded-md block">
                        {tx.recipient}
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount</p>
                      <span className="font-bold text-2xl text-gray-900">
                        {(tx.amount / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA
                      </span>
                    </div>

                    {!isCoinbase && (
                      <div className="sm:text-right">
                         <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Network Fee</p>
                         <span className="font-bold text-gray-700">
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
          <div className="glass-card rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#00E599]" />
              Status & Block Info
            </h3>
            
            <ul className="space-y-6">
              <li>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</p>
                {status === 'confirmed' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md text-sm font-bold border border-emerald-200/60">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                     Confirmed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-md text-sm font-bold border border-yellow-200/60">
                     <Clock className="w-4 h-4" />
                     Pending (Mempool)
                  </span>
                )}
              </li>

              {block_height !== null && status === 'confirmed' && (
                <li>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Included in Block</p>
                  <Link href={`/block/${block_height}`} className="font-mono text-sm font-bold text-[#00E599] hover:underline bg-[#00E599]/10 px-3 py-1.5 rounded-md inline-block">
                    #{block_height}
                  </Link>
                </li>
              )}

              <li>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nonce</p>
                <span className="font-mono text-sm text-gray-900 bg-gray-100 px-3 py-1.5 rounded-md inline-block">
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

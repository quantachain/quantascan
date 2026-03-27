import { Metadata } from 'next';
import { fetchAddressInfo, fetchAddressTransactions } from '@/lib/api';
import { Wallet, Coins, History, CheckCircle2, ArrowRightCircle, ArrowLeftCircle, Lock } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = await params;
  return {
    title: `Address ${p.id.substring(0, 10)}... | QuaScan Explorer`,
    description: `Details for address ${p.id} on the Quanta network.`,
  };
}

export const revalidate = 10;

function TimeAgo({ timestamp }: { timestamp: number }) {
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60) return <>{diff}s</>;
  if (diff < 3600) return <>{Math.floor(diff / 60)}m</>;
  if (diff < 86400) return <>{Math.floor(diff / 3600)}h</>;
  return <>{Math.floor(diff / 86400)}d</>;
}

export default async function AddressDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  if (!id) {
    notFound();
  }

  const [data, txs] = await Promise.all([
    fetchAddressInfo(id),
    fetchAddressTransactions(id)
  ]);
  
  if (!data) {
    notFound();
  }

  // Calculate Locked/Spendable
  const spendableQua = data.balance_qua;
  const totalQua = data.total_balance_qua;
  const lockedQua = totalQua - spendableQua;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[#00E599]/10 flex items-center justify-center text-[#00E599] flex-shrink-0 mt-1">
          <Wallet className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-black mb-2 flex items-center gap-3">
            Address
          </h1>
          <div className="inline-flex max-w-full">
            <span className="bg-gray-50 border border-gray-100 rounded-lg p-3 font-mono text-sm md:text-base text-gray-600 break-all select-all flex items-center gap-2">
              {data.address}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Balance Card */}
        <div className="sol-card p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#00E599]" />
            Balance Synopsis
          </h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tighter text-black">
                  {totalQua.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </span>
                <span className="text-xl font-bold text-gray-500">QUA</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-medium">Spendable:</span>
              <span className="font-bold text-gray-900">{spendableQua.toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA</span>
            </div>

            {data.locked_balances.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium flex items-center gap-1"><Lock className="w-3 h-3"/> Locked/Vesting:</span>
                <span className="font-bold text-orange-600">{lockedQua.toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA</span>
              </div>
            )}
            
            <div className="pt-6 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Nonce</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
                  {data.nonce}
                </span>
                <span className="text-xs text-gray-400 font-medium">Transactions sent from this address</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Summary Card */}
        <div className="sol-card p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-[#00E599]" />
            Transaction Metrics
          </h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
               <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total Txs</span>
               <span className="font-mono text-xl font-black text-gray-900">{txs?.transaction_count || 0}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <History className="w-6 h-6 text-[#00E599]" />
        Recent Transactions
      </h3>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Tx Hash</th>
                <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Block</th>
                <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Age</th>
                <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Type</th>
                <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">From / To</th>
                <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount (QUA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {txs && txs.transactions.length > 0 ? (
                txs.transactions.map((txData, i) => {
                  const isReceiver = txData.recipient === id;
                  const amtQua = (txData.amount_microunits / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 });
                  const isCoinbase = txData.sender === 'COINBASE';

                  return (
                    <tr key={`${txData.tx_hash}-${i}`} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-5">
                        <Link href={`/tx/${txData.tx_hash}`} className="font-mono text-sm font-bold text-[#00E599] hover:text-emerald-600 transition-colors">
                          {txData.tx_hash.substring(0, 16)}...
                        </Link>
                      </td>
                      <td className="py-4 px-5">
                        <Link href={`/block/${txData.block_height}`} className="font-mono text-sm text-gray-600 hover:text-[#00E599] hover:underline transition-colors">
                          {txData.block_height}
                        </Link>
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-sm text-gray-700 font-medium">
                           <TimeAgo timestamp={txData.block_time} /> ago
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        {isCoinbase ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-md text-xs font-bold border border-yellow-200/60">
                            Miner Reward
                          </span>
                        ) : isReceiver ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold border border-emerald-200/60">
                            <ArrowLeftCircle className="w-3.5 h-3.5" /> IN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-bold border border-orange-200/60">
                            <ArrowRightCircle className="w-3.5 h-3.5" /> OUT
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        {isReceiver ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">From</span>
                            <span className="font-mono text-sm text-gray-600">{txData.sender.length > 20 ? `${txData.sender.substring(0, 16)}...` : txData.sender}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">To</span>
                            <span className="font-mono text-sm text-gray-600">{txData.recipient.length > 20 ? `${txData.recipient.substring(0, 16)}...` : txData.recipient}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right font-mono text-sm font-bold text-gray-900">
                        {amtQua} {isCoinbase && <span className="text-yellow-600 ml-1">🏆</span>}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="inline-flex flex-col items-center justify-center">
                      <History className="w-8 h-8 text-gray-300 mb-3" />
                      <span className="text-gray-500 text-sm font-medium">No transactions found for this address.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

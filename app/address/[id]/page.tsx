import { Metadata } from 'next';
import { fetchAddressInfo, fetchAddressTransactions } from '@/lib/api';
import { Wallet, Coins, History, ArrowRightCircle, ArrowLeftCircle, Lock } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-12">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-16 h-16 rounded bg-[#111827] border border-[#1f2937] flex items-center justify-center text-[#00E599] flex-shrink-0 mt-1 shadow-lg">
          <Wallet className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-[#e2e8f0] mb-2 flex items-center gap-3">
            Address
          </h1>
          <div className="inline-flex max-w-full">
            <span className="bg-[#0b0e14] border border-[#1f2937] rounded p-3 font-mono text-sm md:text-base text-[#00E599] break-all select-all flex items-center gap-2">
              {data.address}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Balance Card */}
        <div className="dark-card p-8">
          <h3 className="text-lg font-bold text-[#e2e8f0] mb-6 flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#00E599]" />
            Balance Synopsis
          </h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Total Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono tracking-tighter text-[#00f0ff]">
                  {totalQua.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </span>
                <span className="text-xl font-bold font-mono text-gray-500">QUA</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm border-b border-[#1f2937]/50 pb-2">
              <span className="text-gray-500 font-mono text-xs uppercase tracking-widest">Spendable:</span>
              <span className="font-bold font-mono text-[#00E599]">{spendableQua.toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA</span>
            </div>

            {data.locked_balances.length > 0 && (
              <div className="flex items-center justify-between text-sm border-b border-[#1f2937]/50 pb-2">
                <span className="text-gray-500 font-mono text-xs uppercase tracking-widest flex items-center gap-1">
                  <Lock className="w-3 h-3"/> Locked/Vesting:
                </span>
                <span className="font-bold font-mono text-orange-400">{lockedQua.toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA</span>
              </div>
            )}
            
            <div className="pt-4">
              <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Account Nonce</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-yellow-500 bg-[#0b0e14] border border-[#1f2937] px-3 py-1 rounded">
                  {data.nonce}
                </span>
                <span className="text-xs text-gray-500 font-mono">Transactions sent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Summary Card */}
        <div className="dark-card p-8">
          <h3 className="text-lg font-bold text-[#e2e8f0] mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-[#00f0ff]" />
            Transaction Metrics
          </h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between bg-[#0b0e14] border border-[#1f2937] p-4 rounded">
               <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Total Txs</span>
               <span className="font-mono text-2xl font-black text-[#e2e8f0]">{txs?.transaction_count || 0}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <h3 className="text-xl font-bold text-[#e2e8f0] mb-6 flex items-center gap-2">
        <History className="w-6 h-6 text-[#00E599]" />
        Recent Transactions
      </h3>
      <div className="dark-card overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap font-mono">
            <thead>
              <tr className="bg-[#0b0e14] border-b border-[#1f2937]">
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tx Hash</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Block</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Age</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Type</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">From / To</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Amount (QUA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50 bg-[#111827]">
              {txs && txs.transactions.length > 0 ? (
                txs.transactions.map((txData, i) => {
                  const isReceiver = txData.recipient === id;
                  const amtQua = (txData.amount_microunits / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 });
                  const isCoinbase = txData.sender === 'COINBASE';

                  return (
                    <tr key={`${txData.tx_hash}-${i}`} className="hover:bg-[#1a2235]/50 transition-colors">
                      <td className="py-4 px-5">
                        <Link href={`/tx/${txData.tx_hash}`} className="text-sm text-[#00E599] hover:underline opacity-80 hover:opacity-100 transition-opacity">
                          {txData.tx_hash.substring(0, 16)}...
                        </Link>
                      </td>
                      <td className="py-4 px-5">
                        <Link href={`/block/${txData.block_height}`} className="text-sm font-bold text-[#e2e8f0] hover:text-[#00E599] transition-colors">
                          {txData.block_height}
                        </Link>
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-sm text-gray-400">
                           <TimeAgo timestamp={txData.block_time} />
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        {isCoinbase ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0b0e14] text-yellow-500 rounded border border-[#1f2937] text-[10px] uppercase tracking-widest">
                            Miner Reward
                          </span>
                        ) : isReceiver ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00E599]/10 text-[#00E599] rounded border border-[#00E599]/30 text-[10px] uppercase tracking-widest">
                            <ArrowLeftCircle className="w-3.5 h-3.5" /> IN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#111827] text-orange-400 rounded border border-[#1f2937] text-[10px] uppercase tracking-widest">
                            <ArrowRightCircle className="w-3.5 h-3.5" /> OUT
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-sm">
                        {isReceiver ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">From</span>
                            <span className="text-gray-300">{txData.sender.length > 20 ? `${txData.sender.substring(0, 10)}...${txData.sender.substring(txData.sender.length - 6)}` : txData.sender}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">To</span>
                            <span className="text-gray-300">{txData.recipient.length > 20 ? `${txData.recipient.substring(0, 10)}...${txData.recipient.substring(txData.recipient.length - 6)}` : txData.recipient}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right text-sm font-bold text-[#e2e8f0]">
                        {amtQua}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="inline-flex flex-col items-center justify-center">
                      <History className="w-8 h-8 text-[#1f2937] mb-3" />
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

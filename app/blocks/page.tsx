import { Metadata } from 'next';
import { fetchStats, fetchBlock, Block } from '@/lib/api';
import { Box, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blocks | QuaScan Explorer',
  description: 'View all blocks on the Quanta network.',
};

export const revalidate = 10;

function TimeAgo({ timestamp }: { timestamp: number }) {
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60) return <>{diff}s ago</>;
  if (diff < 3600) return <>{Math.floor(diff / 60)}m ago</>;
  if (diff < 86400) return <>{Math.floor(diff / 3600)}h ago</>;
  return <>{Math.floor(diff / 86400)}d ago</>;
}

export default async function BlocksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const pageStr = typeof params.page === 'string' ? params.page : '1';
  let page = parseInt(pageStr, 10);
  if (isNaN(page) || page < 1) page = 1;
  const pageSize = 20;

  const stats = await fetchStats();
  const currentHeight = stats ? stats.chain_length : 0;
  
  const totalPages = Math.ceil(currentHeight / pageSize);
  if (page > totalPages && totalPages > 0) page = totalPages;

  const startHeight = Math.max(0, currentHeight - 1 - (page - 1) * pageSize);
  const endHeight = Math.max(0, startHeight - pageSize + 1);

  const blockPromises = [];
  for (let i = startHeight; i >= endHeight; i--) {
    if (i >= 0) {
      blockPromises.push(fetchBlock(i));
    }
  }

  const blocksUnfiltered = await Promise.all(blockPromises);
  const blocks = blocksUnfiltered.filter((b): b is Block => b !== null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded bg-[#111827] border border-[#1f2937] flex items-center justify-center text-[#00E599] shadow-lg mt-1">
          <Box className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-[#e2e8f0]">Blocks</h1>
          <p className="text-gray-500 text-xs font-mono mt-2">Showing blocks from #{startHeight} to #{endHeight}</p>
        </div>
      </div>

      <div className="dark-card overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap font-mono">
            <thead>
              <tr className="bg-[#0b0e14] border-b border-[#1f2937]">
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Height</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Age</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transactions</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Miner</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Difficulty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50 bg-[#111827]">
              {blocks.map((block) => {
                const miner = block.transactions.find(tx => tx.sender === 'COINBASE')?.recipient || 'Unknown';
                return (
                <tr key={block.index} className="hover:bg-[#1a2235]/50 transition-colors">
                  <td className="py-4 px-6">
                    <Link href={`/block/${block.index}`} className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded bg-[#0b0e14] border border-[#1f2937] flex items-center justify-center text-[#e2e8f0] font-mono text-sm hover:border-[#00E599] transition-colors">
                        #{block.index}
                      </div>
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-400 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <TimeAgo timestamp={block.timestamp} />
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-[#e2e8f0]">
                    <span className="px-3 py-1.5 bg-[#00E599]/10 text-[#00E599] border border-[#00E599]/30 rounded">
                      {block.transactions.length} txns
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-sm">
                    <Link href={`/address/${miner}`} className="text-[#00E599] hover:underline hover:text-[#00f0ff] transition-colors">
                      {miner.length > 16 ? `${miner.substring(0, 16)}...` : miner}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-400 font-mono">
                    {block.difficulty.toLocaleString()}
                  </td>
                </tr>
              )})}
              {blocks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                    No blocks found on this page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Link
            href={page > 1 ? `/blocks?page=${page - 1}` : '#'}
            className={`w-10 h-10 rounded border border-[#1f2937] flex items-center justify-center transition-colors ${page > 1 ? 'bg-[#0b0e14] text-[#e2e8f0] hover:border-[#00E599] hover:text-[#00E599]' : 'bg-[#111827] text-gray-600 cursor-not-allowed'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm font-mono text-gray-400">
            Page <span className="text-[#e2e8f0] font-bold">{page}</span> of <span className="text-[#00E599]">{Math.max(1, totalPages)}</span>
          </span>
          <Link
            href={page < totalPages ? `/blocks?page=${page + 1}` : '#'}
            className={`w-10 h-10 rounded border border-[#1f2937] flex items-center justify-center transition-colors ${page < totalPages ? 'bg-[#0b0e14] text-[#e2e8f0] hover:border-[#00E599] hover:text-[#00E599]' : 'bg-[#111827] text-gray-600 cursor-not-allowed'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
import { Github, Twitter, MessageSquare } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0b0e14] border-t border-[#1f2937] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-12">
          
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <span className="text-2xl font-black tracking-tight text-[#e2e8f0]">
                Qua<span className="text-[#00E599]">Scan</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              The official block explorer for Quanta Chain. Track blocks, transactions, and network metrics in real-time.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center text-gray-400 hover:text-[#00E599] hover:bg-[#1f2937] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center text-gray-400 hover:text-[#00E599] hover:bg-[#1f2937] transition-colors">
                <MessageSquare className="w-5 h-5" />
              </a>
              <a href="https://github.com/quantachain/quanta" className="w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center text-gray-400 hover:text-[#00E599] hover:bg-[#1f2937] transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[#e2e8f0] mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="https://quantachain.gitbook.io/quantachain-docs" className="text-sm text-gray-400 hover:text-[#00E599] transition-colors">Developer Docs</Link></li>
              <li><Link href="https://github.com/quantachain/quanta" className="text-sm text-gray-400 hover:text-[#00E599] transition-colors">Node Software</Link></li>
              <li><Link href="https://chromewebstore.google.com/detail/quanta-wallet/glofbcgdmodmaohealombcgoapdbdaff" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-[#00E599] transition-colors">Wallet Extension</Link></li>
            </ul>
          </div>



        </div>

        <div className="pt-8 border-t border-[#1f2937] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} QuantaChain. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="#" className="text-gray-500 hover:text-gray-300">Privacy Policy</Link>
            <Link href="#" className="text-gray-500 hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

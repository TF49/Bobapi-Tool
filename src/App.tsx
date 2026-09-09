import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { Minus, X, Bot, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { ChatGPTPanel } from './components/ChatGPTPanel';
import { ClaudePanel } from './components/ClaudePanel';
import { cn } from './lib/utils';
import { checkBobApiNetwork } from './lib/api';

type Tab = 'chatgpt' | 'claude';
type NetworkState = 'checking' | 'reachable' | 'unreachable';

export default function App() {
  const [tab, setTab] = useState<Tab>('chatgpt');
  const [networkState, setNetworkState] = useState<NetworkState>('checking');
  const win = getCurrentWindow();

  const checkNetwork = async () => {
    setNetworkState('checking');
    try {
      const { reachable } = await checkBobApiNetwork();
      setNetworkState(reachable ? 'reachable' : 'unreachable');
    } catch {
      setNetworkState('unreachable');
    }
  };

  useEffect(() => {
    void checkNetwork();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-gray-200 select-none overflow-hidden">
      {/* ── 标题栏 ── */}
      <div
        className="flex items-center justify-between h-11 px-4 bg-[#141414] border-b border-[#1f1f1f] flex-shrink-0"
        data-tauri-drag-region
      >
        {/* Logo + 标题 */}
        <div className="flex items-center gap-2 pointer-events-none">
          <Bot size={16} className="text-blue-400" />
          <span className="text-sm font-semibold text-gray-200">BobAPI Tool</span>
        </div>

        {/* 窗口控制按钮 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => win.minimize()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Minus size={13} />
          </button>
          <button
            onClick={() => win.close()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/80 text-gray-500 hover:text-white transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── Tab 切换栏 ── */}
      <div className="flex border-b border-[#1f1f1f] bg-[#141414] flex-shrink-0">
        {([
          { key: 'chatgpt', label: 'ChatGPT (Codex)' },
          { key: 'claude',  label: 'Claude Code' },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors relative',
              tab === key
                ? 'text-blue-400'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {label}
            {tab === key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t" />
            )}
          </button>
        ))}
      </div>

      <div
        className={cn(
          'flex items-center gap-2 px-5 py-2 text-xs border-b flex-shrink-0',
          networkState === 'reachable' && 'bg-green-500/10 border-green-500/20 text-green-400',
          networkState === 'unreachable' && 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
          networkState === 'checking' && 'bg-[#141414] border-[#1f1f1f] text-gray-500'
        )}
      >
        {networkState === 'checking' ? (
          <Loader2 size={14} className="animate-spin flex-shrink-0" />
        ) : networkState === 'reachable' ? (
          <Wifi size={14} className="flex-shrink-0" />
        ) : (
          <WifiOff size={14} className="flex-shrink-0" />
        )}
        <span className="flex-1">
          {networkState === 'checking' && '正在检测 bob-api.com 网络环境...'}
          {networkState === 'reachable' && 'bob-api.com 网络可用'}
          {networkState === 'unreachable' && '无法连接 bob-api.com，请确认 VPN 已连接后重试'}
        </span>
        <button
          type="button"
          onClick={() => void checkNetwork()}
          disabled={networkState === 'checking'}
          className="p-1 rounded hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
          title="重新检测网络"
        >
          <RefreshCw size={13} className={networkState === 'checking' ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── 内容区 ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {tab === 'chatgpt' ? <ChatGPTPanel /> : <ClaudePanel />}
      </div>

      {/* ── 底部版本信息 ── */}
      <div className="flex-shrink-0 px-5 py-2 border-t border-[#1f1f1f] text-center">
        <span className="text-xs text-gray-700">BobAPI Tool v1.0.0</span>
      </div>

      {/* ── Toast 通知 ── */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1f1f1f',
            border: '1px solid #2a2a2a',
            color: '#e5e5e5',
          },
        }}
      />
    </div>
  );
}

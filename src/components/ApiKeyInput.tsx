import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';

interface ApiKeyInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function ApiKeyInput({ value, onChange, placeholder = 'sk-...' }: ApiKeyInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10 font-mono"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className={cn(
          'absolute right-3 top-1/2 -translate-y-1/2',
          'text-gray-500 hover:text-gray-300 transition-colors'
        )}
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

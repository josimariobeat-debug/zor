import ScissorsLoader from '@/components/ScissorsLoader';
import scissorsUrl from '@/assets/scissors.svg';
import { cn } from '@/lib/utils';

interface ScissorsLoaderProps {
  className?: string;
  label?: string;
}

/**
 * Animated scissors loader — replaces the generic spinner.
 * The scissors "cut" with a subtle rocking + dashed seam underneath.
 */
export default function ScissorsLoader({ className, label }: ScissorsLoaderProps) {
  return (
    <div className="inline-flex flex-col items-center justify-center gap-2" role="status" aria-label={label || 'Carregando'}>
      <div className={cn('relative', className ?? 'w-10 h-10')}>
        {/* dashed "fabric seam" line */}
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[2px] overflow-visible"
          viewBox="0 0 100 2"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="1"
            x2="100"
            y2="1"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 3"
            className="text-stone-300 animate-[seam_1.4s_linear_infinite]"
          />
        </svg>
        {/* scissors */}
        <img
          src={scissorsUrl}
          alt=""
          aria-hidden="true"
          className="relative w-full h-full animate-[cut_1.4s_ease-in-out_infinite] origin-center"
          style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.08))' }}
        />
      </div>
      {label && <span className="text-xs text-stone-500">{label}</span>}
      <style>{`
        @keyframes cut {
          0%, 100% { transform: rotate(-6deg) scale(1); }
          50% { transform: rotate(6deg) scale(1.05); }
        }
        @keyframes seam {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -14; }
        }
      `}</style>
    </div>
  );
}

import * as React from 'react';
import { Input, type InputProps } from '@/components/ui/input';

type Value = number | null | undefined;

export interface NumberInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  value: Value;
  onChange: (value: number | null) => void;
  /** Allow empty -> null. Defaults to true. */
  allowEmpty?: boolean;
  /** Optional callback fired on blur with the normalized number (or null). */
  onValueBlur?: (value: number | null) => void;
  /** Casas decimais usadas na máscara pt-BR ao formatar no blur. Padrão: 2. */
  decimals?: number;
  /** Aplica máscara pt-BR (1.234,56) ao sair do foco. Padrão: true. */
  maskPtBR?: boolean;
}

const DEFAULT_PLACEHOLDER = '1.234,56';

/** Converte string digitada (pt-BR ou en) em número. */
function parseLocaleNumber(raw: string): number | null {
  if (!raw) return null;
  let s = raw.trim();
  if (s === '' || s === '-' || s === '.' || s === ',' || s === '-.' || s === '-,') return null;
  // Se tiver vírgula, assumimos pt-BR: remove pontos de milhar e troca vírgula por ponto.
  if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function formatPtBR(n: number, decimals: number): string {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * NumberInput: campo numérico controlado que aceita estado vazio durante a edição.
 *
 * - O estado interno é sempre `string`, permitindo que o usuário apague o valor
 *   sem que o zero reapareça.
 * - Durante o foco, exibe o conteúdo "cru" (com ponto decimal) para edição fluida.
 * - Ao sair do foco, aplica máscara pt-BR (ex.: 1.234,56).
 * - Emite `number | null` para o `onChange` do componente pai.
 */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      allowEmpty = true,
      onFocus,
      onBlur,
      onValueBlur,
      decimals = 2,
      maskPtBR = true,
      placeholder,
      inputMode,
      ...rest
    },
    ref
  ) => {
    const formatDisplay = React.useCallback(
      (v: Value) => {
        if (v === null || v === undefined || Number.isNaN(v)) return '';
        return maskPtBR ? formatPtBR(v as number, decimals) : String(v);
      },
      [maskPtBR, decimals]
    );

    const [text, setText] = React.useState<string>(() => formatDisplay(value));
    const [focused, setFocused] = React.useState(false);
    const lastEmitted = React.useRef<number | null>(value ?? null);

    // Sincroniza com o valor externo apenas quando o usuário não está editando.
    React.useEffect(() => {
      if (focused) return;
      const incoming = value ?? null;
      if (incoming !== lastEmitted.current) {
        setText(formatDisplay(value));
        lastEmitted.current = incoming;
      }
    }, [value, focused, formatDisplay]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Mantém o texto exatamente como digitado (sem máscara durante a edição).
      setText(raw);

      if (raw === '' || raw === '-' || raw === '.' || raw === ',' || raw === '-.' || raw === '-,') {
        if (allowEmpty) {
          lastEmitted.current = null;
          onChange(null);
        }
        return;
      }

      const parsed = parseLocaleNumber(raw);
      if (parsed !== null) {
        lastEmitted.current = parsed;
        onChange(parsed);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      // Mostra valor "cru" para facilitar edição (sem separador de milhar).
      const parsed = parseLocaleNumber(text);
      if (parsed !== null) {
        setText(String(parsed));
      }
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      const parsed = parseLocaleNumber(text);

      if (parsed === null) {
        if (!allowEmpty) {
          setText(formatDisplay(0));
          lastEmitted.current = 0;
          onChange(0);
          onValueBlur?.(0);
        } else {
          setText('');
          onValueBlur?.(null);
        }
      } else {
        setText(formatDisplay(parsed));
        onValueBlur?.(parsed);
      }
      onBlur?.(e);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode={inputMode ?? 'decimal'}
        value={text}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder ?? DEFAULT_PLACEHOLDER}
        {...rest}
      />
    );
  }
);
NumberInput.displayName = 'NumberInput';

export { NumberInput };

import * as React from 'react';
import { Input, type InputProps } from '@/components/ui/input';

type Value = number | null | undefined;

export type NumberInputVariant = 'quantity' | 'currency';

export interface NumberInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  value: Value;
  onChange: (value: number | null) => void;
  /** Allow empty -> null. Defaults to true. */
  allowEmpty?: boolean;
  /** Optional callback fired on blur with the normalized number (or null). */
  onValueBlur?: (value: number | null) => void;
  /**
   * - 'quantity' (padrão): número simples (1, 2, 1,5). Sem prefixo, sem máscara
   *   monetária, sem zero à esquerda, inicia vazio.
   * - 'currency': máscara monetária pt-BR (R$ 1.234,56), sempre 2 decimais ao
   *   sair do foco. Placeholder padrão "R$ 0,00".
   */
  variant?: NumberInputVariant;
  /** Casas decimais usadas na máscara. Padrão: 2 para currency, até 2 para quantity. */
  decimals?: number;
}

const CURRENCY_PLACEHOLDER = 'R$ 0,00';

/** Converte string digitada (pt-BR ou en, opcional prefixo R$) em número. */
function parseLocaleNumber(raw: string): number | null {
  if (!raw) return null;
  let s = raw.replace(/R\$\s?/gi, '').trim();
  if (s === '' || s === '-' || s === '.' || s === ',' || s === '-.' || s === '-,') return null;
  if (s.includes(',')) {
    // pt-BR: pontos são separadores de milhar, vírgula é decimal.
    s = s.replace(/\./g, '').replace(',', '.');
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function formatPtBR(n: number, minDecimals: number, maxDecimals: number): string {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
}

function formatCurrency(n: number, decimals: number): string {
  return `R$ ${formatPtBR(n, decimals, decimals)}`;
}

/**
 * NumberInput padronizado:
 * - Estado interno é sempre string (permite campo vazio durante a edição).
 * - Quantidade: número limpo, sem prefixo, sem máscara, sem zero à esquerda.
 * - Monetário: máscara R$ 1.234,56 aplicada apenas ao sair do foco.
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
      variant = 'quantity',
      decimals,
      placeholder,
      inputMode,
      ...rest
    },
    ref
  ) => {
    const effectiveDecimals = decimals ?? (variant === 'currency' ? 2 : 2);

    const formatDisplay = React.useCallback(
      (v: Value): string => {
        if (v === null || v === undefined || Number.isNaN(v)) return '';
        if (variant === 'currency') return formatCurrency(v as number, effectiveDecimals);
        // Quantidade: sem separador de milhar, vírgula como decimal, sem zeros à direita.
        return formatPtBR(v as number, 0, effectiveDecimals);
      },
      [variant, effectiveDecimals]
    );

    const [text, setText] = React.useState<string>(() => formatDisplay(value));
    const [focused, setFocused] = React.useState(false);
    const lastEmitted = React.useRef<number | null>(value ?? null);

    // Sincroniza com valor externo apenas fora do foco, evitando reinjetar 0
    // enquanto o usuário digita.
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
      setText(raw);

      const trimmed = raw.replace(/R\$\s?/gi, '').trim();
      if (
        trimmed === '' ||
        trimmed === '-' ||
        trimmed === '.' ||
        trimmed === ',' ||
        trimmed === '-.' ||
        trimmed === '-,'
      ) {
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
      // Mostra valor "cru" (sem máscara) para facilitar edição.
      const parsed = parseLocaleNumber(text);
      if (parsed !== null) {
        // Para quantidade, mantemos vírgula; para currency, removemos prefixo e milhar.
        setText(
          variant === 'currency'
            ? String(parsed)
            : formatPtBR(parsed, 0, effectiveDecimals).replace(/\./g, '')
        );
      }
      onFocus?.(e);
    };

    const roundToDecimals = (n: number) => {
      const f = Math.pow(10, effectiveDecimals);
      return Math.round(n * f) / f;
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
        // Em campos monetários, força 2 casas decimais para garantir consistência
        // ao gravar no banco (numeric). Quantidade preserva o número informado.
        const normalized = variant === 'currency' ? roundToDecimals(parsed) : parsed;
        if (normalized !== parsed) {
          lastEmitted.current = normalized;
          onChange(normalized);
        }
        setText(formatDisplay(normalized));
        onValueBlur?.(normalized);
      }
      onBlur?.(e);
    };


    const resolvedPlaceholder =
      placeholder ?? (variant === 'currency' ? CURRENCY_PLACEHOLDER : undefined);

    return (
      <Input
        ref={ref}
        type="text"
        inputMode={inputMode ?? 'decimal'}
        value={text}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={resolvedPlaceholder}
        {...rest}
      />
    );
  }
);
NumberInput.displayName = 'NumberInput';

export { NumberInput };

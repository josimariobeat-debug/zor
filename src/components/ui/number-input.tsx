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
}

/**
 * NumberInput: campo numérico controlado que aceita estado vazio durante a edição.
 *
 * Diferente de um <Input type="number"> com `parseFloat(...) || 0`, este componente
 * mantém o conteúdo digitado como string. O usuário pode apagar o valor sem que o
 * zero reapareça. A conversão para número acontece quando há um valor válido (ou
 * no onBlur), preservando a experiência tipo Gmail/Notion.
 */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, allowEmpty = true, onFocus, onBlur, onValueBlur, ...rest }, ref) => {
    const toString = React.useCallback(
      (v: Value) => (v === null || v === undefined || Number.isNaN(v) ? '' : String(v)),
      []
    );

    const [text, setText] = React.useState<string>(() => toString(value));
    const [focused, setFocused] = React.useState(false);
    const lastEmitted = React.useRef<number | null>(value ?? null);

    // Sincroniza com o valor externo apenas quando o usuário não está editando.
    // Isso evita que o componente "reinjete" o valor (ex.: 0) enquanto a pessoa
    // está apagando o conteúdo para digitar outro número.
    React.useEffect(() => {
      if (focused) return;
      const incoming = value ?? null;
      if (incoming !== lastEmitted.current) {
        setText(toString(value));
        lastEmitted.current = incoming;
      }
    }, [value, focused, toString]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setText(raw);

      if (raw === '' || raw === '-' || raw === '.' || raw === '-.') {
        if (allowEmpty) {
          lastEmitted.current = null;
          onChange(null);
        }
        return;
      }

      const parsed = Number(raw);
      if (Number.isFinite(parsed)) {
        lastEmitted.current = parsed;
        onChange(parsed);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      if (text === '' || text === '-' || text === '.' || text === '-.') {
        if (!allowEmpty) {
          setText('0');
          lastEmitted.current = 0;
          onChange(0);
          onValueBlur?.(0);
        } else {
          onValueBlur?.(null);
        }
      } else {
        const parsed = Number(text);
        if (Number.isFinite(parsed)) {
          setText(String(parsed));
          onValueBlur?.(parsed);
        }
      }
      onBlur?.(e);
    };

    return (
      <Input
        ref={ref}
        type="number"
        inputMode="decimal"
        value={text}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
    );
  }
);
NumberInput.displayName = 'NumberInput';

export { NumberInput };

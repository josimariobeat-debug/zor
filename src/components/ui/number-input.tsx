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
  ({ value, onChange, allowEmpty = true, onBlur, onValueBlur, ...rest }, ref) => {
    const toString = React.useCallback(
      (v: Value) => (v === null || v === undefined || Number.isNaN(v) ? '' : String(v)),
      []
    );

    const [text, setText] = React.useState<string>(() => toString(value));
    const lastEmitted = React.useRef<number | null>(value ?? null);

    // Mantém o input em sincronia quando o valor externo realmente muda
    // (ex.: carga inicial do registro, reset do formulário). Não sobrescreve
    // a digitação em andamento quando o valor externo equivale ao último emitido.
    React.useEffect(() => {
      const incoming = value ?? null;
      if (incoming !== lastEmitted.current) {
        setText(toString(value));
        lastEmitted.current = incoming;
      }
    }, [value, toString]);

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

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (text === '' || text === '-' || text === '.' || text === '-.') {
        if (allowEmpty) {
          onValueBlur?.(null);
        } else {
          // sem allowEmpty, normaliza para 0
          setText('0');
          lastEmitted.current = 0;
          onChange(0);
          onValueBlur?.(0);
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
        onBlur={handleBlur}
        {...rest}
      />
    );
  }
);
NumberInput.displayName = 'NumberInput';

export { NumberInput };

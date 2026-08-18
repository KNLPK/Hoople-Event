import { useState } from 'react';
import { Check, CheckCircle, ChevronDown, Close, Plus } from '@/components/ui/icons';

/** The form primitives the builder repeats — label block, input, textarea, tiles, tokens. */

export function FieldHead({
  label,
  hint,
  required = false,
  saved = false,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  /** Shows the "Saved" tick once the field holds something. */
  saved?: boolean;
}) {
  return (
    <div className="wiz-field__head">
      <div>
        <span className="block text-[13.5px] font-semibold text-ink">
          {label}
          {required ? <span className="text-danger"> *</span> : null}
        </span>
        {hint ? <span className="wiz-field__hint">{hint}</span> : null}
      </div>
      {saved ? (
        <span className="inline-flex items-center gap-1.5 flex-none text-[12px] font-semibold text-green">
          <CheckCircle size={14} color="#16A34A" strokeWidth={2} />
          Saved
        </span>
      ) : null}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
}) {
  return (
    <input
      className="wiz-input"
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

/** A single-line input that shows how much of its budget is used, as 2.1 does. */
export function CounterInput({
  value,
  onChange,
  limit,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  limit: number;
  placeholder: string;
  ariaLabel: string;
}) {
  return (
    <div className="wiz-counted">
      <input
        className="wiz-input"
        value={value}
        maxLength={limit}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="wiz-counted__count">
        {value.length} / {limit}
      </span>
    </div>
  );
}

/** An input framed by a unit — `Rp | 250.000` or `10 | slots`. */
export function AffixInput({
  value,
  onChange,
  ariaLabel,
  prefix,
  suffix,
  leading,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  prefix?: string;
  suffix?: string;
  leading?: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <span className="wiz-affix">
      {prefix ? <span className="wiz-affix__prefix">{prefix}</span> : null}
      {leading ? <span className="flex pl-[13px]">{leading}</span> : null}
      <input
        value={value}
        inputMode="numeric"
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
      />
      {suffix ? <span className="wiz-affix__suffix">{suffix}</span> : null}
    </span>
  );
}

/** A plain radio line — title over description, no card around it. */
export function RadioRow({
  checked,
  onSelect,
  title,
  sub,
  name,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  sub: string;
  name: string;
}) {
  return (
    <label className={`wiz-radio ${checked ? 'is-on' : ''}`.trim()}>
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="sr-only" />
      <span className="wiz-tile__radio" aria-hidden="true" />
      <span>
        <span className="wiz-radio__title">{title}</span>
        <span className="wiz-radio__sub">{sub}</span>
      </span>
    </label>
  );
}

/** An on/off switch, for settings that read better as a state than a tick. */
export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className={`wiz-toggle ${checked ? 'is-on' : ''}`.trim()}>
      <input
        type="checkbox"
        role="switch"
        className="sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="wiz-toggle__track" aria-hidden="true">
        <span className="wiz-toggle__knob" />
      </span>
      <span>
        <span className="block text-[13.5px] font-semibold text-ink">{label}</span>
        {hint ? <span className="wiz-field__hint">{hint}</span> : null}
      </span>
    </label>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className={`wiz-check ${checked ? 'is-on' : ''}`.trim()}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="wiz-check__box" aria-hidden="true">
        <Check size={11} color="#fff" strokeWidth={3} />
      </span>
      {label}
    </label>
  );
}

export function SelectInput({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  leading,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  /** Shown as a greyed first option while nothing is picked. */
  placeholder?: string;
  ariaLabel: string;
  leading?: React.ReactNode;
}) {
  return (
    <span className={`wiz-select ${value === '' ? 'is-empty' : ''}`.trim()}>
      {leading}
      <select value={value} aria-label={ariaLabel} onChange={(event) => onChange(event.target.value)}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown size={16} color="#8B8A99" />
    </span>
  );
}

export function CounterArea({
  value,
  onChange,
  limit,
  placeholder,
  ariaLabel,
  rows = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  limit: number;
  placeholder: string;
  ariaLabel: string;
  rows?: number;
}) {
  return (
    <div className="wiz-area">
      <textarea
        value={value}
        rows={rows}
        maxLength={limit}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="self-end text-[11.5px] text-grey-faint pointer-events-none">
        {value.length} / {limit}
      </span>
    </div>
  );
}

export function ChoiceTile({
  checked,
  onSelect,
  title,
  sub,
  icon,
  name,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  sub: string;
  icon?: React.ReactNode;
  name: string;
}) {
  return (
    <label className={`wiz-tile ${checked ? 'is-on' : ''}`.trim()}>
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="sr-only" />
      <span className="wiz-tile__radio" aria-hidden="true" />
      <span className="flex-1 min-w-0">
        <span className="wiz-tile__title">{title}</span>
        <span className="block text-[12px] text-grey mt-[3px] leading-[1.45]">{sub}</span>
      </span>
      {icon ? <span className="flex-none flex mt-px">{icon}</span> : null}
    </label>
  );
}

/**
 * A removable list of short values (tags, inclusions) with an add panel that
 * offers the suggestions not already picked.
 */
export function TokenList({
  values,
  onChange,
  suggestions,
  addLabel,
  inputPlaceholder,
  ticked = false,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  suggestions: string[];
  addLabel: string;
  inputPlaceholder: string;
  /** Renders a tick before each token, as the inclusion list does. */
  ticked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [entry, setEntry] = useState('');

  const unused = suggestions.filter((option) => !values.includes(option));

  function add(value: string) {
    const clean = value.trim();
    if (!clean || values.includes(clean)) return;
    onChange([...values, clean]);
    setEntry('');
  }

  return (
    <div className={`wiz-tokens ${open ? 'is-open' : ''}`.trim()}>
      <div className="flex flex-wrap items-center gap-[9px] pt-[11px] pr-[46px] pb-[11px] pl-3 relative">
        {values.map((value) => (
          <span key={value} className={`wiz-token ${ticked ? 'wiz-token--ticked' : ''}`.trim()}>
            {ticked ? <CheckCircle size={14} color="#6D28FF" strokeWidth={2} /> : null}
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((item) => item !== value))}
              aria-label={`Remove ${value}`}
            >
              <Close size={12} color="#6B6A7B" />
            </button>
          </span>
        ))}

        <button type="button" className="wiz-token__add" onClick={() => setOpen((was) => !was)}>
          <Plus size={13} color="#6D28FF" />
          {addLabel}
        </button>

        <button
          type="button"
          className="wiz-tokens__toggle"
          onClick={() => setOpen((was) => !was)}
          aria-expanded={open}
          aria-label={open ? 'Hide suggestions' : 'Show suggestions'}
        >
          <ChevronDown size={16} color="#8B8A99" className={open ? 'is-flipped' : undefined} />
        </button>
      </div>

      {open ? (
        <div className="border-t border-t-line-faint py-[13px] px-3">
          <form
            className="wiz-tokens__form"
            onSubmit={(event) => {
              event.preventDefault();
              add(entry);
            }}
          >
            <input
              value={entry}
              placeholder={inputPlaceholder}
              aria-label={inputPlaceholder}
              onChange={(event) => setEntry(event.target.value)}
            />
            <button type="submit" disabled={entry.trim() === ''}>
              Add
            </button>
          </form>

          {unused.length > 0 ? (
            <div className="wiz-tokens__suggest">
              {unused.map((option) => (
                <button key={option} type="button" onClick={() => add(option)}>
                  <Plus size={12} color="#6D28FF" />
                  {option}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

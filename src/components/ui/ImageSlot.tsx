import { useEffect, useId, useRef, useState } from 'react';

/**
 * A drop-in image placeholder.
 *
 * Every photo in the app renders through this so real assets can be added
 * later without touching layout: drag an image file onto a slot (or click to
 * browse) and it fills, persisting under its `id` so it survives a reload.
 */

const STORAGE_KEY = 'hoople.image-slots';

type SlotMap = Record<string, string>;

function readSlots(): SlotMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as SlotMap;
  } catch {
    return {};
  }
}

function writeSlot(id: string, dataUrl: string): void {
  try {
    const slots = readSlots();
    slots[id] = dataUrl;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
  } catch {
    /* Quota exceeded — the slot still fills for this session. */
  }
}

export type ImageSlotShape = 'rect' | 'rounded' | 'circle' | 'pill';

export interface ImageSlotProps {
  /** Persistence key. Two slots sharing an `id` share the same image. */
  id: string;
  /** Hint shown while the slot is empty, e.g. "Drop hero photo — pottery wheel". */
  placeholder?: string;
  /** Second, quieter line under the placeholder — file types, dimensions. */
  hint?: string;
  shape?: ImageSlotShape;
  /** Corner radius in px when `shape` is `rounded`. */
  radius?: number;
  /** Pre-filled image URL. Changing it re-fills the slot. */
  src?: string;
  /** Fires whenever the slot's image changes, so a preview can follow along. */
  onChange?: (dataUrl: string) => void;
  /**
   * `false` renders a plain element instead of a button, so the slot can live
   * inside another control (nesting buttons is invalid HTML and breaks clicks).
   * Drag-and-drop still fills it; click-to-browse does not.
   */
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function ImageSlot({
  id,
  placeholder = 'Drop an image',
  hint,
  shape = 'rounded',
  radius = 12,
  src,
  onChange,
  interactive = true,
  className = '',
  style,
}: ImageSlotProps) {
  const [image, setImage] = useState<string | undefined>(src);
  const [isOver, setIsOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  /* Held in a ref so a fresh callback each render can't re-run the effects. */
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const stored = readSlots()[id];
    if (stored) {
      setImage(stored);
      onChangeRef.current?.(stored);
    }
  }, [id]);

  useEffect(() => {
    if (src) setImage(src);
  }, [src]);

  function accept(file: File | undefined): void {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setImage(dataUrl);
      writeSlot(id, dataUrl);
      onChangeRef.current?.(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  const shapeClass =
    shape === 'circle' ? 'image-slot--circle' : shape === 'pill' ? 'image-slot--pill' : '';
  const borderRadius = shape === 'rounded' ? radius : shape === 'rect' ? 0 : undefined;

  const contents = image ? (
    <img src={image} alt={placeholder} />
  ) : placeholder === '' ? null : (
    <span className="image-slot__label" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <circle cx="8.5" cy="9.5" r="1.6" />
        <path d="m4 17 5-4.5 4.5 4 3-2.5L20 18" strokeLinejoin="round" />
      </svg>
      {placeholder}
      {hint ? <span className="image-slot__hint">{hint}</span> : null}
    </span>
  );

  const shared = {
    className: ['image-slot', shapeClass, image ? 'is-filled' : '', isOver ? 'is-over' : '', className]
      .filter(Boolean)
      .join(' '),
    style: { borderRadius, ...style },
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault();
      setIsOver(true);
    },
    onDragLeave: () => setIsOver(false),
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      setIsOver(false);
      accept(event.dataTransfer.files[0]);
    },
  };

  if (!interactive) {
    return (
      <div {...shared} role="img" aria-label={placeholder || 'Image placeholder'}>
        {contents}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        {...shared}
        onClick={() => inputRef.current?.click()}
        aria-label={image ? placeholder : `${placeholder} — click or drop an image to fill`}
      >
        {contents}
      </button>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => accept(event.target.files?.[0])}
      />
    </>
  );
}

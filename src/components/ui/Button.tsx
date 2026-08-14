import { Link } from 'react-router-dom';
import { spawnRipple } from '@/lib/motion';

/**
 * The one button in the app. Renders as a `<button>`, a router `<Link>`, or a
 * plain `<a>` depending on the props, and carries the shared hover sweep and
 * click ripple in every form.
 */

export type ButtonVariant =
  | 'primary'
  | 'green'
  | 'outline'
  | 'ghost'
  | 'neutral'
  | 'onDark'
  | 'white';

export type ButtonSize = 'sm' | 'nav' | 'md' | 'lg' | 'xl';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  /** Adds the pulsing halo reserved for a page's single primary CTA. */
  halo?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

type ButtonProps = CommonProps & {
  as?: 'button';
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

type LinkProps = CommonProps & {
  as: 'link';
  to: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

type AnchorProps = CommonProps & {
  as: 'a';
  href: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

export type Props = ButtonProps | LinkProps | AnchorProps;

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'btn--sm',
  nav: 'btn--nav',
  md: '',
  lg: 'btn--lg',
  xl: 'btn--xl',
};

/** Light variants get a purple-tinted sweep so the glint stays visible. */
const LIGHT_VARIANTS: ButtonVariant[] = ['outline', 'ghost', 'neutral', 'white'];

export function Button(props: Props) {
  const {
    variant = 'primary',
    size = 'md',
    block = false,
    halo = false,
    className = '',
    style,
    children,
  } = props;

  const classes = [
    'btn',
    `btn--${variant}`,
    SIZE_CLASS[size],
    block ? 'btn--block' : '',
    'sweep',
    LIGHT_VARIANTS.includes(variant) ? 'sweep--ink' : '',
    halo ? 'halo' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const glint = <span className="sweep__glint" aria-hidden="true" />;

  if (props.as === 'link') {
    return (
      <Link
        to={props.to}
        className={classes}
        style={style}
        onClick={(event) => {
          spawnRipple(event);
          props.onClick?.(event);
        }}
      >
        {children}
        {glint}
      </Link>
    );
  }

  if (props.as === 'a') {
    return (
      <a
        href={props.href}
        className={classes}
        style={style}
        onClick={(event) => {
          spawnRipple(event);
          props.onClick?.(event);
        }}
      >
        {children}
        {glint}
      </a>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      className={classes}
      style={style}
      disabled={props.disabled}
      onClick={(event) => {
        spawnRipple(event);
        props.onClick?.(event);
      }}
    >
      {children}
      {glint}
    </button>
  );
}

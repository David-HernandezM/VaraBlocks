import { cva, type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import styles from './buttons.module.scss';

export const buttonVariants = cva('', {
  variants: {
    variant: {
      primary: styles.primary,
      white: styles.white,
      black: styles.black,
      outline: styles.outline,
      text: styles.text,
      lightBlue: styles.lightBlue
    },
    size: {
      small: styles.sm,
      medium: styles.md,
      container: styles.cs
    },
    textSize: {
      small: styles.txtSmall,
      medium: styles.txtMedium,
      large: styles.txtLarge
    },
    textWeight: {
      weight1: styles.textWeight1,
      weight2: styles.textWeight2,
      weight3: styles.textWeight3,
      weightBold: styles.textWeightBold
    },
    rounded: {
      rounded1: styles.rounded1,
      rounded2: styles.rounded2,
      rounded3: styles.rounded3,
      rounded4: styles.rounded4
    },
    width: {
      normal: '',
      full: styles.block,
    },
    state: {
      normal: '',
      loading: styles.loading,
    },
  },
  // compoundVariants: [{ variant: 'primary', size: 'medium', className: styles.primaryMedium }],
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
    state: 'normal',
    width: 'normal',
  },
});

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({
  children,
  className,
  variant,
  size,
  textSize,
  textWeight,
  rounded,
  state,
  isLoading,
  width,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={buttonVariants({
        variant,
        size,
        textSize,
        textWeight,
        rounded,
        state: isLoading ? 'loading' : 'normal',
        width,
        className,
      })}
      disabled={disabled || isLoading}
      {...props}>
      {isLoading && <Loader2 width={20} height={20} className={styles.loader} />}
      {children}
    </button>
  );
}

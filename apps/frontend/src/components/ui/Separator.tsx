import {Separator as RACSeparator, type SeparatorProps} from 'react-aria-components/Separator';
import {tv} from 'tailwind-variants';

const styles = tv({
  base: 'bg-[var(--color-border)] border-none',
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'w-px min-h-4 h-full'
    }
  },
  defaultVariants: {
    orientation: 'horizontal'
  }
});

export function Separator(props: SeparatorProps) {
  return (
    <RACSeparator
      {...props}
      className={styles({orientation: props.orientation, className: props.className})}
    />
  );
}

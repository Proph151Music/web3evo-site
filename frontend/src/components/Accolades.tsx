import { twMerge } from 'tailwind-merge';

export type AccoladeData = {
  label: string;
  value: string;
};

export type AccoladesProps = {
  items: AccoladeData[];
  className?: string;
};

export default function Accolades({ items, className }: AccoladesProps) {
  const wrapperClassName = twMerge(
    'flex items-center gap-1 sm:gap-16 justify-between sm:justify-start ',
    className ?? ''
  );

  const itemWrapperClassName = twMerge(
    'font-space-mono flex items-baseline',
    items.length > 1 ? 'flex-col' : 'gap-3'
  );

  const itemLabelClassName = twMerge(
    'text-[18px]',
    items.length === 0 && 'xl:text-[24px]',
    items.length > 1 && 'xl:text-[24px]'
  );

  return (
    <div className={wrapperClassName}>
      {items.map((item, i) => (
        <div key={`${item.label}_${i}`} className={itemWrapperClassName}>
          <p className="font-semibold text-[22px] xl:text-[28px]">{item.value}</p>
          <p className={itemLabelClassName}>{item.label}</p>
        </div>
      ))}
    </div>
  );
}

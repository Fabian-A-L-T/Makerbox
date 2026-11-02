import {
  Cell as AriaCell,
  Column as AriaColumn,
  Row as AriaRow,
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  TableBody as AriaTableBody,
  Button,
  type CellProps,
  Collection,
  type ColumnProps,
  ColumnResizer,
  ResizableTableContainer,
  type RowProps,
  type TableHeaderProps,
  type TableProps as AriaTableProps,
  useTableOptions,
  type TableBodyProps,
  TableFooter as AriaTableFooter,
  type TableFooterProps
} from 'react-aria-components/Table';
import {Group} from 'react-aria-components/Group';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {twMerge} from 'tailwind-merge';
import {tv} from 'tailwind-variants';
import {Checkbox} from '../form/Checkbox';
import { RiArrowLeftLine, RiArrowUpLine, RiDraggable } from '@remixicon/react';

interface TableProps extends Omit<AriaTableProps, 'className'> {
  className?: string;
}

export function TableV2(props: TableProps) {
  return (
    <ResizableTableContainer
      onScroll={props.onScroll}
      className={twMerge(
        'makerbox-box !p-0 empty:min-h-32' ,
        props.className
      )}>
      <AriaTable
        {...props}
        className=""
      />
    </ResizableTableContainer>
  );
}

const resizerStyles = tv({
  base: 'w-px px-[8px] translate-x-[8px] box-content py-1 h-5 bg-clip-content  forced-colors:bg-[ButtonBorder] cursor-col-resize rounded-xs resizing:bg-blue-600 forced-colors:resizing:bg-[Highlight] resizing:w-[2px] resizing:pl-[7px] -outline-offset-2'
});

export function Column(props: ColumnProps) {
  return (
    <AriaColumn {...props}>
      {composeRenderProps(props.children, (children, {allowsSorting, sortDirection}) => (
        <div className={`${props.className || ''} p-3 flex items-center `}>
          <Group role="presentation" tabIndex={-1} className={'flex items-center'}>
            <span>{children}</span>
            {allowsSorting && (
              <span
                className={`w-4 h-4 flex items-center justify-center transition ${
                  sortDirection === 'descending' ? 'rotate-180' : ''
                }`}>
                {sortDirection && (
                  <RiArrowUpLine/>
                )}
              </span>
            )}
          </Group>
          {!props.width && <ColumnResizer className={resizerStyles} />}
        </div>
      ))}
    </AriaColumn>
  );
}

export function TableHeader<T>(props: TableHeaderProps<T>) {
  let {selectionBehavior, selectionMode, allowsDragging} = useTableOptions();

  return (
    <AriaTableHeader
      {...props}
      className={`${props.className || ''} bg-[var(--color-table-header)]`}>
      {/* Add extra columns for drag and drop and selection. */}
      {allowsDragging && <Column width={32} minWidth={32}/>}
      {selectionBehavior === 'toggle' && (
        <AriaColumn
          width={36}
          minWidth={36}
          className="box-border p-4 text-sm font-semibold cursor-default text-start">
          {selectionMode === 'multiple' && <Checkbox slot="selection" />}
        </AriaColumn>
      )}
      <Collection items={props.columns}>{props.children}</Collection>
    </AriaTableHeader>
  );
}

export function TableBody<T>(props: TableBodyProps<T>) {
  return <AriaTableBody {...props} className='divide-y-1 divide-[var(--color-border)]'/>;
}

export function TableFooter<T>(props: TableFooterProps<T>) {
  return <AriaTableFooter {...props} className="bg-neutral-200 dark:bg-neutral-700 font-bold" />;
}

const rowStyles = tv({
  base: 'h-12 group/row relative -outline-offset-2 hover:bg-[var(--color-form-select-bg)]'
});

export function Row<T>({id, columns, children, ...otherProps}: RowProps<T>) {
  let {selectionBehavior, allowsDragging} = useTableOptions();

  return (
    <AriaRow id={id} {...otherProps} className={rowStyles}>
      {allowsDragging && (
        <Cell className='text-center'>
          <Button slot="drag"><RiDraggable size={18}/></Button>
        </Cell>
      )}
      {selectionBehavior === 'toggle' && (
        <Cell>
          <Checkbox slot="selection" />
        </Cell>
      )}
      <Collection items={columns}>{children}</Collection>
    </AriaRow>
  );
}

const expandButton = tv({
  base: 'border-0 p-0 pr-1 bg-transparent shrink-0 align-middle cursor-default [-webkit-tap-highlight-color:transparent]',
  variants: {
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]'
    }
  }
});

export function Cell(props: CellProps) {
  return (
    <AriaCell
      {...props}
      className={`${props.className || ''} p-2`}
      style={({hasChildItems, isTreeColumn, level}) => ({
        paddingInlineStart: isTreeColumn
          ? 4 + (hasChildItems ? 0 : 20) + (level - 1) * 16
          : undefined
      })}>
      {composeRenderProps(
        props.children,
        (children, {hasChildItems, isTreeColumn, isDisabled}) => (
          <>
            {hasChildItems && isTreeColumn && (
              <Button slot="chevron" className={expandButton({isDisabled})}>
                <RiArrowLeftLine aria-hidden />
              </Button>
            )}
            {children}
          </>
        )
      )}
    </AriaCell>
  );
}

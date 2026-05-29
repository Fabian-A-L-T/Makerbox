import {
    Table as AriaTable,
    TableHeader,
    TableBody,
    Column,
    Row,
    Cell,
    type SortDescriptor,
} from 'react-aria-components';
import { useState } from 'react';
import { RiArrowUpSLine, RiArrowDownSLine, RiArrowUpDownLine } from '@remixicon/react';
import "@styles/table.css";

export interface ColumnDef<T> {
    key: string;
    label: string;
    allowsSorting?: boolean;
    render?: (item: T) => React.ReactNode;
}

interface TableProps<T extends { id: number | string }> {
    columns: ColumnDef<T>[];
    rows: T[];
    /** Optional label for accessibility */
    'aria-label'?: string;
}

function SortIcon({ direction }: { direction?: 'ascending' | 'descending' }) {
    if (direction === 'ascending') return <RiArrowUpSLine size={16} color='var(--color-text-muted)' />;
    if (direction === 'descending') return <RiArrowDownSLine size={16} color='var(--color-text-muted)' />;
    return <RiArrowUpDownLine size={16} color='var(--color-text-muted)' />;
}

export default function Table<T extends { id: number | string }>({
    columns,
    rows,
    'aria-label': ariaLabel = 'Data table',
}: TableProps<T>) {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: "id", direction: "ascending" });

    const sortedRows = [...rows].sort((a, b) => {
        if (!sortDescriptor.column) return 0;
        const col = sortDescriptor.column as keyof T;
        const va = a[col];
        const vb = b[col];
        let cmp = 0;
        if (typeof va === 'number' && typeof vb === 'number') {
            cmp = va - vb;
        } else {
            cmp = String(va ?? '').localeCompare(String(vb ?? ''));
        }
        return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });

    return (
        <div className="table-container">
            <AriaTable aria-label={ariaLabel} sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor} className="w-full">
                <TableHeader className="table-header">
                    {columns.map((col) => (
                        <Column
                            key={col.key}
                            id={col.key}
                            allowsSorting={col.allowsSorting}
                            isRowHeader={col.key === 'id'}
                            className={({ isFocusVisible, allowsSorting }) =>
                                [
                                    'column', col.key === 'actions' ? 'w-32' : '',
                                    allowsSorting ? 'column-hover' : '',
                                    isFocusVisible ? 'global-outline' : '',
                                ].join(' ')
                            }
                        >
                            {({ sortDirection }) => (
                                <span className={col.key === 'actions' ? '!justify-center' : ''}>
                                    {col.label}
                                    {col.allowsSorting && <SortIcon direction={sortDirection}/>}
                                </span>
                            )}
                        </Column>
                    ))}
                </TableHeader>

                <TableBody items={sortedRows}
                    renderEmptyState={() => (
                        <div className="table-no-results">Sin resultados</div>
                    )}
                >
                    {(item) => (
                        <Row key={item.id} className="table-row">
                            {columns.map((col) => (
                                <Cell key={col.key} className="table-cell">
                                    {col.render
                                        ? col.render(item)
                                        : String(item[col.key as keyof T] ?? '—')}
                                </Cell>
                            ))}
                        </Row>
                    )}
                </TableBody>
            </AriaTable>
        </div>
    );
}

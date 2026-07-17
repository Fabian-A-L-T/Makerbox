import {
    Table as AriaTable,
    TableHeader,
    TableBody,
    Column,
    Row,
    Cell,
} from 'react-aria-components';
import { RiArrowUpSLine, RiArrowDownSLine, RiArrowUpDownLine } from '@remixicon/react';
import "@styles/table.css";
import { elementsPerPage } from '@utils/Utils';

export interface ColumnDef<T> {
    key: string;
    label: string;
    allowsSorting?: boolean;
    render?: (item: T) => React.ReactNode;
}

interface TableProps<T extends { id: number | string }> {
    columns: ColumnDef<T>[];
    rows: T[];
    dataStatus: "success" | "error" | "pending";
    errorMsg?: string;
    rowHeader: string
    'aria-label'?: string;
}

function SortIcon({ direction }: { direction?: 'ascending' | 'descending' }) {
    if (direction === 'ascending') return <RiArrowUpSLine size={16} color='var(--color-text-muted)' />;
    if (direction === 'descending') return <RiArrowDownSLine size={16} color='var(--color-text-muted)' />;
    return <RiArrowUpDownLine size={16} color='var(--color-text-muted)' />;
}

export default function Table<T extends { id: number | string }>({ 
    columns, 
    rowHeader, 
    dataStatus, 
    errorMsg = 'Ha ocurrido un error al cargar los datos', 
    rows, 'aria-label': ariaLabel = 'Data table'
}: TableProps<T>) {

    return (
        <div className="table-container">
            <AriaTable aria-label={ariaLabel} className="w-full">
                <TableHeader className="bg-[var(--color-table-header)]">
                    {columns.map((col) => (
                        <Column
                            key={col.key}
                            id={col.key}
                            allowsSorting={col.allowsSorting}
                            isRowHeader={col.key === rowHeader}
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

                {dataStatus  !== 'pending' ?
                    <TableBody items={rows}
                        renderEmptyState={() => (
                            <div className="table-no-results">{dataStatus === 'error' ? errorMsg : 'Sin resultados'}</div>
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
                :   <TableBody>
                        {[...Array(elementsPerPage)].map((_, i) => (
                            <Row key={-1 * i} className="table-row">
                                {columns.map((col) => (
                                    <Cell key={col.key} className="table-cell px-4">
                                        { col.key !== 'actions' ? 
                                            <div className='w-1/2 h-5 rounded-full animate-pulse bg-[var(--color-table-header)]'/>
                                            : <div className='w-full h-8 rounded-[var(--border-radius-ui)] animate-pulse bg-[var(--color-table-header)]'/>
                                        }
                                    </Cell>
                                ))}
                            </Row>
                        ))}
                    </TableBody>
                }
            </AriaTable>
        </div>
    );
}

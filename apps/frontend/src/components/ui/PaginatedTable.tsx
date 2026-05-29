import {Button} from '@components/form/Button';
import Table from "@components/ui/Table";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";

interface PaginatedTableProps{
    label: string;
    columns: any;
    data: any;
    totalPages: number;
    setFilter: Function;
    setStatus: Function;
    filter: any;
    setPage: Function;
    setCursor: Function;
    page: number;
    cursor: number;
}


export default function PaginatedTable({ label, columns, data, totalPages, filter, setFilter, setStatus, setPage, setCursor, page, cursor}: PaginatedTableProps){

    function next(){
        setCursor(cursor + totalPages);
        setPage(0);
        setStatus('loading');
        setFilter({
            ...filter,
            offset: (filter.offset ?? 0) + (filter.limit ?? 50)
        });
    }

    function prev(){
        if(cursor == 0) return;
        setCursor(cursor - totalPages);
        setPage(0);
        setStatus('loading');
        setFilter({
            ...filter,
            offset: (filter.offset ?? 0) - (filter.limit ?? 50)
        });
    }
    
    return(
        <>
            <Table aria-label={label} columns={columns} rows={data[page] || []}/>
            <div className='w-full flex justify-center'>
                <div className='flex gap-2'>
                    {cursor >= totalPages && (
                        <Button variant='quiet' aria-label='Anterior' onPress={() => prev()}>
                            <RiArrowLeftSLine size={20}/>
                        </Button>
                    )}
                    {
                        Array.from({ length: data.length >= totalPages ? totalPages : data.length}).map((_, index) => (
                            <Button variant='quiet' key={index} aria-label={`Página ${cursor + index + 1}`} onPress={() => setPage(index)}>
                                {cursor + index + 1}
                            </Button>
                        ))
                    }
                    {
                        data.length >= totalPages && (
                            <Button variant='quiet' aria-label='Siguiente' onPress={() => next()}>
                                <RiArrowRightSLine size={20}/>
                            </Button>
                        )
                    }
                </div>
            </div>
        </>
    )
}
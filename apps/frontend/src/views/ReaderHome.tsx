import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@utils/Utils";
import type { ComponentStats, ToolStats } from "../interfaces/schemas";
import PageHeader from "@components/ui/PageHeader";
import { RiCpuLine, RiFileListLine, RiWrenchLine } from "@remixicon/react";
import InfoCard from "@components/ui/InfoCard";
import { useMemo } from "react";

export default function ReaderHome(){

    const compStats = useQuery({queryKey:['/stats/components'], queryFn: () => fetchData<ComponentStats>('/api/stats/components')});
    const toolStats = useQuery({queryKey:['/stats/tools'], queryFn: () => fetchData<ToolStats>('/api/stats/tools')});

    const compTotal = useMemo(() => {
        if(compStats.status === 'success' && compStats.data.content) {
            let total = 0;
            compStats.data.content.forEach((item) => total += parseInt(item.category_stock));
            return total;
        }
    },[compStats.status]);

    const toolTotal = useMemo(() => {
        if(toolStats.status === 'success') {
            let total = 0;
            toolStats.data.content.forEach((item) => total += parseInt(item.category_stock));
            return total;
        }
    },[toolStats.status]);

    return (
        <>
        <PageHeader title="Dashboard"/>
            <div className="p-5 flex flex-col gap-5">
                <h2 className="makerbox-box-title">Inventario</h2>
                <div className="makerbox-box w-full flex flex-col gap-5 !pb-1">
                    <div className="makerbox-box-title flex items-center gap-2 w-max">
                        <RiFileListLine size={24}/>
                        <span>Resumen</span>
                    </div>
                    <div className="flex justify-center gap-5 overflow-x-auto pb-4">
                        <InfoCard title={'Componentes'} value={compTotal} Icon={RiCpuLine} className="!border-[var(--color-text-muted)]" color="var(--color-text-muted)"/>
                        <InfoCard title={'Herramientas'} value={toolTotal} Icon={RiWrenchLine} className="!border-[var(--color-text-muted)]" color="var(--color-text-muted)"/>
                    </div>
                </div>
            </div>
        </>
    )
}
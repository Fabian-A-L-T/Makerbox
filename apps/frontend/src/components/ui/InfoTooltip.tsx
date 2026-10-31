import { Button } from "@components/form/Button";
import { RiInformationLine } from "@remixicon/react";
import { TooltipTrigger } from "react-aria-components";
import { Tooltip } from "./Tooltip";

export default function InfoTooltip({size=20, className, children}:{children: React.ReactNode, className?: string, size?: number}){
    return (
        <TooltipTrigger delay={100} closeDelay={100}>
            <Button aria-label="Información" variant="custom" className={'!border-none !p-0 !h-fit'}>
                <RiInformationLine size={size}/>
            </Button>
            <Tooltip className={className}>
                {children}
            </Tooltip>
        </TooltipTrigger>
    )
}
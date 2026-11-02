import { Button } from "@components/form/Button";
import { RiInformationLine, type RemixiconComponentType } from "@remixicon/react";
import { TooltipTrigger } from "react-aria-components";
import { Tooltip } from "./Tooltip";

export default function InfoCard({title, value, Icon, color, tooltipText, className} : {title: string, value?: number, Icon: RemixiconComponentType, color?: string, tooltipText?: string, className?: string }) {

    if(!color) color = 'var(--color-border)';
    return (
        <div className={`makerbox-box flex items-center gap-4 w-60 !border-[2px] transition-colors duration-300 ease-in-out ${className ?? ''}`}>
            <div className="w-12"><Icon color={color} size={48}/></div>
            <div className="flex flex-col gap-2 w-full">
                <div className="flex justify-between items-center gap-2">
                    <span className="text-sm text-[var(--color-text-muted)] font-medium">{title}</span>
                    { tooltipText && (
                        <TooltipTrigger delay={100} closeDelay={100}>
                            <Button aria-label="Información" variant="custom" className={'!border-none !p-0'}>
                                <RiInformationLine/>
                            </Button>
                            <Tooltip>
                                {tooltipText}
                            </Tooltip>
                        </TooltipTrigger>
                    )}
                </div>
                <span className="text-3xl">{typeof(value) === 'number' ? value.toLocaleString() : '- -'}</span>
            </div>
        </div>
    )
}
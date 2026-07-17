import { RiArrowRightLine } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface CardContainerProps {
    children: ReactNode, 
    title: string, 
    subtitle:string, 
    link?: {
        href: string, 
        text: string
    }
}

export default function CardContainer({children, title, subtitle, link}: CardContainerProps){
    return (
        <div className="my-8 border-2 border-[var(--color-border)] rounded-[var(--border-radius-ui)]">
            <div className="py-4 px-6 flex items-center justify-between bg-[var(--color-border)] rounded-t-[var(--border-radius-ui)]">
                <div className="">
                    <h1 className="text-2xl">{title}</h1>
                    <span className="text-sm">{subtitle}</span>
                </div>

                {link && (
                    <div className="flex flex-col items-end">
                    <Link to={link.href}>{link.text}</Link>
                    <RiArrowRightLine />
                    </div>
                )}
            </div>
            <div className="grid grid-cols-4 p-8">
                {children}
            </div>
        </div>
    );
}
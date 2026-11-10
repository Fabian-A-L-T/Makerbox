import { Breadcrumb, Breadcrumbs } from "@components/ui/Breadcrumbs";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@components/ui/Tabs";
import { RiCircleFill } from "@remixicon/react";
import { AsyncImg } from "@utils/Utils";
import { useEffect, useState } from "react";
import { makerboxApi } from "../../api/makerbox.api";

interface InfoLayoutProps {
    title: string,
    subtitle?: string,
    stock?: number,
    locationData?: React.ReactNode,
    status: {color: string, name: string},
    buttonUrl?: string,
    buttonText?: React.ReactNode,
    imgUrl?: string,
    publishedDate?: string,
    breadcrumbData: {href?: string, name: string}[],
    infoData: {title: string, value: string, additionalInfo?: React.ReactNode}[]
    tabData?: {id: string, name: string, content: React.ReactNode}[]
    children?: React.ReactNode
}

export default function InfoLayout({title, subtitle, stock, locationData, status, buttonUrl, buttonText, imgUrl, publishedDate, breadcrumbData, infoData, tabData, children}:InfoLayoutProps) {

    const [fileURL, setFileURL] = useState<string | null>(null);

    useEffect(() => {
        if(buttonUrl){
            if(buttonUrl.startsWith('/')){
                makerboxApi.get(buttonUrl, { responseType: 'blob'})
                .then((response) => {
                    setFileURL(URL.createObjectURL(response.data))
                })
            }
            else {
                setFileURL(buttonUrl)
            }
        }
    }, [buttonUrl]);

    return (
        <>
        <div className="m-5 flex gap-5 lg:flex-row md:flex-col">
            <div className="flex-none xl:w-2/5 lg:w-1/2">
                <AsyncImg className="aspect-square w-full object-cover rounded-[var(--border-radius-ui)]" {...imgUrl ? {src:'/' + imgUrl} : {}} alt={title}/>
            </div>
            <div className="flex-auto flex flex-col justify-between">
                <div className='flex flex-col gap-5 p-5'>
                    <div className="flex-none flex justify-between">
                        <Breadcrumbs className={'!m-0'}>
                            {breadcrumbData?.map((breadcrumb) => <Breadcrumb key={breadcrumb.name} {...breadcrumb.href && ({href: breadcrumb.href})}>{breadcrumb.name}</Breadcrumb>)}
                        </Breadcrumbs>
                        {publishedDate && <span className="text-sm text-[var(--color-text-muted)]">Publicado el: {publishedDate}</span>}
                    </div>
                    <div className="flex-auto flex flex-col gap-4">
                        <div className='flex flex-col gap-1 py-2'>
                            <h1 className="text-3xl font-bold ">{title}</h1>
                            {subtitle && <span className="text-sm text-[var(--color-text-muted)]">{subtitle}</span>}
                        </div>
                        <div className='flex-auto flex flex-col max-h-[235px] border-2 border-[var(--color-border)] rounded-[var(--border-radius-ui)] overflow-hidden'>
                            <div className='w-full px-3 py-2 flex justify-between align-center items-center bg-[var(--color-border)]'>
                                <div className='flex gap-2 items-center'>
                                    <RiCircleFill size={16} color={status.color}/> 
                                    <span className='text-sm'>{status.name}</span>
                                </div>
                                {stock && <span className='text-sm'>{'Stock: ' + stock.toLocaleString()}</span>}
                            </div>
                            {locationData}
                        </div>
                    </div>
                    <div className='flex-none flex flex-col divide-y-2 divide-[var(--color-border)]'>
                        {infoData.map((info) => {
                            if(info.additionalInfo) return (
                                <div key={info.title} className="flex items-center gap-1 text-[var(--color-text-muted)] py-2">
                                    <p>{info.title}: {info.value}</p>
                                    {info.additionalInfo}
                                </div>
                                )
                            else return (<p key={info.title} className="text-[var(--color-text-muted)] py-2">{info.title}: {info.value}</p>)
                        })}
                    </div>
                </div>
                {buttonUrl && 
                    <a href={fileURL || '#'} 
                        target='_blank' 
                        className='h-[36px] px-3 py-2 rounded-[var(--border-radius-ui)] cursor-pointer flex gap-1 items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/60 text-white'
                    >
                        {buttonText}
                    </a>
                }
            </div>
        </div>
        {children}
        {tabData && <Tabs className={"m-5"}>
            <TabList>
                {tabData.map((tab) => <Tab key={tab.id} id={tab.id}>{tab.name}</Tab>)}
            </TabList>
            <TabPanels>
                {tabData.map((tab) => <TabPanel key={tab.id} id={tab.id} className="flex m-5">{tab.content}</TabPanel>)}
            </TabPanels>
        </Tabs>}
        </>
    );
}
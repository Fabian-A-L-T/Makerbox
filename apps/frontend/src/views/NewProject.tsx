import { Button } from "@components/form/Button";
import { DatePicker } from "@components/form/DatePicker";
import { Select, SelectItem } from "@components/form/Select";
import TextField from "@components/form/TextField";
import { DropZone, Text, type DropEvent } from "@components/ReactAria/DropZone";
import ComponentCard from "@components/ui/ComponentCard";
import { StepContent, Stepper, type Step } from "@components/ui/Stepper";
import { CalendarDate, getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { RiAddLine, RiDeleteBinLine, RiImageLine, RiSearchLine, RiSortAlphabetAsc, RiSortAlphabetDesc, RiSortNumberAsc, RiSortNumberDesc } from "@remixicon/react";
import { AsyncImg, fetchData, handleUpload, paginationLimit, validateImgSize } from "@utils/Utils";
import { useRef, useState } from "react";
import type { Category, Component, Manufacturer } from "../interfaces/schemas";
import { Collection, DropIndicator, GridListLoadMoreItem, useAsyncList, useDragAndDrop, useListData } from "react-aria-components";
import { GridList, GridListItem } from "@components/ui/GridList";
import { ProgressCircle } from "@components/ReactAria/ProgressCircle";
import { makerboxApi } from "../api/makerbox.api";
import { Checkbox } from "@components/form/Checkbox";
import { Modal } from "@components/ReactAria/Modal";
import { Dialog } from "@components/ReactAria/Dialog";
import LoadingCircle from "@components/LoadingCircle";
import { Form } from "@components/form/Form";
import CRUDTableActions from "@components/CRUDTableActions";
import { Cell, Column, Row, TableBody, TableHeader, TableV2 } from "@components/ui/TableV2";
import ModalHeader from "@components/ui/ModalHeader";
import { Link } from "@tanstack/react-router";

interface projectData {
    name: string;
    description?: string | undefined;
    start_date: Date;
    end_date_real?: Date | undefined;
    repository_url?: string | undefined;
    image_url?: string | undefined;
}

interface MilestoneData {
    title: string,
    description?: string
}

export interface ListComponentData {
    id: number,
    name: string,
    cost: number,
    selectedStock: number
}

const dateToDateValue = (date: Date) => {
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return parseDate(`${year}-${month}-${day}`);
};

export default function NewProject(){
    const steps: Step[] = [
        { title: 'Paso 1', description: 'Datos básicos' },
        { title: 'Paso 2', description: 'Hitos'  },
        { title: 'Paso 3', description: 'Componentes'  },
        { title: 'Paso 4', description: 'Sumario' }
    ];
    const [endDateFlag, setEndDateFlag] = useState(false);

    const [imgContent, setImgContent] = useState<string | undefined>();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);

    const [step1Data, setStep1Data] = useState<projectData>({
        name: '',
        start_date: new Date()
    });

    let milestonesList = useListData<MilestoneData>({
        initialItems: [],
        getKey: item => item.title
    });
    const [step2DataActive, setStep2DataActive] = useState<MilestoneData>();
    const [step2DataMode, setStep2DataMode] = useState<'post' | 'put' | 'delete'>('post');
    let {dragAndDropHooks} = useDragAndDrop({
        getItems: (_, items: MilestoneData[]) => items.map(item => ({'text/plain': item.title})),
        onReorder(e) {
            if (e.target.dropPosition === 'before') {
                milestonesList.moveBefore(e.target.key, e.keys);
            } else if (e.target.dropPosition === 'after') {
                milestonesList.moveAfter(e.target.key, e.keys);
            }
        },
        renderDropIndicator(target) {
        return <DropIndicator target={target} className='outline-1 outline-[var(--color-text)] translate-z-1000'/>;
        }
    });
    const [startDate, setStartDate] = useState<CalendarDate>(dateToDateValue(step1Data.start_date));

    const [compList, setCompList] = useState<Record<number,ListComponentData>>({});
    const [budget, setBudget] = useState(0);

    async function imageDropHandler(event: DropEvent){
        let item = event.items.find(item => {
            return item.kind === 'file' && item.type.startsWith('image/')
        });

        if (item?.kind === 'file') {
            try {
                let file = await item.getFile();
                await validateImgSize(file);
                setErrorMessage(null);
                let url = URL.createObjectURL(file);
                setImgContent(url);
                setImage(file);
            }
            catch(err: any){
                setErrorMessage(err);
            }
        }
        else{
            setErrorMessage('Formato invalido');
        }
    }

    const [filters, setFilters] = useState<Record<string,string>>({
        search: '',
        orderBy:'name',
        category: '0',
        manufacturer: '0',
        desc: 'false'
    });
    const filtersRef = useRef(filters);
    
    const components = useAsyncList<Component>({
        async load({cursor}){
            const cleanFilters = Object.entries(filtersRef.current).filter(([_, value]) => value !== '' && value !== '0')
            const params = new URLSearchParams(cleanFilters).toString();
            const data = await fetchData<Component>(cursor || `/api/components?limit=${paginationLimit}&offset=0&${params}`);
            return {
                items: data.content,
                cursor: data.links?.next
            }
        },
    });

    const categories = useAsyncList<Category>({
        async load({cursor}){
            const data = await fetchData<Category>(cursor || `/api/component-categories?limit=${paginationLimit}&offset=0`);
            return {
                items: data.content,
                cursor: data.links?.next
            }
        },
    });

    const manufacturers = useAsyncList<Manufacturer>({
        async load({cursor}){
            const data = await fetchData<Manufacturer>(cursor || `/api/manufacturers?limit=${paginationLimit}&offset=0`);
            return {
                items: data.content,
                cursor: data.links?.next
            }
        },
    });

    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [openMilestoneModal, setOpenMilestoneModal] = useState(false);

    const [step3Status, setStep3Status] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
    const [step3Res, setStep3Res] = useState();
    function applyFilters({key, value}:{key: 'search' | 'orderBy' | 'category' | 'manufacturer' | 'desc', value: string}){
        const updated = { ...filtersRef.current, [key]: value };
        filtersRef.current = updated; // sync, no stale read
        setFilters(updated);          // triggers re-render of inputs
        components.reload(); 
    }

    return (
        <Stepper orientation="vertical" steps={steps}>
            <StepContent step={0} action={(formData) => {

                const name = formData.get('name')?.toString();
                const startDate = formData.get('start_date')?.toString();
                const endDate = formData.get('end_date_real')?.toString();
                const repository_url = formData.get('repository_url')?.toString();
                const description =  formData.get('description')?.toString();
                const image_url = formData.get('image_url')?.toString();

                if(name && startDate) {
                    setStep1Data({
                        name,
                        start_date: new Date(startDate),
                        end_date_real: endDate ? new Date(endDate) : undefined,
                        repository_url,
                        description,
                        image_url
                    })
                }
                else {
                    throw new Error('Missing data')
                }
            }}>
                <div className="flex gap-8">
                    <div className='w-2/5 flex flex-col gap-1 aspect-square col-span-2'>
                        <span className="text-base font-medium" >Imagen</span>
                        <DropZone
                            className='h-full'
                            getDropOperation={types => (
                                ['image/jpeg', 'image/png', 'image.gif', 'image/webp'].some(t => types.has(t))
                                ? 'copy'
                                : 'cancel'
                            )}
                            onDrop={imageDropHandler}
                        >
                            <Text slot="label" className="text-sm text-center text-[var(--color-text-muted)]">
                                {imgContent
                                    ? <AsyncImg className="w-full h-full !bg-transparent" src={imgContent} alt=""/>
                                    :(
                                        <>
                                            <RiImageLine className="mx-auto" size={64} color="var(--color-text-muted)"/>
                                            <span>Arrastra la imagen aquí</span>
                                        </>
                                    )}
                            </Text>
                        </DropZone>
                        {errorMessage && <span className="text-[var(--color-danger)] text-xs">{errorMessage}</span>}
                    </div>
                    <div className="w-3/5 flex flex-col gap-8">
                        <TextField label="Nombre del proyecto"
                            name="name"
                            defaultValue={step1Data.name}
                            minLength={3}
                            maxLength={64}
                            autoFocus
                            isRequired />
                        <Checkbox isSelected={endDateFlag} onChange={setEndDateFlag}>
                            ¿El proyecto ya ha finalizado?
                        </Checkbox>
                        <DatePicker label="Fecha de inicio del proyecto"
                            name="start_date"
                            defaultValue={dateToDateValue(step1Data.start_date)}
                            maxValue={today(getLocalTimeZone())}
                            onChange={(value) => {if(value) setStartDate(value)}}
                            isRequired />
                        {endDateFlag && <DatePicker label="Fecha de término del proyecto"
                                name="end_date_real"
                                defaultValue={step1Data.end_date_real ? dateToDateValue(step1Data.end_date_real) : undefined}
                                minValue={startDate}
                                maxValue={today(getLocalTimeZone())}
                                isRequired/>}
                        <TextField label="URL del repositorio"
                            name="repository_url"
                            type="url"
                            minLength={3}
                            maxLength={200}
                            defaultValue={step1Data.repository_url} />
                        <TextField label="Descripción"
                            name="description"
                            type="textarea"
                            maxLength={1000}
                            defaultValue={step1Data.description} />
                    </div>
                </div>
            </StepContent>
            <StepContent step={1}>
                <div className="flex justify-end">
                    <Button
                        className='w-max h-max p-2 flex items-center gap-2 bg-[var(--color-primary)] rounded-[var(--border-radius-ui)]'
                        onPress={() => {
                            if(milestonesList.items.length < 5){
                                setOpenMilestoneModal(true);
                                setStep2DataMode('post');
                            }
                        }}
                        isDisabled={milestonesList.items.length >= 5}
                    >
                        <RiAddLine/>
                        <span className='mr-1'>Nuevo hito</span>
                    </Button>
                </div>
                <TableV2
                    dragAndDropHooks={dragAndDropHooks}
                    aria-label="Tabla de hitos"
                >
                    <TableHeader>
                        <Column id="title" isRowHeader>Título</Column>
                        <Column id="description">Descripción</Column>
                        <Column id="action" width={100} className={'justify-center'}>Acciones</Column>
                    </TableHeader>
                    <TableBody items={milestonesList.items} renderEmptyState={() => (
                            <div className="p-10 text-[var(--color-text-muted)] italic text-center">{'Sin registros'}</div>
                        )}>
                        {function renderItem(item) {
                            return (
                                <Row id={item.title}>
                                    <Cell>{item.title}</Cell>
                                    <Cell>{item.description}</Cell>
                                    <Cell>
                                        <CRUDTableActions 
                                            name={item.title} 
                                            editAction={() => {
                                                setStep2DataActive(item);
                                                setStep2DataMode('put');
                                                setOpenMilestoneModal(true);
                                            }}
                                            deleteAction={() => {
                                                setStep2DataActive(item);
                                                setStep2DataMode('delete');
                                                setOpenMilestoneModal(true);
                                            }}
                                        />
                                    </Cell>
                                </Row>
                            );
                        }}
                    </TableBody>
                </TableV2>
            </StepContent>
            <StepContent step={2}>
                <div className="flex gap-4 h-full">
                    <div className="flex-auto flex flex-col gap-4">
                        <div className="makerbox-box flex flex-col gap-5">
                            <div className="pb-4 flex items-center gap-4 border-b-2 border-[var(--color-border)]">
                                <TextField label="Buscar"
                                    onChange={(value) => applyFilters({key: 'search', value})}
                                    placeholder="Ej: LED Rojo" 
                                    className='w-full border-r-2 border-[var(--color-border)] pr-4' 
                                    icon={<RiSearchLine className="m-2" color="var(--color-text-muted)" size={18}/>}
                                />
                                <div className="flex gap-2">
                                    <Select label="Ordenar por"
                                        value={filters.orderBy}
                                        placeholder="Seleccione"
                                        onChange={(value) => applyFilters({key: 'orderBy', value: String(value)})}
                                        className='!w-[var(--select-w-xs)]'
                                    >
                                        <SelectItem id='name'>Nombre</SelectItem>
                                        <SelectItem id='created_at'>Fecha</SelectItem>
                                        <SelectItem id='stock'>Stock</SelectItem>
                                    </Select>
                                    <Button
                                        onClick={() => applyFilters({key: 'desc', value: filters.desc === 'true' ? 'false' : 'true' as string})}
                                        className="mt-auto p-2 aspect-square bg-[var(--color-form-select-bg)] hover:bg-[var(--color-form-select-bg)]/60 border-2 border-[var(--color-border)] rounded-[var(--border-radius-ui)] outline-none"
                                    >
                                        {filters.orderBy == 'stock'
                                            ? (filters.desc === 'true' ? <RiSortNumberDesc size={20}/> : <RiSortNumberAsc size={20}/>) 
                                            : (filters.desc === 'true' ? <RiSortAlphabetDesc size={20} /> : <RiSortAlphabetAsc size={20}/>)}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-between gap-4 flex-wrap">
                                <div className="flex gap-2">
                                    <Select label="Categoría"
                                        value={filters.category}
                                        placeholder="Seleccione"
                                        onChange={(value) => applyFilters({key: 'category', value: String(value)})}
                                        className='!w-[var(--select-w-sm)]'
                                        loadingState={categories.loadingState}
                                        onLoadMore={categories.loadMore}
                                    >
                                        <SelectItem key='' id={'0'} >Todos</SelectItem>
                                        {categories.items.map( (item) => <SelectItem key={item.id} id={item.id.toString()} >{item.name}</SelectItem>)}
                                    </Select>
                                    <Select label="Fabricante"
                                        value={filters.manufacturer}
                                        placeholder="Seleccione"
                                        onChange={(value) => applyFilters({key: 'manufacturer', value: String(value)})}
                                        className='!w-[var(--select-w-sm)]'
                                        loadingState={manufacturers.loadingState}
                                        onLoadMore={manufacturers.loadMore}
                                    >
                                        <SelectItem key='' id={'0'} >Todos</SelectItem>
                                        {manufacturers.items.map( (item) => <SelectItem key={item.id} id={item.id.toString()} >{item.name}</SelectItem>)}
                                    </Select>
                                </div>
                                <Button 
                                    variant="primary"
                                    className='mt-auto'
                                    onPress={() => {
                                        applyFilters({key: 'category', value: '0'});
                                        applyFilters({key: 'manufacturer', value: '0'});
                                    }}
                                >
                                    Limpiar filtros
                                </Button>
                            </div>
                        </div>
                        <GridList
                            aria-label="Lista de componentes"
                            renderEmptyState={() => (
                                <ProgressCircle isIndeterminate aria-label="Loading..." />
                            )}>
                            <Collection items={components.items}>
                                {(component) => (
                                    <GridListItem textValue={component.name}>
                                        <ComponentCard 
                                            id={component.id} 
                                            name={component.name} 
                                            manufacturer={component.manufacturer} 
                                            cost={Number(component.unit_cost)} 
                                            stock={component.stock} 
                                            minStock={component.stock_min} 
                                            image={component.image_url}
                                            setList={setCompList} 
                                            setBudget={setBudget}/>
                                    </GridListItem>
                                )}
                            </Collection>
                            <GridListLoadMoreItem
                                onLoadMore={components.loadMore}
                                isLoading={components.loadingState === 'loadingMore'} />
                        </GridList>
                    </div>
                    <div className="w-2/7 min-w-[300px] flex-none flex flex-col justify-between gap-4">
                        <div className="makerbox-box flex flex-auto flex-col gap-4 divide-y-2 divide-[var(--color-border)]">
                            <span className="text-lg pb-2">Lista de componentes</span>
                            <div className="flex-initial flex flex-col gap-4 overflow-y-auto h-full">
                                {Object.values(compList).map((comp) => {
                                    return (
                                    <div className="makerbox-box flex !p-0 overflow-hidden" key={comp.id}>
                                        <div className="py-2 px-3 w-full">
                                            <span className="text-lg">{comp.name}</span>
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm text-[var(--color-text-muted)]">{'$' + comp.cost + ' x ' + comp.selectedStock}</span>
                                                <span className="text-lg">{'$' + (comp.cost * comp.selectedStock).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <Button className='!bg-[var(--color-danger)] h-auto !rounded-none ' 
                                            onPress={() => {
                                                const {[comp.id]: _, ...rest} = compList;
                                                setCompList(rest);
                                                setBudget((prev) => prev - (comp.cost * comp.selectedStock));
                                            }}
                                        >
                                            <RiDeleteBinLine/>
                                        </Button>
                                    </div>
                                )})}
                            </div>
                        </div>
                        <div className="makerbox-box h-max flex flex-col gap-4 divide-y-2 divide-[var(--color-border)]">
                            <span className="text-lg pb-2">Presupuesto total</span>
                            <span className="text-base font-semibold">{'$' + budget.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </StepContent>
            <StepContent step={3} disableNextBtn={step3Status !== 'idle'} action={async () => {
                setOpenUploadModal(true);
                setStep3Status('loading');
                let image_url;
                if(image){
                    image_url = await handleUpload(image, 'image');
                    setImage(null);
                }
                
                try {
                    const res = await makerboxApi.post('/api/projects', {...step1Data, milestoneList: milestonesList.items, budget: budget.toString(), compList, image_url}, {withCredentials: true});
                    setStep3Res(res.data.message);
                    setStep3Status('success');
                } 
                catch (error: any) {
                    setStep3Res(error.message);
                    setStep3Status('error');
                }
                
            }}>
                <div className="flex gap-8 mb-4">
                    <div className="w-2/7 flex flex-col gap-1">
                        <div className="flex justify-center items-center aspect-square rounded-[var(--border-radius-ui)] border-2 border-[var(--color-border)] overflow-hidden">
                            <AsyncImg className="w-full h-full" src={imgContent} alt='Imagen del nuevo proyecto' notfoundsubtitle="Sin imagen"/>
                        </div>
                    </div>
                    <div className="flex-auto flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-base border-b-1 border-[var(--color-border)]">Nombre</span>
                            <span className="text-[var(--color-text-muted)]">{step1Data.name}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-base border-b-1 border-[var(--color-border)]">Fecha de inicio {step1Data.end_date_real ? '- termino' : ''}</span>
                            <span className="text-[var(--color-text-muted)]">{step1Data.start_date.toLocaleString().split(',')[0]} {step1Data.end_date_real ? '- ' + step1Data.end_date_real.toLocaleString().split(',')[0] : ''}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-base border-b-1 border-[var(--color-border)]">Presupuesto</span>
                            <span className="text-[var(--color-text-muted)]">${budget.toLocaleString()}</span>
                        </div>
                        {step1Data.repository_url && <div className="flex flex-col gap-2">
                            <span className="text-base border-b-1 border-[var(--color-border)]">URL del repositorio</span>
                            <span className="text-[var(--color-text-muted)]">{step1Data.repository_url}</span>
                        </div>}
                        {step1Data.description && <div className="flex flex-col gap-2">
                            <span className="text-base border-b-1 border-[var(--color-border)]">Descripción</span>
                            <span className="text-[var(--color-text-muted)]">{step1Data.description}</span>
                        </div>}
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <span className="text-lg">Lista de componentes</span>
                    <TableV2 aria-label="Lista de componentes" className='w-full'>
                        <TableHeader>
                            <Column id="name" isRowHeader>Nombre</Column>
                            <Column id="planned_amount">Cantidad seleccionada</Column>
                            <Column id="unit_cost">Costo</Column>
                        </TableHeader>
                        <TableBody renderEmptyState={() => (
                            <div className="p-10 text-[var(--color-text-muted)] italic text-center">{'Sin registros'}</div>
                        )}>
                            {Object.entries(compList).map(([_, comp]) => (
                                <Row id={comp.id}>
                                    <Cell>{comp.name}</Cell>
                                    <Cell>{comp.selectedStock}</Cell>
                                    <Cell>${comp.cost.toLocaleString()}</Cell>
                                </Row>
                            ))}              
                        </TableBody>
                    </TableV2>
                    <div>
                    
                    </div>
                </div>
            </StepContent>
            <Modal isOpen={openUploadModal} onOpenChange={setOpenUploadModal} className={'w-full max-w-xl'}>
                <Dialog>
                    <ModalHeader title={step3Status === 'loading' 
                        ? 'Creando proyecto' 
                        : step3Status === 'error' ? 'Ha ocurrido un error' : 'Proyecto creado'}/>
                    <div className="flex flex-col max-h-[80dvh]">
                        <div className="flex flex-col gap-5 flex-initial mb-5 px-5 overflow-y-auto">
                            {step3Status === 'loading' && <LoadingCircle message="Verificando disponibilidad de componentes" orientation="horizontal"/>}
                            {step3Status === 'error' && <span>Ha ocurrido un error</span>}
                            {step3Status === 'success' && <span>{step3Res}</span>}
                        </div>
                        {(step3Status === 'success' || step3Status === 'error') && <div className="flex justify-center gap-4">
                            <Link
                                className='w-max h-max p-2 flex items-center gap-2 bg-[var(--color-primary)] rounded-[var(--border-radius-ui)] text-white'
                                to='/manager/projects'
                            >
                                <span className='mr-1'>Volver a mis proyectos</span>
                            </Link>
                        </div>}
                    </div>
                </Dialog>
            </Modal>
            <Modal isOpen={openMilestoneModal} onOpenChange={setOpenMilestoneModal} className={'w-full max-w-xl'}>
                <Dialog>
                    <ModalHeader title={(step2DataMode === 'post' ? 'Crear' : step2DataMode === 'put' ? 'Actualizar' : 'Eliminar') + ' hito'}/>
                    <Form className="flex flex-col max-h-[80dvh]" action={(formData) => {
                        const title = formData.get('title')?.toString();
                        const description = formData.get('description')?.toString();

                        if((step2DataMode === 'post') && title) milestonesList.append({title, description});
                        else if(step2DataMode === 'put' && title && step2DataActive) milestonesList.update(step2DataActive.title, {title, description});
                        else if(step2DataMode === 'delete' && step2DataActive) milestonesList.remove(step2DataActive.title);
                        setStep2DataActive(undefined);
                        setOpenMilestoneModal(false);
                    }}>
                        {step2DataMode !== 'delete' && 
                            <div className="flex flex-col gap-5 flex-initial mb-5 px-5 overflow-y-auto">
                                <TextField label="Título"
                                    name="title"
                                    minLength={3}
                                    maxLength={64}
                                    {...step2DataActive && {defaultValue:step2DataActive?.title}}
                                    isRequired 
                                    validate={(value) => {
                                        if(step2DataMode === 'post' || (step2DataMode === 'put' && milestonesList.getItem(value)?.title !== step2DataActive?.title)){
                                            if(milestonesList.getItem(value)){
                                                return 'Este híto ya existe';
                                            }
                                        }
                                        
                                    }}/>
                                <TextField label="Descripción"
                                    name="description"
                                    type="textarea"
                                    maxLength={5000}
                                    {...step2DataActive && {defaultValue:step2DataActive?.description}} />
                            </div>
                        }
                        {step2DataMode === 'delete' && <span>¿Está seguro(a) de que desea eliminar este hito?</span>}
                        <div className="flex justify-center gap-4">
                            <Button slot="close" variant="secondary">Cancelar</Button>
                            <Button type="submit">{step2DataMode === 'post' ? 'Crear' : step2DataMode === 'put' ? 'Actualizar' : 'Eliminar'}</Button>
                        </div>
                    </Form>
                </Dialog>
            </Modal>
        </Stepper>
    );
}
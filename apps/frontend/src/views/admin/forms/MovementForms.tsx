import { NumberField } from "@components/form/NumberField";
import { Select, SelectItem } from "@components/form/Select";
import TextField from "@components/form/TextField";
import { Text } from "@components/ReactAria/Content";
import type { Component, ComponentLocation, Location, Project, ProjectComponent } from "../../../interfaces/schemas";
import { useState } from "react";
import {useAsyncList} from 'react-aria-components/useAsyncList';
import { makerboxApi } from "../../../api/makerbox.api";
import { fetchData, paginationLimit } from "@utils/Utils";

export default function MovementForm() {
    const [stockType, setStockType] = useState<string | null>(null);
    const [resetableFormValues, setResetableFormValues] = useState({
        componentId: null as string | null,
        originLocationId: null as number | null,
        maxAmount: null as number | null,
        projectId: null as number | null,
        destinationLocationId: null as number | null,
        amount: null as number | null,
    });

    const resetFields = () => {
        setResetableFormValues({
            componentId: null,
            originLocationId: null,
            maxAmount: null,
            projectId: null,
            destinationLocationId: null,
            amount: null
        });
    };

    const components = useAsyncList<Component>({
        async load({cursor}){
            const { data } = await fetchData<Component>(cursor || `/components?limit=${paginationLimit}&offset=0`);
            return {
                items: data.content,
                cursor: data.links?.next
            }
        },
    });

    const locations = useAsyncList<Location>({
        async load({cursor}){
            const { data } = await fetchData<Location>(cursor || `/locations?limit=${paginationLimit}&offset=0`);
            return {
                items: data.content,
                cursor: data.links?.next
            }
        },
    });

    const projects = useAsyncList<Project>({
        async load({cursor}){
            const { data } = await fetchData<Project>(cursor || `/projects?limit=${paginationLimit}&offset=0`);
            return {
                items: data.content,
                cursor: data.links?.next
            }
        },
    });

    const componentLocations = useAsyncList<ComponentLocation>({
        async load({filterText}) {
            if(filterText){
                const response = await makerboxApi.get(`/components/${filterText}/locations`);
                return {items: response.data.content};
            }
            return {items: []}
        }
    });

    const projectComponents = useAsyncList<ProjectComponent>({
        async load({filterText}) {
            if(filterText){
                const response = await makerboxApi.get(`/projects/${filterText}/components`);
                return {items: response.data.content};
            }
            return {items: []}
        }
    });
    
    return (
        <>
        <Select label="Tipo de movimiento"
            name="stock_type"
            placeholder="Seleccione"
            description="Movimiento de stock a realizar"
            onChange={(value) => {
                setStockType(value as string); 
                resetFields();
            }}
            isRequired
        >
            <SelectItem id="entry">Ingresar</SelectItem>
            <SelectItem id="reserve">Reservar para proyecto</SelectItem>
            <SelectItem id="return">Devolver de proyecto</SelectItem>
            <SelectItem id="transfer">Transferir a otra ubicación</SelectItem>
            <SelectItem id="disposal">Desechar</SelectItem>
        </Select>
        { stockType && (
            <>
            { stockType === 'return' && (
                <Select label="Proyecto"
                    name="project_id"
                    placeholder="Seleccione"
                    items={projects.items}
                    value={resetableFormValues.projectId ? resetableFormValues.projectId.toString() : null}
                    onChange={(value) => {
                        projectComponents.setFilterText(value as string);
                        setResetableFormValues((prev) => ({...prev, projectId: Number(value), componentId: null, originLocationId: null, maxAmount: null, amount: null}))
                    }}
                    isRequired
                    isInvalid={!projects.items.length}
                    validate={(value) => {
                        if(!value) return 'Este campo es requerido';
                        return true;
                    }}
                    errorMessage={({isInvalid, validationErrors}) => {
                        if(isInvalid) return 'No hay proyectos disponibles';
                        else if(validationErrors && validationErrors.length > 0) return validationErrors.flat().join(', ');
                        return 'Ha ocurrido un error';
                    }}
                    loadingState={projects.loadingState}
                    onLoadMore={projects.loadMore}
                >
                    {item => <SelectItem id={item.id.toString()} onPress={() => setResetableFormValues((prev) => ({...prev, projectId: item.id}))}>{item.name}</SelectItem>}
                </Select>
            )}
            { stockType !== 'return' ? 
                <Select label="Componente"
                    name="component_id"
                    placeholder="Seleccione"
                    items={components.items}
                    value={resetableFormValues.componentId ?? null}
                    onChange={(value) => {
                        componentLocations.setFilterText(value as string);
                        setResetableFormValues((prev) => ({...prev, componentId: value as string, originLocationId: null, destinationLocationId: null, projectId: null, maxAmount: null, amount: null}));
                    }}
                    isRequired
                    isInvalid={!components.items.length}
                    validate={(value) => {
                        if(!value) return 'Este campo es requerido';
                        return true;
                    }}
                    errorMessage={({isInvalid, validationErrors}) => {
                        if(isInvalid) return 'No hay componentes disponibles';
                        else if(validationErrors && validationErrors.length > 0) return validationErrors.flat().join(', ');
                        return 'Ha ocurrido un error';
                    }}
                    loadingState={components.loadingState}
                    onLoadMore={components.loadMore}
                >
                    {item => <SelectItem id={item.id.toString()}>{item.name}</SelectItem>}
                </Select>
            : resetableFormValues.projectId &&  
                (<Select label="Componente"
                    name="component_id"
                    placeholder="Seleccione"
                    items={projectComponents.items}
                    onChange={(value) => {
                        componentLocations.setFilterText(value as string);
                        setResetableFormValues((prev) => ({...prev, componentId: value as string}));
                    }}
                    isRequired
                    isInvalid={!projectComponents.items.length}
                    validate={(value) => {
                        if(!value) return 'Este campo es requerido';
                        return true;
                    }}
                    errorMessage={({isInvalid}) => {
                        if(isInvalid) return 'No hay componentes disponibles';
                        return 'Ha ocurrido un error';
                    }}
                    loadingState={projectComponents.loadingState}
                >
                    {item => 
                        <SelectItem id={item.component_id.toString()} textValue={item.component_name} onPress={() => setResetableFormValues((prev) => ({...prev, maxAmount: item.planned_amount - item.used_amount}))}>
                            <Text slot="label">{item.component_name}</Text>
                            <Text className="text-xs text-[var(--color-text-muted)]" slot="description">Stock en desuso: {(item.planned_amount - item.used_amount).toString()}</Text>
                        </SelectItem>
                    }
                </Select>)
            }

            { stockType !== 'entry' ? (
                <>
                { resetableFormValues.componentId && componentLocations &&
                    <Select label={stockType === 'transfer' ? "Ubicación origen" : "Ubicación"}
                        name="origin_location_id"
                        placeholder='Seleccione'
                        items={componentLocations.items}
                        value={resetableFormValues.originLocationId ? resetableFormValues.originLocationId.toString() : null}
                        onChange={(value) => setResetableFormValues((prev) => ({...prev, originLocationId: Number(value), destinationLocationId: null, amount: null}))}
                        isRequired
                        isInvalid={!componentLocations.items.length && !componentLocations.isLoading}
                        validate={(value) => {
                            if(!value) return 'Este campo es requerido';
                            return true;
                        }}
                        errorMessage={({isInvalid, validationErrors}) => {
                            if(isInvalid) return 'El componente no se encuentra en ninguna ubicación';
                            else if(validationErrors && validationErrors.length > 0) return validationErrors.flat().join(', ');
                            return 'Ha ocurrido un error';
                        }}
                        loadingState={componentLocations.loadingState}
                    >
                        { item => 
                            <SelectItem id={item.location_id.toString()} textValue={item.location_name} onPress={() => setResetableFormValues((prev) => ({...prev, ...(stockType !== 'return' && {maxAmount: item.amount})}))}>
                                <Text slot="label">{item.location_name}</Text>
                                <Text className="text-xs text-[var(--color-text-muted)]" slot="description">Stock: {item.amount}</Text>
                            </SelectItem>
                        }
                    </Select>
                }
                </>
            ) : (
                <Select label="Ubicación"
                    name="origin_location_id"
                    placeholder="Seleccione"
                    items={locations.items}
                    value={resetableFormValues.originLocationId ? resetableFormValues.originLocationId.toString() : null}
                    onChange={(value) => setResetableFormValues((prev) => ({...prev, originLocationId: Number(value)}))}
                    isRequired
                    isInvalid={!locations.items.length}
                    validate={(value) => {
                        if(!value) return 'Este campo es requerido';
                        return true;
                    }}
                    errorMessage={({isInvalid, validationErrors}) => {
                        if(isInvalid) return 'No hay ubicaciones disponibles';
                        else if(validationErrors && validationErrors.length > 0) return validationErrors.flat().join(', ');
                        return 'Ha ocurrido un error';
                    }}
                    loadingState={locations.loadingState}
                    onLoadMore={locations.loadMore}
                >
                    {item => <SelectItem id={item.id.toString()}>{item.name}</SelectItem>}
                </Select>
            )}

            { stockType === 'transfer' && resetableFormValues.originLocationId && (
                <Select label="Ubicación destino"
                    name="destination_location_id"
                    isRequired
                    value={resetableFormValues.destinationLocationId ? resetableFormValues.destinationLocationId.toString() : null}
                    onChange={(value) => setResetableFormValues((prev) => ({...prev, destinationLocationId: Number(value)}))}
                    placeholder="Seleccione"
                    items={locations.items}
                    loadingState={locations.loadingState}
                    onLoadMore={locations.loadMore}
                >
                    {item => <SelectItem id={item.id.toString()}>{item.name}</SelectItem>}
                </Select>
            )}

            { stockType === 'reserve' && (
                <Select label="Proyecto"
                    name="project_id"
                    placeholder="Seleccione"
                    items={projects.items}
                    value={resetableFormValues.projectId ? resetableFormValues.projectId.toString() : null}
                    onChange={(value) => setResetableFormValues((prev) => ({...prev, projectId: Number(value)}))}
                    isRequired
                    isInvalid={!projects.items.length}
                    validate={(value) => {
                        if(!value) return 'Este campo es requerido';
                        return true;
                    }}
                    errorMessage={({isInvalid, validationErrors}) => {
                        if(isInvalid) return 'No hay proyectos disponibles';
                        else if(validationErrors && validationErrors.length > 0) return validationErrors.flat().join(', ');
                        return 'Ha ocurrido un error';
                    }}
                    loadingState={projects.loadingState}
                    onLoadMore={projects.loadMore}
                >
                    {item => <SelectItem id={item.id.toString()}>{item.name}</SelectItem>}
                </Select>
            )}

            {stockType !== 'entry'  ? (
                <>
                { resetableFormValues.maxAmount &&
                    <NumberField label="Cantidad"
                        name="amount"
                        placeholder="Ingrese la cantidad"
                        description={`Máximo ${resetableFormValues.maxAmount} unidades`}
                        minValue={1}
                        maxValue={resetableFormValues.maxAmount}
                        value={resetableFormValues.amount ? resetableFormValues.amount : 1}
                        onChange={(value) => setResetableFormValues((prev) => ({...prev, amount: Number(value)}))}
                        isRequired
                    />
                }
                </>
            ) : (
                <NumberField label="Cantidad"
                    name="amount"
                    placeholder="Ingrese la cantidad"
                    value={resetableFormValues.amount ? resetableFormValues.amount : 1}
                    onChange={(value) => setResetableFormValues((prev) => ({...prev, amount: Number(value)}))}
                    minValue={1}
                    maxValue={10000}
                    isRequired
                />
            )}
            </>
        )}
        <TextField
            label="Notas"
            name="notes"
            type="textarea"
            minLength={0}
            maxLength={500}
            placeholder="Notas adicionales sobre el movimiento"
        />
        </>
    )
}
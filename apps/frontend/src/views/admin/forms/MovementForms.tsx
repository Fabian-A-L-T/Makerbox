import { NumberField } from "@components/form/NumberField";
import { Select, SelectItem } from "@components/form/Select";
import TextField from "@components/form/TextField";
import { Text } from "@components/ReactAria/Content";
import type { Component, ComponentLocation, Location, Project, ProjectComponent } from "../../../interfaces/schemas";
import axios from "axios";
import { useState } from "react";
import {useAsyncList} from 'react-aria-components/useAsyncList';

export default function MovementForm({components, projects, locations}: {components: Component[], projects: Project[], locations: Location[]}) {
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

    let componentLocations = useAsyncList<ComponentLocation>({
        async load({filterText}) {
            if(filterText){
                const response = await axios.get(`/api/components/${filterText}/locations`);
                return {items: response.data};
            }
            return {items: []}
        }
    });

    let projectComponents = useAsyncList<ProjectComponent>({
        async load({filterText}) {
            if(filterText){
                const response = await axios.get(`/api/projects/${filterText}/components`);
                return {items: response.data};
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
            <Select label="Componente"
                name="component_id"
                placeholder="Seleccione"
                items={components}
                value={resetableFormValues.componentId ?? null}
                onChange={(value) => {
                    if(stockType === 'return') projectComponents.setFilterText(value as string);
                    componentLocations.setFilterText(value as string);
                    setResetableFormValues((prev) => ({...prev, componentId: value as string, originLocationId: null, destinationLocationId: null, projectId: null, maxAmount: null, amount: null}));
                }}
                isRequired
                isInvalid={!components.length}
                validate={(value) => {
                    if(!value) return 'Este campo es requerido';
                    return true;
                }}
                errorMessage={({isInvalid, validationErrors}) => {
                    if(isInvalid) return 'No hay componentes disponibles';
                    else if(validationErrors && validationErrors.length > 0) return validationErrors.flat().join(', ');
                    return 'Ha ocurrido un error';
                }}
            >
                {item => <SelectItem id={item.id.toString()}>{item.name}</SelectItem>}
            </Select>

            { stockType === 'return' && (
                <Select label="Proyecto"
                    name="project_id"
                    placeholder="Seleccione"
                    items={projectComponents.items}
                    value={resetableFormValues.projectId ? resetableFormValues.projectId.toString() : null}
                    onChange={(value) => setResetableFormValues((prev) => ({...prev, projectId: Number(value)}))}
                    isRequired
                    isInvalid={!projectComponents.items.length}
                    validate={(value) => {
                        if(!value) return 'Este campo es requerido';
                        return true;
                    }}
                    errorMessage={({isInvalid, validationErrors}) => {
                        if(isInvalid) return 'No hay proyectos disponibles';
                        else if(validationErrors && validationErrors.length > 0) return validationErrors.flat().join(', ');
                        return 'Ha ocurrido un error';
                    }}
                >
                    {item => <SelectItem id={item.project_id.toString()} onPress={() => setResetableFormValues((prev) => ({...prev, maxAmount: item.planned_quantity - item.used_quantity}))}>{item.project_name}</SelectItem>}
                </Select>
            )}

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
                        isDisabled={componentLocations.isLoading}
                        isLoading={componentLocations.isLoading}
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
                    >
                        { item => 
                            <SelectItem id={item.location_id.toString()} textValue={item.location_name} onPress={() => setResetableFormValues((prev) => ({...prev, maxAmount: item.amount}))}>
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
                    items={locations}
                    value={resetableFormValues.originLocationId ? resetableFormValues.originLocationId.toString() : null}
                    onChange={(value) => setResetableFormValues((prev) => ({...prev, originLocationId: Number(value)}))}
                    isRequired
                    isInvalid={!locations.length}
                    validate={(value) => {
                        if(!value) return 'Este campo es requerido';
                        return true;
                    }}
                    errorMessage={({isInvalid, validationErrors}) => {
                        if(isInvalid) return 'No hay ubicaciones disponibles';
                        else if(validationErrors && validationErrors.length > 0) return validationErrors.flat().join(', ');
                        return 'Ha ocurrido un error';
                    }}
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
                    items={locations}
                >
                    {item => <SelectItem id={item.id.toString()}>{item.name}</SelectItem>}
                </Select>
            )}

            { stockType === 'reserve' && (
                <Select label="Proyecto"
                    name="project_id"
                    placeholder="Seleccione"
                    items={projects}
                    value={resetableFormValues.projectId ? resetableFormValues.projectId.toString() : null}
                    onChange={(value) => setResetableFormValues((prev) => ({...prev, projectId: Number(value)}))}
                    isRequired
                    isInvalid={!projects.length}
                    validate={(value) => {
                        if(!value) return 'Este campo es requerido';
                        return true;
                    }}
                    errorMessage={({isInvalid, validationErrors}) => {
                        if(isInvalid) return 'No hay proyectos disponibles';
                        else if(validationErrors && validationErrors.length > 0) return validationErrors.flat().join(', ');
                        return 'Ha ocurrido un error';
                    }}
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
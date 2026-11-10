import { type Request, type Response } from "express";
import Project from "../models/Project.js";
import { ValidationError, HttpError } from "../utils/errors.js";
import { type ComponentListData, componentListSchema, type MilestoneListData, milestoneListSchema, milestoneSchema, paginationSchema, projectComponentSchema, projectFilterSchema, projectSchema, projectToolSchema } from "../utils/schemas.js";
import { number, picklist, safeParse } from "valibot";
import { generatePagination } from "../utils/utils.js";
import Component from "../models/Component.js";
import Movement from "../models/Movement.js";

export default class ProjectController {
    static async getAll(req: Request, res: Response) {
        try {
            const { search, limit, offset, orderBy, desc, state } = req.query;

            const validatedPagination = safeParse(paginationSchema, {limit, offset});
            if(!validatedPagination.success) throw new ValidationError();

            const validatedFilters = safeParse(projectFilterSchema, {search, orderBy, desc, userId: req.body.user.id, state});
            if(!validatedFilters.success) throw new ValidationError();

            const validatedUserID = safeParse(number(), req.body.user.id);
            if(!validatedUserID.success) throw new ValidationError();

            const projects = await Project.get({...validatedPagination.output, ...validatedFilters.output, responsible_id: validatedUserID.output});
            res.json(await generatePagination({
                content: projects,
                tableName: 'projects',
                hasSoftDelete: true,
                resourceRoute: 'projects',
                ...(validatedPagination.output),
                otherParams: validatedFilters.output
            }));
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async getByID(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user_id: number = req.body.user.id;

            const validatedUserId = safeParse(number(), user_id);
            if (!validatedUserId.success) throw new ValidationError();

            const validatedId = safeParse(number(), parseInt(id));
            if (!validatedId.success) throw new ValidationError();

            const project = await Project.getById(validatedId.output, validatedUserId.output);
            res.json({content: project});
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const compList: Record<string,ComponentListData>  = req.body.compList;
            const milestoneList: MilestoneListData[] = req.body.milestoneList;
            const userId: number = req.body.user.id;
            let outOfStockList: string[]  = [];
            let notFoundCount = 0;

            const validatedData = safeParse(projectSchema, {...req.body, responsible_id: userId.toString()});
            if (!validatedData.success) throw new ValidationError();

            const projectData = {...validatedData.output, state: 'planning'};
            const project = await Project.create(projectData);

            if(Object.entries(compList).length > 0){
                const iterationSuccess = await Promise.all(Object.entries(compList).map(async ([_,comp]) => {
                    try {
                        const validatedComp = safeParse(componentListSchema, comp);
                        if (!validatedComp.success) return false;

                        const compData = await Component.getById(validatedComp.output.id);

                        if(validatedComp.output.selectedStock <= compData[0].stock) {
                            let remainingSelectedStock = validatedComp.output.selectedStock;
                            const locations = await Component.getAllLocations(compData[0].id);
                            
                            locations.forEach((location) => {
                                if(remainingSelectedStock > 0){
                                    let retrievedStock = Math.min(location.amount, remainingSelectedStock);
                                    Movement.create({user_id: userId, component_id: comp.id, project_id: project[0].id, stock_type: 'reserve', amount: retrievedStock, origin_location_id: location.location_id });
                                    remainingSelectedStock -= retrievedStock;
                                }
                            });
                        }
                        else outOfStockList.push(compData[0].name);
                        return true;
                    } 
                    catch (error) {
                        notFoundCount += 1;
                    }
                    
                }));
                if(iterationSuccess.some((value) => value === false)) throw new ValidationError();
                if (projectData.end_date_real) await Project.updateState(project[0].id, validatedData.output.responsible_id, 'completed');
            }

            if(milestoneList.length > 0){
                milestoneList.forEach((milestone, index) => {
                    const validatedMilestone = safeParse(milestoneListSchema, milestone);
                    if (!validatedMilestone.success) throw new ValidationError();

                    Project.createMilestone({...validatedMilestone.output, project_id: project[0].id, order_index: index});
                });
            }
            
            if(outOfStockList.length === 0 && notFoundCount === 0) res.status(201).json({ message: 'Proyecto creado exitosamente', status: 'ok'});
            else res.status(201).json({ message: 'Error', status: 'fail', data: {notFoundCount, outOfStockList}});
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user_id: number = req.body.user.id;

            const validatedUserId = safeParse(number(), user_id);
            if (!validatedUserId.success) throw new ValidationError();

            const validatedId = safeParse(number(), parseInt(id));
            if (!validatedId.success) throw new ValidationError();

            const validatedData = safeParse(projectSchema, {...req.body, responsible_id: validatedUserId.output.toString()});
            if (!validatedData.success) throw new ValidationError();

            const actualizado = await Project.update(validatedId.output, validatedData.output);
            res.json({ message: 'Proyecto actualizado exitosamente', data: actualizado });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async updateState(req: Request, res: Response) {
        try {
            const { project_id } = req.params;
            const user_id: number = req.body.user.id;

            const validatedUserId = safeParse(number(), user_id);
            if (!validatedUserId.success) throw new ValidationError();

            const validatedId = safeParse(number(), parseInt(project_id));
            if (!validatedId.success) throw new ValidationError();

            const validatedData = safeParse(picklist(['paused', 'completed', 'cancelled']), req.body.state);
            if (!validatedData.success) throw new ValidationError();

            const actualizado = await Project.updateState(validatedId.output, validatedUserId.output, validatedData.output);
            res.json({ message: 'Estado actualizado exitosamente', data: actualizado });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async revertState(req: Request, res: Response) {
        try {
            const { project_id } = req.params;
            const user_id: number = req.body.user.id;

            const validatedUserId = safeParse(number(), user_id);
            if (!validatedUserId.success) throw new ValidationError();

            const validatedId = safeParse(number(), parseInt(project_id));
            if (!validatedId.success) throw new ValidationError();

            const actualizado = await Project.revertState(validatedId.output, validatedUserId.output);
            res.json({ message: 'Estado actualizado exitosamente', data: actualizado });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if (!validatedId.success) throw new ValidationError();

            const project = await Project.delete(validatedId.output);
            res.json({ message: 'Proyecto eliminado exitosamente', data: project });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async createMilestone(req: Request, res: Response) {
        try {
            const {project_id} = req.params;
            const user_id: number = req.body.user.id;

            const validatedUserId = safeParse(number(), user_id);
            if (!validatedUserId.success) throw new ValidationError();

            const validatedData = safeParse(milestoneSchema, {...req.body, project_id: parseInt(project_id)});
            if (!validatedData.success) throw new ValidationError();

            const milestone = await Project.createMilestone({...validatedData.output});
            res.json({ message: 'Hito creado exitosamente', data: milestone });
            

        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async updateMilestone(req: Request, res: Response) {
        try {
            const {project_id, milestone_id} = req.params;
            const user_id: number = req.body.user.id;

            const validatedUserId = safeParse(number(), user_id);
            if (!validatedUserId.success) throw new ValidationError();

            const validatedMilestoneId = safeParse(number(), parseInt(milestone_id));
            if (!validatedMilestoneId.success) throw new ValidationError();

            const validatedData = safeParse(milestoneSchema, {...req.body, project_id: parseInt(project_id)});
            if (!validatedData.success) throw new ValidationError();

            const milestone = await Project.updateMilestone(validatedUserId.output, validatedMilestoneId.output, validatedData.output);
            res.json({ message: 'Hito actualizado exitosamente', data: milestone });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async deleteMilestone(req: Request, res: Response) {
        try {
            const {milestone_id, project_id} = req.params;
            const user_id: number = req.body.user.id;

            const validatedUserId = safeParse(number(), user_id);
            if (!validatedUserId.success) throw new ValidationError();

            const validatedMilestoneId = safeParse(number(), parseInt(milestone_id));
            if (!validatedMilestoneId.success) throw new ValidationError();

            const validatedProjectId = safeParse(number(), parseInt(project_id));
            if (!validatedProjectId.success) throw new ValidationError();

            const milestone = await Project.deleteMilestone(validatedUserId.output, validatedProjectId.output, validatedMilestoneId.output);
            res.json({ message: 'Hito eliminado exitosamente', data: milestone });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async completeMilestone(req: Request, res: Response) {
        try {
            const {project_id} = req.params;
            const user_id: number = req.body.user.id;

            const validatedUserId = safeParse(number(), user_id);
            if (!validatedUserId.success) throw new ValidationError();

            const validatedProjectId = safeParse(number(), parseInt(project_id));
            if (!validatedProjectId.success) throw new ValidationError();

            const milestone = await Project.completeMilestone(validatedUserId.output, validatedProjectId.output);
            res.json({ message: 'Hito completado exitosamente', data: milestone });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async revertMilestone(req: Request, res: Response) {
        try {
            const {project_id} = req.params;
            const user_id: number = req.body.user.id;

            const validatedUserId = safeParse(number(), user_id);
            if (!validatedUserId.success) throw new ValidationError();

            const validatedProjectId = safeParse(number(), parseInt(project_id));
            if (!validatedProjectId.success) throw new ValidationError();

            const milestone = await Project.revertMilestone(validatedUserId.output, validatedProjectId.output);
            res.json({ message: 'Hito completado exitosamente', data: milestone });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async addTool(req: Request, res: Response) {
        try {
            const { project_id } = req.params;

            const validatedData = safeParse(projectToolSchema, {...req.body, project_id: parseInt(project_id)});
            if (!validatedData.success) throw new ValidationError();

            const nuevo = await Project.addTool(validatedData.output);
            res.status(201).json({ message: 'Herramienta asignada al proyecto', data: nuevo });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async updateTool(req: Request, res: Response) {
        try {
            const {project_id, tool_id} = req.params;

            const validatedData = safeParse(projectToolSchema, {...req.body, project_id: parseInt(project_id), tool_id: parseInt(tool_id)});
            if (!validatedData.success) throw new ValidationError();

            const projectTool = await Project.updateTool(validatedData.output);
            res.json({ message: 'Asignación actualizada exitosamente', data: projectTool }); 
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async removeTool(req: Request, res: Response) {
        try {
            const {project_id, tool_id} = req.params;

            const validatedProjectId = safeParse(number(), parseInt(project_id));
            const validatedToolId = safeParse(number(), parseInt(tool_id));
            if (!validatedProjectId.success || !validatedToolId.success) throw new ValidationError();

            const projectTool = await Project.removeTool(validatedProjectId.output, validatedToolId.output);
            res.json({ message: 'Herramienta removida del proyecto', data: projectTool });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async getProjectComponents(req: Request, res: Response) {
        try {
            const { project_id } = req.params;

            const {success, output} = safeParse(number(), parseInt(project_id));
            if (!success) throw new ValidationError();

            const projectComponents = await Project.getComponents(output);
            res.json({content: projectComponents});
        } 
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async addComponent(req: Request, res: Response) {
        try {
            const { project_id } = req.params;

            const validatedData = safeParse(projectComponentSchema, { ...req.body, project_id: parseInt(project_id) });
            if (!validatedData.success) throw new ValidationError();

            const projectComponent = await Project.addComponent(validatedData.output);
            res.status(201).json({ message: 'Componente añadido al proyecto', data: projectComponent }); 
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async updateComponent(req: Request, res: Response) {
        try {
            const { project_id, component_id } = req.params;

            const validatedData = safeParse(projectComponentSchema, {...req.body, project_id: parseInt(project_id), component_id: parseInt(component_id)});
            if (!validatedData.success) throw new ValidationError();

            const projectComponent = await Project.updateComponent(validatedData.output);
            res.json({ message: 'Componente del proyecto actualizado exitosamente', data: projectComponent });  
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }
    
    static async removeComponent(req: Request, res: Response) {
        try {
            const { project_id, component_id } = req.params;

            const validatedProjectId = safeParse(number(), parseInt(project_id));
            const validatedComponentId = safeParse(number(), parseInt(component_id));
            if (!validatedProjectId.success || !validatedComponentId.success) throw new ValidationError();

            const projectComponent = await Project.removeComponent(validatedProjectId.output, validatedComponentId.output);
            res.json({ message: 'Componente eliminado del proyecto', data: projectComponent });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }
}

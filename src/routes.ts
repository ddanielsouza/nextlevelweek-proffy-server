import express, {Request, Response, Router} from 'express';
import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';

const routes = Router();
const classesController = new ClassesController();
const connectionsController = new ConnectionsController();

routes.get('/', (request: Request, response: Response) =>{
    return response.json({message: `App is runing ${new Date().toJSON()}`});
})


routes.post('/classes', classesController.create);
routes.get('/classes', classesController.index);

routes.get('/connections', connectionsController.index);
routes.post('/connections', connectionsController.create);


export default routes;
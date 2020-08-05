import {Request, Response} from 'express';
import db from './../databases/connection';
import convertHourToMinutes from './../databases/utils/convertHourToMinutes';

interface ScheduleItem{
    week_day: number,
    from: string,
    to: string,
}

export default class ClassesController {
    async index (request: Request, response: Response){
        const filters = request.query;

        const week_day: string = filters.week_day as string;
        const subject: string = filters.subject as string;
        const time: string = filters.time as string;

        if(!week_day || !subject || !time){
            return response.status(400).send({error: "Missing filter to search classes"});
        }

        const timeInMinutes = convertHourToMinutes(time);

        const classes = await db('classes')
            .select(['classes.*', 'users.*'])
            .join('users', 'classes.user_id', '=', 'users.id')
            .where('classes.subject', '=', subject)
            .whereExists(function(){
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
                    .where('class_schedule.from', '<=', timeInMinutes)
                    .where('class_schedule.to', '>=', timeInMinutes)
            })
            

        return response.json(classes);
    }

    async create (request: Request, response: Response){
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = request.body;
        const trx = await db.transaction();
        try{
            
            const insertedUsersIds = await trx('users').insert({
                name,
                avatar,
                whatsapp,
                bio,
            })
    
            const user_id = insertedUsersIds[0];
    
            const insertedClassesIds = await trx('classes').insert({
                subject,
                cost,
                user_id
            })
            const class_id = insertedClassesIds[0];
    
    
            const classSchedule = schedule.map((s: ScheduleItem) => {
                
                return {
                    class_id,
                    week_day: s.week_day,
                    from:convertHourToMinutes(s.from),
                    to: convertHourToMinutes(s.to),
                }
            })
    
            await trx('class_schedule').insert(classSchedule)
    
            await trx.commit();
            return response.send(201);
        }catch(e){
            trx.rollback();
            return response.status(400).send({error: "Unexpected error"});
        }
    }
    
}
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { HttpException, HttpStatus } from '@nestjs/common';

class Validation {
    static async validate(metaType: any, obj: any) {
        const object = plainToClass(metaType, obj);
        let errors = [];
        if (!Array.isArray(object)) {
            const err = await validate(object);
            errors = [...err];
        } else {
            for (const item of object) {
                const err = await validate(item);
                errors = [...errors, ...err];
            }
        }
        if (errors.length > 0) {
            throw new HttpException(
                `Validation failed : ${Validation.formatErrors(errors)}`,
                HttpStatus.BAD_REQUEST,
            );
        }
        return object as any;
    }

    private static formatErrors(errors: any[]): string {
        return errors
            .map(error => {
                for (const property of Object.keys(error.constraints)) {
                    return error.constraints[property];
                }
            })
            .join(', ');
    }

    static getInstance(metaType: any, obj: any) {
        const object = plainToClass(metaType, obj);
        return object as any;
    }
}

export default Validation;

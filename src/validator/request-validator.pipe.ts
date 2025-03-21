import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any) {
    const { error } = this.schema.validate(value);
    if (error) {
      const errorMessage = error.details
        .map((error) => error.message)
        .join(', ');
      throw new BadRequestException(errorMessage);
    }
    return value;
  }
}

import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

/**
 * Decorator pour documenter les réponses paginées dans Swagger
 * @param model Le modèle de données
 * @example
 * @ApiPaginatedResponse(Parcelle)
 * @Get()
 * findAll() { ... }
 */
export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              total: {
                type: 'number',
                example: 100,
              },
              page: {
                type: 'number',
                example: 1,
              },
              limit: {
                type: 'number',
                example: 10,
              },
              totalPages: {
                type: 'number',
                example: 10,
              },
            },
          },
        ],
      },
    }),
  );
};
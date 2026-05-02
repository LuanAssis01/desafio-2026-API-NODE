import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate(schemas: ValidationSchemas) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (schemas.body) {
      request.body = schemas.body.parse(request.body);
    }

    if (schemas.params) {
      request.params = schemas.params.parse(request.params) as Request["params"];
    }

    if (schemas.query) {
      request.query = schemas.query.parse(request.query) as Request["query"];
    }

    next();
  };
}

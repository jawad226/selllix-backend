import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

export function validate(schema: ZodTypeAny, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse(req[source]);
    if (source === "query") {
      Object.assign(req.query, parsed);
    } else if (source === "params") {
      Object.assign(req.params, parsed);
    } else {
      req.body = parsed;
    }
    next();
  };
}

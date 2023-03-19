import {Request, Response, NextFunction} from 'express';

const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log('Logger here');
  next();
};

module.exports = logger;

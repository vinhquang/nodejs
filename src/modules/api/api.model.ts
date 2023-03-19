import {Request} from 'express';

export interface IGetInitialRequest extends Request {
  user: any
  sessionID: string
  session: any
}

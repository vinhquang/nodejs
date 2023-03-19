import axios from 'axios';
import {Request} from 'express';

const host = process.env.API_URL + '/api';

const apiGet = async (req: Request, url: string) => {
  const requestUrl = host + url;

  const token = req.cookies['userSave'];

  return await axios
      .get(
          requestUrl,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': (token) ? token : '',
            },
          },
      )
      .then((response) => response.data)
      .catch((err) => console.error(err.data));
};

const apiPost = async (req: Request, url: string, data: object) => {
  const requestUrl = host + url;

  const token = req.cookies['userSave'];

  return await axios
      .post(
          requestUrl,
          data,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': (token) ? token : '',
            },
          },
      )
      .then((response) => response.data)
      .catch((err) => console.error(err.data));
};

const apiPatch = async (req: Request, url: string, data: object) => {
  const requestUrl = host + url;

  const token = req.cookies['userSave'];

  return await axios
      .patch(
          requestUrl,
          data,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': (token) ? token : '',
            },
          },
      )
      .then((response) => response.data)
      .catch((err) => console.error(err.data));
};

module.exports = {
  apiGet,
  apiPost,
  apiPatch,
};

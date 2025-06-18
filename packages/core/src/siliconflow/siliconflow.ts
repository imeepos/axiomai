import { inject, injectable } from 'tsyringe';
import { Env } from '../env';
import axios from 'axios';

@injectable()
export class Siliconflow {
  constructor(@inject(Env) private env: Env) {}
  create() {
    return axios.create({
      baseURL: this.env.get(`SILICONFLOW_BASE_URL`),
      headers: {
        Authorization: `Bearer ${this.env.get(`SILICONFLOW_API_KEY`)}`,
        [`Content-Type`]: `application/json`,
      },
    });
  }
}

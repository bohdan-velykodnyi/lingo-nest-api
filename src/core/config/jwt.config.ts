import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  key: process.env.JWT_KEY,
  access_expire: Number(process.env.JWT_ACCESS_EXPIRE),
  refresh_expire: Number(process.env.JWT_REFRESH_EXPIRE),
}));

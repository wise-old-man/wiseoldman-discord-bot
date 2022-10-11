import { WOMClient } from '@wise-old-man/utils';
import config from '../config';

const womClient = new WOMClient({
  userAgent: 'WiseOldMan Discord Bot',
  baseAPIUrl: config.baseAPIUrl,
  apiKey: config.apiKey
});

export default womClient;

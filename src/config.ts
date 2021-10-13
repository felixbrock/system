export const nodeEnv = process.env.NODE_ENV || 'development';
export const defaultPort = 3002;
export const port = process.env.PORT ? parseInt(process.env.PORT, 10) : defaultPort;
export const apiRoot = process.env.API_ROOT || "api";

const getServiceDiscoveryNamespace = (): string => {
  let namespace = '';

  switch (nodeEnv) {
    case 'test':
      namespace = 'hivedive-test';
      break;
    case 'production':
      namespace = 'hivedive';
      break;
    default:
      break;
  }

  return namespace;
};

export const serviceDiscoveryNamespace = getServiceDiscoveryNamespace();

const getMongodbConfig = (): any => {
  const mongodb: any = {};

  switch (nodeEnv) {
    case 'development':
      mongodb.url = process.env.DATABASE_DEV_URL || '';
      mongodb.dbName = process.env.DATABASE_DEV_NAME || '';
      break;
    case 'test':
      mongodb.url = process.env.DATABASE_TEST_URL || '';
      mongodb.dbName = process.env.DATABASE_TEST_NAME || '';
      break;
    case 'production':
      mongodb.url = process.env.DATABASE_URL || '';
      mongodb.dbName = process.env.DATABASE_NAME || '';
      break;
    default:
      break;
  }

  return mongodb;
};

export const appConfig = {
  express: {
    port,
    mode: nodeEnv,
  },
  mongodb: {
    ...getMongodbConfig(),
  },
};

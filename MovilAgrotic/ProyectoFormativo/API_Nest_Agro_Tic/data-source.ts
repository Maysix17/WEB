import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';


dotenv.config();

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'], // Referencia directa a la entidad
  migrations: [__dirname + '/src/migrations/*.ts'], // Ruta corregida
  synchronize: false,
  migrationsRun: false,
  logging: true,
};

const AppDataSource = new DataSource(config);


export default AppDataSource;
// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'API Nest AgroTic',
			description: 'Documentación completa de la API REST para el sistema AgroTic',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			sidebar: [
				{
					label: 'Introducción',
					items: [
						{ label: 'Bienvenido', slug: 'intro/welcome' },
						{ label: 'Estructura de la API', slug: 'intro/structure' },
					],
				},
				{
					label: 'Endpoints',
					items: [
						{ label: 'Autenticación', slug: 'intro/auth' },
						{ label: 'Usuarios', slug: 'api/usuarios' },
						{ label: 'Cultivos', slug: 'api/cultivos' },
						{ label: 'Variedades', slug: 'api/variedad' },
						{ label: 'Zonas', slug: 'api/zonas' },
						{ label: 'Ventas', slug: 'api/venta' },
						{ label: 'Permisos', slug: 'api/permisos' },
						{ label: 'Roles', slug: 'api/roles' },
						{ label: 'Actividades', slug: 'api/actividades' },
						{ label: 'Mapas', slug: 'api/mapas' },
						{ label: 'Sensores', slug: 'api/sensor' },
						{ label: 'Mediciones', slug: 'api/medicion_sensor' },
						{ label: 'Productos', slug: 'api/productos' },
						{ label: 'Inventario', slug: 'api/inventario' },
						{ label: 'Bodega', slug: 'api/bodega' },
						{ label: 'Categorías', slug: 'api/categoria' },
						{ label: 'Cosechas', slug: 'api/cosechas' },
						{ label: 'Fichas', slug: 'api/fichas' },
						{ label: 'Módulos', slug: 'api/modulos' },
					],
				},
				{
					label: 'Backend',
					items: [
						{ label: 'Arquitectura', slug: 'backend/architecture' },
						{ label: 'Diagramas', slug: 'backend/diagramas' },
						{ label: 'Entidades y Base de Datos', slug: 'backend/database' },
						{ label: 'Servicios', slug: 'backend/services' },
						{ label: 'Guards y Seguridad', slug: 'backend/security' },
						{ label: 'DTOs y Validación', slug: 'backend/dtos' },
						{ label: 'Despliegue', slug: 'backend/deployment' },
					],
				},
				{
					label: 'Manual de Usuario',
					autogenerate: { directory: 'manual-usuario' },
				},
				{
					label: 'Referencia',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
		mermaid({
			theme: 'dark',
		}),
	],
});

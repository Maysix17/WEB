export type RootStackParamList = {

    // Rutas sin parámetros: el valor es 'undefined'
    Login: undefined;
    Registro: undefined;
    RecuperarContraseña: undefined;
    Dashboard: undefined;
    Cultivos: undefined;
    Inventario: undefined;
    Movimientos: undefined;
    IOT: undefined;
    Profile: undefined;
    PanelControl: undefined;

    // Ruta para cambiar contraseña con token
    CambioContraseña: { token: string };

    // Ruta para gestión de actividades
    Actividades: undefined;

    // Ruta para historial de actividades finalizadas
    HistorialActividades: undefined;

    // Ruta para gestión de zonas
    Zonas: undefined;

    // Ruta para detalles de producto
    ProductDetail: { item: any };

    // Ejemplo de una ruta que requiere un parámetro:
    PerfilUsuario: { userId: string };

    // Ejemplo de una ruta con parámetros opcionales:
    Configuracion: { tema?: 'oscuro' | 'claro' };
};

// Puedes exportar un tipo de navegación genérico basado en la pila principal,
// aunque generalmente se tipa con el hook useNavigation() en cada componente.
// export type AppNavigation = NativeStackNavigationProp<RootStackParamList>;
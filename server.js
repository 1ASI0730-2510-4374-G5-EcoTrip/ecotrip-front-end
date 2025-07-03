import { createRequire } from 'module';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const jsonServer = require('json-server');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Puerto desde variable de entorno (Render) o 3003 por defecto
const port = process.env.PORT || 3003;

// Configurar CORS y otros middlewares por defecto
server.use(middlewares);
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    next();
});

// Middleware para manejar POST y PUT
server.use(jsonServer.bodyParser);

// Middleware para simular latencia de red
server.use((req, res, next) => {
    setTimeout(next, 100);
});

// Log all requests
server.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
});

// Servir archivos estáticos del frontend en producción PRIMERO
if (process.env.NODE_ENV === 'production' || process.env.PORT) {
    console.log('Configurando archivos estáticos para producción');
    server.use(express.static(path.join(__dirname, 'dist')));
}

// Ruta de login GET (para compatibilidad con frontend) - CON PREFIJO /api
server.get('/api/users', (req, res, next) => {
    const { email, password, role } = req.query;
    
    // Si tiene parámetros de login, tratar como autenticación
    if (email && password && role) {
        console.log('Recibida solicitud de login GET en /api/users:', { email, password: '***', role });
        
        try {
            const users = router.db.get('users').value();
            console.log('Buscando usuario con email:', email, 'y role:', role);
            
            const user = users.find(u => u.email === email && u.password === password && u.role === role);
            if (user) {
                // No enviar la contraseña en la respuesta
                const { password, ...userWithoutPassword } = user;
                console.log('Usuario encontrado:', userWithoutPassword);
                return res.json(userWithoutPassword);
            } else {
                console.log('Usuario no encontrado');
                return res.status(401).json({ error: 'Credenciales incorrectas' });
            }
        } catch (error) {
            console.error('Error al procesar login:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    
    // Si no es login, continuar con el comportamiento normal de json-server
    next();
});

// Ruta de login POST - CON PREFIJO /api
server.post('/api/auth/login', (req, res) => {
    console.log('Recibida solicitud de login POST en /api/auth/login:', req.body);
    
    const { email, password, role } = req.body;
    
    if (!email || !password || !role) {
        console.log('Datos de login incompletos');
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    try {
        const users = router.db.get('users').value();
        console.log('Buscando usuario con email:', email, 'y role:', role);
        
        const user = users.find(u => u.email === email && u.password === password && u.role === role);
        if (user) {
            // No enviar la contraseña en la respuesta
            const { password, ...userWithoutPassword } = user;
            console.log('Usuario encontrado:', userWithoutPassword);
            res.json(userWithoutPassword);
        } else {
            console.log('Usuario no encontrado');
            res.status(401).json({ error: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.error('Error al procesar login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Usar el router de json-server para las rutas de API con prefijo /api
server.use('/api', router);

// Manejar todas las rutas SPA que no son API (debe ir al final)
if (process.env.NODE_ENV === 'production' || process.env.PORT) {
    server.get('*', (req, res) => {
        // Solo redirigir si no es una ruta de API (con prefijo /api)
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, 'dist', 'index.html'));
        }
    });
}

// Iniciar el servidor
server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    if (process.env.NODE_ENV === 'production' || process.env.PORT) {
        console.log(`Frontend: http://localhost:${port}`);
        console.log(`API: http://localhost:${port}/`);
    } else {
        console.log(`JSON Server está corriendo en http://localhost:${port}`);
    }
});

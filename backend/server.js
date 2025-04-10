// backend/server.js
require('dotenv').config();
const express = require('express');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const app = express();

// Middlewares
const cors = require('cors');

// Reemplaza con tu dominio real (sin "/" al final):
const allowedOrigins = ['https://springgreen-eland-179690.hostingersite.com'];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // 👈 Agrega esta línea
}));
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Conectado a MongoDB');
}).catch((err) => {
    console.error('❌ Error en MongoDB:', err);
});

// Esquema y modelo de usuario
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Función para generar token JWT
function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

// Middleware para verificar el token
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, error: 'Falta token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Token inválido o expirado' });
    }
}

// 1. Registro: POST /api/register
app.post('/api/register', async(req, res) => {
    try {
        let { name, lastName, phone, email, password } = req.body;

        // Validar campos
        if (!name || !lastName || !phone || !email || !password) {
            return res.status(400).json({ success: false, error: 'Faltan datos' });
        }

        // Ajustar email
        email = email.trim().toLowerCase();

        // Validar email
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, error: 'Correo inválido' });
        }

        // Validar contraseña
        if (password.length < 8) {
            return res.status(400).json({ success: false, error: 'Contraseña muy corta (mín. 8)' });
        }

        // Verificar duplicados
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ success: false, error: 'Correo ya registrado' });
        }
        const phoneExists = await User.findOne({ phone });
        if (phoneExists) {
            return res.status(400).json({ success: false, error: 'Teléfono ya registrado' });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const newUser = new User({
            name,
            lastName,
            phone,
            email,
            password: hashedPassword
        });
        await newUser.save();

        console.log('Usuario registrado:', newUser._id);
        return res.json({ success: true, message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error en /api/register:', error);
        return res.status(400).json({ success: false, error: 'No se pudo registrar' });
    }
});

// 2. Login: POST /api/login
app.post('/api/login', async(req, res) => {
    try {
        let { emailOrPhone, password } = req.body;
        emailOrPhone = emailOrPhone.trim();

        // Buscar usuario por email o phone
        let user = await User.findOne({ email: emailOrPhone });
        if (!user) {
            user = await User.findOne({ phone: emailOrPhone });
        }
        if (!user) {
            return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
        }

        // Comparar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
        }

        // Generar token
        const token = generateToken(user._id);
        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Error en /api/login:', error);
        return res.status(400).json({ success: false, error: 'No se pudo iniciar sesión' });
    }
});

// 3. Ruta protegida: GET /api/protegido
app.get('/api/protegido', authMiddleware, (req, res) => {
    return res.json({
        success: true,
        message: 'Acceso concedido',
        userId: req.userId
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
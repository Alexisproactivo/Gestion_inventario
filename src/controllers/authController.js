const { OAuth2Client } = require('google-auth-library');
const Usuario = require('../models/usuarioModel');

const CLIENT_ID = '873421709361-vlbcuc50h89891i2tvpioijfg1p4rt2f.apps.googleusercontent.com';
const clienteGoogle = new OAuth2Client(CLIENT_ID);

const authController = {
  loginGoogle: async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ mensaje: 'El token de Google es obligatorio' });
    }

    try {
      // 1. Validar la firma criptográfica del token directamente con Google
      const ticket = await clienteGoogle.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
      });

      // 2. Extraer datos reales del payload de Google
      const payload = ticket.getPayload();
      const googleId = payload.sub;
      const nombre = payload.name;
      const email = payload.email;
      const avatarUrl = payload.picture;

      // 3. Delegar persistencia al modelo (guardar o traer de Neon)
      const usuario = await Usuario.buscarOCrearPorGoogle({
        googleId,
        nombre,
        email,
        avatarUrl
      });

      // 4. Responder con éxito
      res.status(200).json({
        mensaje: 'Autenticación exitosa',
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          avatarUrl: usuario.avatar_url,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error('Error al verificar el token de Google:', error);
      res.status(401).json({ mensaje: 'Token de Google inválido o expirado' });
    }
  }
};

module.exports = authController;
// index.js
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();
app.set('trust proxy', true);

const allowedOrigins = ['http://localhost:5173', 'http://193.160.119.15'];

// Enable CORS for frontend application
app.use(cors({
  origin: function (origin, callback) {
    // Разрешить запросы без Origin (например, curl или мобильные клиенты)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Parse incoming JSON requests
app.use(express.json());

// Load Swagger specification from docs/swagger.yaml
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Load authentication middleware
const authMiddleware = require('./middlewares/authMiddleware');

// Load route handlers
const authRoutes         = require('./routes/auth/authRoutes');
const publicRegRoutes    = require('./routes/auth/registrationRoutes');

const userRoutes         = require('./routes/admin/userRoutes');
const roleRoutes         = require('./routes/admin/roleRoutes');
const accessRoutes       = require('./routes/admin/accessRoutes');
const roleAccessRoutes   = require('./routes/admin/roleAccessRoutes');
const sessionRoutes      = require('./routes/admin/sessionRoutes');
const languageRoutes     = require('./routes/admin/languageRoutes');
const adminRegRoutes     = require('./routes/admin/registrationAdminRoutes');

const profileRoutes      = require('./routes/profile/profileRoutes');
const userSettingRoutes  = require('./routes/profile/userSettingRoutes');

const carCategoryRoutes  = require('./routes/car/carCategoryRoutes');
const carRoutes          = require('./routes/car/carRoutes');
const carBookRoutes      = require('./routes/car/carBookRoutes');

const hotelRoomRoutes    = require('./routes/hotel/hotelRoomRoutes');
const hotelBookRoutes    = require('./routes/hotel/hotelBookRoutes');
const hotelPhotoRoutes   = require('./routes/hotel/hotelPhotoRoutes');

const certificateRoutes         = require('./routes/certificate/certificateRoutes');
const certificateFieldRoutes    = require('./routes/certificate/certificateFieldRoutes');
const certificateRequestRoutes  = require('./routes/certificate/certificateRequestRoutes');
const certificateDataRoutes     = require('./routes/certificate/certificateDataRoutes');

const coworkingRoomRoutes = require('./routes/coworking/coworkingRoomRoutes');
const coworkingBookRoutes = require('./routes/coworking/coworkingBookRoutes');

// Public authentication and registration routes
app.use('/api/auth/registration', publicRegRoutes);
app.use('/api/auth',          authRoutes);

// Protected admin routes
app.use('/api/users',          authMiddleware, userRoutes);
app.use('/api/roles',          authMiddleware, roleRoutes);
app.use('/api/access',         authMiddleware, accessRoutes);
app.use('/api/role-access',    authMiddleware, roleAccessRoutes);
app.use('/api/sessions',       authMiddleware, sessionRoutes);
app.use('/api/language',       authMiddleware, languageRoutes);
app.use('/api/admin/registration', authMiddleware, adminRegRoutes);

// Protected user profile routes
app.use('/api/profile',        authMiddleware, profileRoutes);
app.use('/api/user-setting',   authMiddleware, userSettingRoutes);

// Protected car booking routes
app.use('/api/car-categories', authMiddleware, carCategoryRoutes);
app.use('/api/cars',           authMiddleware, carRoutes);
app.use('/api/car-bookings',   authMiddleware, carBookRoutes);

// Protected hotel routes
app.use('/api/hotel/rooms',    authMiddleware, hotelRoomRoutes);
app.use('/api/hotel/bookings', authMiddleware, hotelBookRoutes);
app.use('/api/hotel/photos',   authMiddleware, hotelPhotoRoutes);

// Protected certificate routes
app.use('/api/certificate/fields',   authMiddleware, certificateFieldRoutes);
app.use('/api/certificate/requests', authMiddleware, certificateRequestRoutes);
app.use('/api/certificate/data',     authMiddleware, certificateDataRoutes);
app.use('/api/certificate',          authMiddleware, certificateRoutes);

// Protected coworking routes
app.use('/api/coworking', authMiddleware, coworkingRoomRoutes);
app.use('/api/coworking/bookings', authMiddleware, coworkingBookRoutes);


// Load and apply global error handler
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API started on port ${PORT}`);
});

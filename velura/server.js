import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "noideawhatimdoing";
const app = express();
const PORT = 8082;

// Enable CORS for client requests
app.use(
  cors({
    origin: "https://velura.vercel.app/",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "laserX+20",
  database: "velura",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("Access Denied. No token provided.");
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).send("Invalid Token");
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'public', 'uploads', 'profile-images');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with user ID
    const userId = req.body.userId || 'unknown';
    const fileExt = path.extname(file.originalname);
    const fileName = `user-${userId}-${Date.now()}${fileExt}`;
    cb(null, fileName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// File upload endpoint
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const relativePath = `/uploads/profile-images/${req.file.filename}`;
    
    res.status(200).json({ 
      success: true, 
      filePath: relativePath,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).send('Error uploading file');
  }
});

// Registration endpoint
app.post("/api/user/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("All fields are required");
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Begin transaction
    await connection.beginTransaction();

    // Check if username or email already exists
    const [existingUsers] = await connection.query(
      "SELECT * FROM user_profiles WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(409).send("Username or email already exists");
    }

    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Generate a UUID for the user
    const user_id = uuidv4();

    // Get current date in MySQL format
    const currentDate = new Date().toISOString().slice(0, 10);
    const currentDateTime = "2025-03-18 09:30:49"; // Use your provided timestamp

    // Insert new user into user_profiles table
    await connection.query(
      `INSERT INTO user_profiles (
        user_id, username, email, password_hash, name, 
        date_joined, last_login, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user_id,
        username,
        email,
        password_hash,
        username,
        currentDate,
        currentDateTime,
      ]
    );

    // Create default measurements entry
    await connection.query(
      `INSERT INTO user_measurements (measurement_id, user_id) VALUES (?, ?)`,
      [uuidv4(), user_id]
    );

    // Commit transaction
    await connection.commit();

    res.status(201).send("User registered successfully");
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error during registration:", error);
    res.status(500).send("An error occurred during registration");
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Login endpoint
app.post("/api/user/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Get user from database
    const [users] = await connection.query(
      "SELECT * FROM user_profiles WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return res.status(401).send("Invalid username or password");
    }

    const user = users[0];

    // Compare password with hashed password in database
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).send("Invalid username or password");
    }

    await connection.query(
      "UPDATE user_profiles SET last_login = NOW() WHERE user_id = ?",
      [user.user_id]
    );

    const role = user.role || (username === 'admin' ? 'admin' : 'user');

    // Generate JWT token with role included
    const token = jwt.sign(
      {
        userId: user.user_id,
        username: user.username,
        role: role // Include role in the JWT token
      },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      username: user.username,
      user_id: user.user_id,
      role: role,
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("An error occurred during login");
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get user profile
app.get("/api/user/profile/:userId", authenticateToken, async (req, res) => {
  // Verify the user is requesting their own profile
  if (req.params.userId !== req.user.userId) {
    return res.status(403).send("Unauthorized to access this profile");
  }

  let connection;
  try {
    connection = await pool.getConnection();

    const [rows] = await connection.query(
      `SELECT 
        user_id, username, name, email, phone, profile_image_path,
        street, city, state, zip_code, country, date_joined, last_login
      FROM user_profiles 
      WHERE user_id = ?`,
      [req.params.userId]
    );

    if (rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const userData = rows[0];

    // Format the last_login timestamp to match your specified format
    if (userData.last_login) {
      userData.last_login = new Date(userData.last_login)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    }

    // If the user's last_login is null, set it to the provided timestamp
    if (!userData.last_login) {
      userData.last_login = "2025-03-18 09:30:49";
    }

    // Format the date_joined timestamp
    if (userData.date_joined) {
      const date = new Date(userData.date_joined);
      userData.date_joined = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("An error occurred");
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Update user profile
app.put("/api/user/profile/:userId", authenticateToken, async (req, res) => {
  // Verify the user is updating their own profile
  if (req.params.userId !== req.user.userId) {
    return res.status(403).send("Unauthorized to update this profile");
  }

  const { name, email, phone, address } = req.body;

  if (!name || !email) {
    return res.status(400).send("Name and email are required");
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // First check if email is already taken by another user
    if (email) {
      const [existingUsers] = await connection.query(
        "SELECT user_id FROM user_profiles WHERE email = ? AND user_id != ?",
        [email, req.params.userId]
      );

      if (existingUsers.length > 0) {
        return res.status(409).send("Email is already in use");
      }
    }

    // Update user profile
    await connection.query(
      `UPDATE user_profiles SET 
        name = ?,
        email = ?,
        phone = ?,
        street = ?,
        city = ?,
        state = ?,
        zip_code = ?,
        country = ?,
        updated_at = NOW()
      WHERE user_id = ?`,
      [
        name,
        email,
        phone || null,
        address?.street || null,
        address?.city || null,
        address?.state || null,
        address?.zipCode || null,
        address?.country || null,
        req.params.userId,
      ]
    );

    res.status(200).send("Profile updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).send("An error occurred");
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get user measurements
app.get(
  "/api/user/measurements/:userId",
  authenticateToken,
  async (req, res) => {
    // Verify the user is requesting their own measurements
    if (req.params.userId !== req.user.userId) {
      return res.status(403).send("Unauthorized to access these measurements");
    }

    let connection;
    try {
      connection = await pool.getConnection();

      const [rows] = await connection.query(
        `SELECT 
        blouse_bust, blouse_waist, blouse_shoulder, blouse_arm_length, blouse_armhole,
        petticoat_waist, petticoat_length, last_updated
      FROM user_measurements 
      WHERE user_id = ?`,
        [req.params.userId]
      );

      if (rows.length === 0) {
        // Create default measurements if none exist
        const measurementId = uuidv4();
        await connection.query(
          `INSERT INTO user_measurements (measurement_id, user_id) VALUES (?, ?)`,
          [measurementId, req.params.userId]
        );

        return res.status(200).json({
          blouse_bust: "",
          blouse_waist: "",
          blouse_shoulder: "",
          blouse_arm_length: "",
          blouse_armhole: "",
          petticoat_waist: "",
          petticoat_length: "",
          last_updated: "2025-03-18 09:30:49",
        });
      }

      // Format the last_updated timestamp if it exists
      const measurementData = rows[0];
      if (measurementData.last_updated) {
        measurementData.last_updated = new Date(measurementData.last_updated)
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      } else {
        measurementData.last_updated = "2025-03-18 09:30:49";
      }

      res.status(200).json(measurementData);
    } catch (error) {
      console.error("Error fetching user measurements:", error);
      res.status(500).send("An error occurred");
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

// Update user measurements
app.put(
  "/api/user/measurements/:userId",
  authenticateToken,
  async (req, res) => {
    // Verify the user is updating their own measurements
    if (req.params.userId !== req.user.userId) {
      return res.status(403).send("Unauthorized to update these measurements");
    }

    const { blouse, petticoat } = req.body;

    if (!blouse || !petticoat) {
      return res
        .status(400)
        .send("Blouse and petticoat measurements are required");
    }

    let connection;
    try {
      connection = await pool.getConnection();

      // Update measurements
      await connection.query(
        `UPDATE user_measurements SET 
        blouse_bust = ?,
        blouse_waist = ?,
        blouse_shoulder = ?,
        blouse_arm_length = ?,
        blouse_armhole = ?,
        petticoat_waist = ?,
        petticoat_length = ?,
        last_updated = ?
      WHERE user_id = ?`,
        [
          blouse.bust || "",
          blouse.waist || "",
          blouse.shoulder || "",
          blouse.armLength || "",
          blouse.armhole || "",
          petticoat.waist || "",
          petticoat.length || "",
          "2025-03-18 09:30:49", // Use the provided timestamp
          req.params.userId,
        ]
      );

      res.status(200).send("Measurements updated successfully");
    } catch (error) {
      console.error("Error updating user measurements:", error);
      res.status(500).send("An error occurred");
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

// Get user orders
app.get("/api/user/orders/:userId", authenticateToken, async (req, res) => {
  // Verify the user is requesting their own orders
  if (req.params.userId !== req.user.userId) {
    return res.status(403).send("Unauthorized to access these orders");
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Get orders
    const [orders] = await connection.query(
      `SELECT order_id, order_date, status, total_amount
       FROM orders 
       WHERE user_id = ?
       ORDER BY order_date DESC`,
      [req.params.userId]
    );

    // For each order, get its items
    const formattedOrders = await Promise.all(
      orders.map(async (order) => {
        const [items] = await connection.query(
          `SELECT item_id as id, product_id, product_name as name, price, image_path as image
         FROM order_items 
         WHERE order_id = ?`,
          [order.order_id]
        );

        return {
          id: order.order_id,
          date: new Date(order.order_date).toISOString().slice(0, 10),
          status: order.status,
          total: order.total_amount,
          items: items,
        };
      })
    );

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).send("An error occurred");
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Create new order
app.post("/api/user/orders", authenticateToken, async (req, res) => {
  const { items, total_amount } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).send("Order must contain at least one item");
  }

  if (!total_amount || isNaN(parseFloat(total_amount))) {
    return res.status(400).send("Valid total amount is required");
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Begin transaction
    await connection.beginTransaction();

    // Generate unique order ID (e.g. ORD-8765432)
    const orderId = `ORD-${Math.floor(1000000 + Math.random() * 9000000)}`;

    // Current timestamp from the provided value
    const currentDateTime = "2025-03-18 09:33:52";

    // Create new order
    await connection.query(
      `INSERT INTO orders (order_id, user_id, status, total_amount)
         VALUES (?, ?, ?, ?)`,
      [orderId, req.user.userId, "Pending", parseFloat(total_amount)]
    );

    // Insert order items
    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (item_id, order_id, product_id, product_name, price, image_path)
           VALUES (?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          orderId,
          item.product_id,
          item.product_name,
          parseFloat(item.price),
          item.image_path || null,
        ]
      );
    }

    // Commit transaction
    await connection.commit();

    res.status(201).json({
      message: "Order created successfully",
      orderId: orderId,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error creating order:", error);
    res.status(500).send("An error occurred");
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get order details
app.get(
  "/api/user/orders/:userId/:orderId",
  authenticateToken,
  async (req, res) => {
    // Verify the user is requesting their own order
    if (req.params.userId !== req.user.userId) {
      return res.status(403).send("Unauthorized to access this order");
    }

    const { orderId } = req.params;

    let connection;
    try {
      connection = await pool.getConnection();

      // Get order
      const [orders] = await connection.query(
        `SELECT order_id, order_date, status, total_amount
         FROM orders 
         WHERE order_id = ? AND user_id = ?`,
        [orderId, req.params.userId]
      );

      if (orders.length === 0) {
        return res.status(404).send("Order not found");
      }

      // Get order items
      const [items] = await connection.query(
        `SELECT item_id as id, product_id, product_name as name, price, image_path as image
         FROM order_items 
         WHERE order_id = ?`,
        [orderId]
      );

      const orderData = {
        id: orders[0].order_id,
        date: new Date(orders[0].order_date).toISOString().slice(0, 10),
        status: orders[0].status,
        total: orders[0].total_amount,
        items: items,
      };

      res.status(200).json(orderData);
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).send("An error occurred");
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

// Change password
app.post("/api/user/change-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).send("Current and new passwords are required");
  }

  if (newPassword.length < 4 || newPassword.length > 8) {
    return res.status(400).send("Password must be between 4 and 8 characters");
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Get user from database to verify current password
    const [users] = await connection.query(
      "SELECT password_hash FROM user_profiles WHERE user_id = ?",
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).send("User not found");
    }

    const user = users[0];

    // Verify current password
    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).send("Current password is incorrect");
    }

    // Hash the new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update the password
    await connection.query(
      "UPDATE user_profiles SET password_hash = ?, updated_at = ? WHERE user_id = ?",
      [newPasswordHash, "2025-03-18 09:33:52", req.user.userId]
    );

    res.status(200).send("Password changed successfully");
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send("An error occurred");
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Upload profile image
app.post(
  "/api/user/profile-image/:userId",
  authenticateToken,
  async (req, res) => {
    if (req.params.userId !== req.user.userId) {
      return res.status(403).send("Unauthorized to update this profile image");
    }
    const { imagePath } = req.body;

    if (!imagePath) {
      return res.status(400).send("Image path is required");
    }

    let connection;
    try {
      connection = await pool.getConnection();

      await connection.query(
        "UPDATE user_profiles SET profile_image_path = ?, updated_at = ? WHERE user_id = ?",
        [imagePath, "2025-03-18 09:33:52", req.params.userId]
      );

      res.status(200).send("Profile image updated successfully");
    } catch (error) {
      console.error("Error updating profile image:", error);
      res.status(500).send("An error occurred");
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

// Get all sarees with optional filtering
app.get("/api/sarees", async (req, res) => {
  const { search, material, color, priceRange, category } = req.query;

  console.log(
    `[2025-03-18 14:05:52] laserXnext: Search API called with params:`,
    req.query
  );

  let connection;
  try {
    connection = await pool.getConnection();

    // Using the correct table name "sarees" (plural)
    let query = `SELECT * FROM sarees WHERE available = 1`;
    const params = [];

    // Add search filter if provided
    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Add material filter if provided
    if (material && material !== "All") {
      query += ` AND material = ?`;
      params.push(material);
    }

    // Add color filter if provided
    if (color && color !== "All") {
      query += ` AND color = ?`;
      params.push(color);
    }

    // Add category filter if provided
    if (category && category !== "All") {
      query += ` AND category = ?`;
      params.push(category);
    }

    // Add price range filter if provided
    if (priceRange) {
      switch (priceRange) {
        case "Below LKR 5000":
          query += ` AND price < 5000`;
          break;
        case "LKR 5000 - LKR 10000":
          query += ` AND price >= 5000 AND price <= 10000`;
          break;
        case "LKR 10000 - LKR 20000":
          query += ` AND price > 10000 AND price <= 20000`;
          break;
        case "Above LKR 20000":
          query += ` AND price > 20000`;
          break;
      }
    }

    // Add sorting
    query += ` ORDER BY created_date_time DESC`;

    console.log(`[2025-03-18 14:05:52] laserXnext: Executing query: ${query}`);
    console.log(`[2025-03-18 14:05:52] laserXnext: With params: ${params}`);

    // Execute the query
    const [sarees] = await connection.query(query, params);

    // Calculate final price with discount
    const sareesWithFinalPrice = sarees.map((saree) => {
      const discountAmount = saree.price * (saree.discount_percentage / 100);
      const finalPrice = saree.price - discountAmount;

      return {
        ...saree,
        finalPrice: parseFloat(finalPrice.toFixed(2)),
      };
    });

    res.status(200).json(sareesWithFinalPrice);
  } catch (error) {
    console.error(
      "[2025-03-18 14:05:52] laserXnext: Error fetching sarees:",
      error
    );
    res.status(500).send("An error occurred while fetching sarees");
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get unique filter options from the database
app.get("/api/sarees/filters", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Using the correct table name "sarees" (plural)
    // Get unique materials
    const [materials] = await connection.query(
      `SELECT DISTINCT material FROM sarees WHERE available = 1 AND material IS NOT NULL`
    );

    // Get unique colors
    const [colors] = await connection.query(
      `SELECT DISTINCT color FROM sarees WHERE available = 1 AND color IS NOT NULL`
    );

    // Get unique categories
    const [categories] = await connection.query(
      `SELECT DISTINCT category FROM sarees WHERE available = 1 AND category IS NOT NULL`
    );

    // Get price ranges
    const [priceStats] = await connection.query(
      `SELECT MIN(price) as minPrice, MAX(price) as maxPrice FROM sarees WHERE available = 1`
    );

    // Format the response
    const filterOptions = {
      materials: materials.map((m) => m.material),
      colors: colors.map((c) => c.color),
      categories: categories.map((c) => c.category),
      priceStats: priceStats[0],
    };

    console.log(
      `[2025-03-18 14:05:52] laserXnext: Returning filter options:`,
      filterOptions
    );
    res.status(200).json(filterOptions);
  } catch (error) {
    console.error(
      "[2025-03-18 14:05:52] laserXnext: Error fetching filter options:",
      error
    );
    res.status(500).send("An error occurred while fetching filter options");
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Routes
// Get all reviews for a product
const getProductReviews = async (productId, connection) => {
  const [reviews] = await connection.query(
    `SELECT 
      id, product_id as productId, user_id as userId, rating, 
      title, comment, name, 
      created_at as date, updated_at as updatedAt 
    FROM product_reviews 
    WHERE product_id = ? 
    ORDER BY created_at DESC`,
    [productId]
  );

  return reviews;
};

// Calculate average rating for a product
const calculateAverageRating = async (productId, connection) => {
  const [result] = await connection.query(
    `SELECT AVG(rating) as average 
    FROM product_reviews 
    WHERE product_id = ?`,
    [productId]
  );

  return result[0].average || 0;
};

// Update the routes to use the database

// Get all reviews or filter by productId
app.get("/api/reviews", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    if (req.query.productId) {
      const reviews = await getProductReviews(req.query.productId, connection);
      return res.json(reviews);
    }

    // If no productId, return all reviews (with pagination)
    const [reviews] = await connection.query(
      `SELECT 
        id, product_id as productId, user_id as userId, rating, 
        title, comment, name, 
        created_at as date, updated_at as updatedAt 
      FROM product_reviews 
      ORDER BY created_at DESC 
      LIMIT 100`
    );

    res.json(reviews);
  } catch (error) {
    console.error(
      "[2025-03-20 19:26:17] laserXnext: Error fetching reviews:",
      error
    );
    res.status(500).json({ error: "Failed to fetch reviews" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get a specific review
app.get("/api/reviews/:id", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [reviews] = await connection.query(
      `SELECT 
        id, product_id as productId, user_id as userId, rating, 
        title, comment, name, 
        created_at as date, updated_at as updatedAt 
      FROM product_reviews 
      WHERE id = ?`,
      [req.params.id]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json(reviews[0]);
  } catch (error) {
    console.error(
      "[2025-03-20 19:26:17] laserXnext: Error fetching review:",
      error
    );
    res.status(500).json({ error: "Failed to fetch review" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Create a new review
app.post("/api/reviews", async (req, res) => {
  let connection;
  try {
    const { productId, rating, title, comment, name, userId } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    connection = await pool.getConnection();

    // Generate unique ID
    const reviewId = uuidv4();

    // Insert review into database
    await connection.query(
      `INSERT INTO product_reviews 
        (id, product_id, user_id, rating, title, comment, name, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        reviewId,
        productId,
        userId || null,
        Number(rating),
        title || "",
        comment,
        name || "Anonymous",
      ]
    );

    // Get the inserted review
    const [reviews] = await connection.query(
      `SELECT 
        id, product_id as productId, user_id as userId, rating, 
        title, comment, name, 
        created_at as date, updated_at as updatedAt 
      FROM product_reviews 
      WHERE id = ?`,
      [reviewId]
    );

    // Update product rating in sarees table (if applicable)
    const averageRating = await calculateAverageRating(productId, connection);

    // Try to update the product's rating in the sarees table
    try {
      await connection.query(`UPDATE sarees SET rating = ? WHERE id = ?`, [
        averageRating,
        productId,
      ]);
    } catch (err) {
      console.warn(
        `[2025-03-20 19:26:17] laserXnext: Could not update product rating: ${err.message}`
      );
      // Don't fail the whole request if this update fails
    }

    res.status(201).json(reviews[0]);
  } catch (error) {
    console.error(
      "[2025-03-20 19:26:17] laserXnext: Error creating review:",
      error
    );
    res.status(500).json({ error: "Failed to create review" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Update a review
app.put("/api/reviews/:id", async (req, res) => {
  let connection;
  try {
    const { rating, title, comment } = req.body;

    connection = await pool.getConnection();

    // Check if review exists
    const [existingReviews] = await connection.query(
      `SELECT product_id FROM product_reviews WHERE id = ?`,
      [req.params.id]
    );

    if (existingReviews.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    const productId = existingReviews[0].product_id;
    const currentDateTime = "2025-03-20 19:26:17";

    // Update the review
    await connection.query(
      `UPDATE product_reviews SET
        rating = COALESCE(?, rating),
        title = COALESCE(?, title),
        comment = COALESCE(?, comment),
        updated_at = ?
      WHERE id = ?`,
      [
        rating !== undefined ? Number(rating) : null,
        title !== undefined ? title : null,
        comment !== undefined ? comment : null,
        currentDateTime,
        req.params.id,
      ]
    );

    // Get the updated review
    const [reviews] = await connection.query(
      `SELECT 
        id, product_id as productId, user_id as userId, rating, 
        title, comment, name, 
        created_at as date, updated_at as updatedAt 
      FROM product_reviews 
      WHERE id = ?`,
      [req.params.id]
    );

    // Update product rating
    const averageRating = await calculateAverageRating(productId, connection);

    try {
      await connection.query(`UPDATE sarees SET rating = ? WHERE id = ?`, [
        averageRating,
        productId,
      ]);
    } catch (err) {
      console.warn(
        `[2025-03-20 19:26:17] laserXnext: Could not update product rating: ${err.message}`
      );
    }

    res.json(reviews[0]);
  } catch (error) {
    console.error(
      "[2025-03-20 19:26:17] laserXnext: Error updating review:",
      error
    );
    res.status(500).json({ error: "Failed to update review" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Delete a review
app.delete("/api/reviews/:id", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Check if review exists and get product_id
    const [existingReviews] = await connection.query(
      `SELECT product_id FROM product_reviews WHERE id = ?`,
      [req.params.id]
    );

    if (existingReviews.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    const productId = existingReviews[0].product_id;

    // Delete the review
    await connection.query(`DELETE FROM product_reviews WHERE id = ?`, [
      req.params.id,
    ]);

    // Update product rating
    const averageRating = await calculateAverageRating(productId, connection);

    try {
      await connection.query(`UPDATE sarees SET rating = ? WHERE id = ?`, [
        averageRating,
        productId,
      ]);
    } catch (err) {
      console.warn(
        `[2025-03-20 19:26:17] laserXnext: Could not update product rating: ${err.message}`
      );
    }

    res.status(204).end();
  } catch (error) {
    console.error(
      "[2025-03-20 19:26:17] laserXnext: Error deleting review:",
      error
    );
    res.status(500).json({ error: "Failed to delete review" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get average rating for a product
app.get("/api/products/:productId/rating", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const averageRating = await calculateAverageRating(
      req.params.productId,
      connection
    );

    res.json({ averageRating });
  } catch (error) {
    console.error(
      "[2025-03-20 19:26:17] laserXnext: Error calculating rating:",
      error
    );
    res.status(500).json({ error: "Failed to calculate average rating" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

//! Admin Section

// Get all products with optional filtering and sorting
app.get("/api/admin/products", authenticateToken, async (req, res) => {
  const {
    search,
    category,
    stock,
    sort,
    order,
    page = 1,
    limit = 10,
  } = req.query;

  let connection;
  try {
    connection = await pool.getConnection();

    // Build the base query
    let query = "SELECT * FROM sarees WHERE 1=1";
    const params = [];

    // Add search filter
    if (search) {
      query += " AND (name LIKE ? OR id LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    // Add category filter
    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    // Add stock filter
    if (stock === "low") {
      query += " AND stock_quantity < 10 AND stock_quantity > 0";
    } else if (stock === "out") {
      query += " AND stock_quantity = 0";
    }

    // Get total count for pagination
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM (${query}) as filtered_products`,
      params
    );
    const totalItems = countResult[0].total;

    // Add sorting
    if (sort && order) {
      query += ` ORDER BY ${sort} ${order.toUpperCase()}`;
    } else {
      query += " ORDER BY created_date_time DESC";
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    // Execute the query
    const [products] = await connection.query(query, params);

    // Format response
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock_quantity,
      discount_percentage: product.discount_percentage,
      status: product.available ? "Active" : "Draft",
      image_url: product.image_url,
      created_at: product.created_date_time,
    }));

    res.status(200).json({
      products: formattedProducts,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error(
      "[2025-03-24 11:05:16] laserXnext: Error fetching products:",
      error
    );
    res.status(500).json({ error: "Failed to fetch products" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get unique product categories
app.get(
  "/api/admin/products/categories",
  authenticateToken,
  async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();

      // Get unique categories
      const [categories] = await connection.query(
        "SELECT DISTINCT category FROM sarees WHERE category IS NOT NULL"
      );

      res.status(200).json(categories.map((c) => c.category));
    } catch (error) {
      console.error(
        "[2025-03-24 11:05:16] laserXnext: Error fetching categories:",
        error
      );
      res.status(500).json({ error: "Failed to fetch categories" });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

// Update product status (activate/deactivate)
app.put("/api/admin/products/status", authenticateToken, async (req, res) => {
  const { productIds, status } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: "Product IDs are required" });
  }

  if (status !== "Active" && status !== "Draft") {
    return res.status(400).json({ error: "Invalid status" });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Update product status
    await connection.query(
      "UPDATE sarees SET available = ?, updated_date_time = NOW() WHERE id IN (?)",
      [status === "Active" ? 1 : 0, productIds]
    );

    res.status(200).json({ message: "Products updated successfully" });
  } catch (error) {
    console.error(
      "[2025-03-24 11:05:16] laserXnext: Error updating products:",
      error
    );
    res.status(500).json({ error: "Failed to update products" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Delete products
app.delete("/api/admin/products", authenticateToken, async (req, res) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: "Product IDs are required" });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Delete products
    await connection.query("DELETE FROM sarees WHERE id IN (?)", [productIds]);

    res.status(200).json({ message: "Products deleted successfully" });
  } catch (error) {
    console.error(
      "[2025-03-24 11:05:16] laserXnext: Error deleting products:",
      error
    );
    res.status(500).json({ error: "Failed to delete products" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Add new product
app.post("/api/admin/products", authenticateToken, async (req, res) => {
  const {
    name,
    description,
    category,
    material,
    color,
    price,
    stock_quantity,
    discount_percentage,
    image_url,
    available,
  } = req.body;

  // Validate required fields
  if (!name || !price || !category || !stock_quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Current timestamp
    const currentDateTime = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Insert new product
    const [result] = await connection.query(
      `INSERT INTO sarees (
        name, description, category, material, color, 
        price, stock_quantity, discount_percentage, 
        image_url, available, created_date_time, updated_date_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || "",
        category,
        material || null,
        color || null,
        parseFloat(price),
        parseInt(stock_quantity),
        parseFloat(discount_percentage || 0),
        image_url || null,
        available ? 1 : 0,
        currentDateTime,
        currentDateTime,
      ]
    );

    res.status(201).json({
      message: "Product added successfully",
      productId: result.insertId,
    });
  } catch (error) {
    console.error(
      "[2025-03-24 11:36:55] laserXnext: Error adding product:",
      error
    );
    res.status(500).json({ error: "Failed to add product" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get a single product by ID
app.get("/api/sarees/:id", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [products] = await connection.query(
      "SELECT * FROM sarees WHERE id = ?",
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(products[0]);
  } catch (error) {
    console.error(
      "[2025-03-24 11:36:55] laserXnext: Error fetching product:",
      error
    );
    res.status(500).json({ error: "Failed to fetch product" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get active promotions for the product slider
app.get("/api/promotions/featured", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const [promotions] = await connection.query(`
      SELECT 
        p.promotion_id as id,
        p.name,
        p.description,
        COALESCE(s.price, 0) as original_price,
        p.discount_percentage,
        p.image_url as image,
        p.saree_id
      FROM 
        promotions p
      LEFT JOIN
        sarees s ON p.saree_id = s.id
      WHERE 
        p.is_active = 1
        AND p.start_date <= NOW()
        AND p.end_date >= NOW()
      ORDER BY 
        p.discount_percentage DESC
      LIMIT 5
    `);
    
    // Format the prices with currency symbol and calculate discounts
    const formattedPromotions = promotions.map(promo => {
      // Calculate the discounted price if there's a discount
      const originalPrice = promo.original_price || 0;
      let price;
      let hasDiscount = false;
      
      if (promo.discount_percentage > 0 && originalPrice > 0) {
        const discountAmount = (originalPrice * promo.discount_percentage) / 100;
        const discountedPrice = originalPrice - discountAmount;
        
        // Format both prices
        promo.originalPrice = `LKR ${originalPrice.toFixed(2)}`;
        price = `LKR ${discountedPrice.toFixed(2)}`;
        hasDiscount = true;
      } else {
        // Just format the price
        price = `LKR ${originalPrice.toFixed(2)}`;
      }
      
      // Return the formatted promotion
      return {
        id: promo.id,
        name: promo.name,
        description: promo.description,
        originalPrice: promo.originalPrice,
        price: price,
        image: promo.image,
        discount_percentage: promo.discount_percentage,
        hasDiscount: hasDiscount,
        saree_id: promo.saree_id
      };
    });
    
    // Log the promotions being sent
    console.log(`[2025-03-26 08:56:28] laserXnext: Sending ${formattedPromotions.length} featured promotions`);
    
    res.status(200).json({
      message: "Promotions fetched successfully",
      promotions: formattedPromotions
    });
  } catch (error) {
    console.error("[2025-03-26 08:56:28] laserXnext: Error fetching promotions:", error);
    res.status(500).json({
      message: "Failed to fetch promotions",
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get promotion details by ID
app.get("/api/promotions/:id", async (req, res) => {
  const promotionId = req.params.id;
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    const [promotions] = await connection.query(`
      SELECT 
        p.*,
        s.id as saree_id,
        s.name as saree_name,
        s.price as saree_price,
        s.material,
        s.color,
        s.description as saree_description,
        s.image_url as saree_image,
        s.stock_quantity
      FROM 
        promotions p
      LEFT JOIN
        sarees s ON p.saree_id = s.id
      WHERE 
        p.promotion_id = ?
    `, [promotionId]);
    
    if (promotions.length === 0) {
      return res.status(404).json({
        message: "Promotion not found"
      });
    }
    
    const promotion = promotions[0];
    
    // Calculate discounted price if applicable
    if (promotion.discount_percentage > 0 && promotion.saree_price) {
      const discountAmount = (promotion.saree_price * promotion.discount_percentage) / 100;
      promotion.discounted_price = promotion.saree_price - discountAmount;
    }
    
    res.status(200).json({
      message: "Promotion fetched successfully",
      promotion: promotion
    });
  } catch (error) {
    console.error(`[2025-03-26 08:56:28] laserXnext: Error fetching promotion ${promotionId}:`, error);
    res.status(500).json({
      message: "Failed to fetch promotion",
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Update an existing product
app.put("/api/admin/products/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    category,
    material,
    color,
    price,
    stock_quantity,
    discount_percentage,
    image_url,
    available,
  } = req.body;

  // Validate required fields
  if (!name || !price || !category || !stock_quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Check if product exists
    const [products] = await connection.query(
      "SELECT id FROM sarees WHERE id = ?",
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Current timestamp
    const currentDateTime = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Update product
    await connection.query(
      `UPDATE sarees SET
        name = ?,
        description = ?,
        category = ?,
        material = ?,
        color = ?,
        price = ?,
        stock_quantity = ?,
        discount_percentage = ?,
        image_url = ?,
        available = ?,
        updated_date_time = ?
      WHERE id = ?`,
      [
        name,
        description || "",
        category,
        material || null,
        color || null,
        parseFloat(price),
        parseInt(stock_quantity),
        parseFloat(discount_percentage || 0),
        image_url || null,
        available ? 1 : 0,
        currentDateTime,
        id,
      ]
    );

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error(
      "[2025-03-24 11:36:55] laserXnext: Error updating product:",
      error
    );
    res.status(500).json({ error: "Failed to update product" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get all orders with filtering and pagination
app.get("/api/admin/orders", authenticateToken, async (req, res) => {
  const {
    search,
    status,
    dateFilter,
    sort = "order_date",
    order = "desc",
    page = 1,
    limit = 10,
  } = req.query;

  let connection;
  try {
    connection = await pool.getConnection();

    // Build the base query
    let query = `
      SELECT o.*, 
        up.name as customer_name,
        up.email as customer_email,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as items_count
      FROM orders o
      LEFT JOIN user_profiles up ON o.user_id = up.user_id
      WHERE 1=1
    `;

    const params = [];

    // Add search filter
    if (search) {
      query += " AND (o.order_id LIKE ? OR up.name LIKE ? OR up.email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add status filter
    if (status) {
      query += " AND o.status = ?";
      params.push(status);
    }

    // Add date filter
    if (dateFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === "today") {
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        query += " AND o.order_date BETWEEN ? AND ?";
        params.push(today.toISOString(), todayEnd.toISOString());
      } else if (dateFilter === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);

        query += " AND o.order_date BETWEEN ? AND ?";
        params.push(yesterday.toISOString(), yesterdayEnd.toISOString());
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        query += " AND o.order_date >= ?";
        params.push(weekAgo.toISOString());
      } else if (dateFilter === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        query += " AND o.order_date >= ?";
        params.push(monthAgo.toISOString());
      }
    }

    // Get total count for pagination
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM (${query}) as filtered_orders`,
      params
    );
    const totalItems = countResult[0].total;

    // Add sorting
    if (sort && order) {
      // Handle special case for customer sorting
      if (sort === "customer_name") {
        query += ` ORDER BY up.name ${order.toUpperCase()}`;
      } else {
        query += ` ORDER BY o.${sort} ${order.toUpperCase()}`;
      }
    } else {
      query += " ORDER BY o.order_date DESC";
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    // Execute the query
    const [orders] = await connection.query(query, params);

    // Format orders for response
    const formattedOrders = orders.map((order) => ({
      id: order.order_id,
      customer_name: order.customer_name || "Guest User",
      customer_email: order.customer_email || "N/A",
      order_date: order.order_date,
      status: order.status,
      payment_status: order.payment_status || "Pending",
      payment_method: order.payment_method || "Cash on Delivery",
      total_amount: parseFloat(order.total_amount),
      items_count: order.items_count,
    }));

    res.status(200).json({
      orders: formattedOrders,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] laserXnext: Error fetching orders:`,
      error
    );
    res.status(500).json({ error: "Failed to fetch orders" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Update order status
app.put("/api/admin/orders/status", authenticateToken, async (req, res) => {
  const { orderIds, status } = req.body;

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ error: "Order IDs are required" });
  }

  if (
    !status ||
    !["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].includes(
      status
    )
  ) {
    return res.status(400).json({ error: "Invalid status" });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Update orders status
    await connection.query(
      "UPDATE orders SET status = ?, updated_at = NOW() WHERE order_id IN (?)",
      [status, orderIds]
    );

    res.status(200).json({ message: "Orders updated successfully" });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] laserXnext: Error updating orders:`,
      error
    );
    res.status(500).json({ error: "Failed to update orders" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get order details by ID
app.get("/api/admin/orders/:orderId", authenticateToken, async (req, res) => {
  const { orderId } = req.params;

  let connection;
  try {
    connection = await pool.getConnection();

    // Get order details
    const [orders] = await connection.query(
      `SELECT o.*, 
        up.name as customer_name, 
        up.email as customer_email,
        up.phone as customer_phone,
        up.street as shipping_street,
        up.city as shipping_city,
        up.state as shipping_state,
        up.zip_code as shipping_zip,
        up.country as shipping_country
      FROM orders o
      LEFT JOIN user_profiles up ON o.user_id = up.user_id
      WHERE o.order_id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orders[0];

    // Get order items
    const [items] = await connection.query(
      `SELECT 
        item_id, 
        product_id, 
        product_name, 
        price, 
        quantity, 
        image_path,
        price * quantity as subtotal
      FROM order_items 
      WHERE order_id = ?`,
      [orderId]
    );

    // Format the response
    const formattedOrder = {
      id: order.order_id,
      date: order.order_date,
      status: order.status,
      total_amount: parseFloat(order.total_amount),
      customer: {
        id: order.user_id,
        name: order.customer_name || "Guest User",
        email: order.customer_email || "N/A",
        phone: order.customer_phone || "N/A",
      },
      shipping: {
        street: order.shipping_street || "N/A",
        city: order.shipping_city || "N/A",
        state: order.shipping_state || "N/A",
        zip: order.shipping_zip || "N/A",
        country: order.shipping_country || "N/A",
      },
      items: items.map((item) => ({
        id: item.item_id,
        product_id: item.product_id,
        name: item.product_name,
        price: parseFloat(item.price),
        quantity: item.quantity,
        subtotal: parseFloat(item.subtotal),
        image: item.image_path,
      })),
      created_at: order.created_at,
      updated_at: order.updated_at,
    };

    res.status(200).json(formattedOrder);
  } catch (error) {
    console.error(
      `[2025-03-24 13:35:41] laserXnext: Error fetching order details:`,
      error
    );
    res.status(500).json({ error: "Failed to fetch order details" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Update order status by ID
app.put(
  "/api/admin/orders/:orderId/status",
  authenticateToken,
  async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({ error: "Invalid status" });
    }

    let connection;
    try {
      connection = await pool.getConnection();

      // Check if order exists
      const [orders] = await connection.query(
        "SELECT order_id FROM orders WHERE order_id = ?",
        [orderId]
      );

      if (orders.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Update order status
      await connection.query(
        "UPDATE orders SET status = ?, updated_at = NOW() WHERE order_id = ?",
        [status, orderId]
      );

      res.status(200).json({ message: "Order status updated successfully" });
    } catch (error) {
      console.error(
        `[2025-03-24 13:35:41] laserXnext: Error updating order status:`,
        error
      );
      res.status(500).json({ error: "Failed to update order status" });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);



// Get all users with optional filtering, sorting and pagination
app.get("/api/admin/users", authenticateToken, async (req, res) => {
  const {
    search,
    country,
    status,
    sort = "name",
    order = "asc",
    page = 1,
    limit = 10,
  } = req.query;

  let connection;
  try {
    connection = await pool.getConnection();

    // Build the base query
    let query = "SELECT * FROM user_profiles WHERE 1=1";
    const params = [];

    // Add search filter
    if (search) {
      query += " AND (name LIKE ? OR email LIKE ? OR username LIKE ? OR user_id LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add country filter
    if (country) {
      query += " AND country = ?";
      params.push(country);
    }

    // Add status filter (assuming we have a status field or derivation)
    if (status) {
      if (status === 'active') {
        // Consider a user active if they've logged in within the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query += " AND last_login >= ?";
        params.push(thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' '));
      } else if (status === 'inactive') {
        // Consider a user inactive if they haven't logged in within the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query += " AND (last_login < ? OR last_login IS NULL)";
        params.push(thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' '));
      }
    }

    // Get total count for pagination
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM (${query}) as filtered_users`,
      params
    );
    const totalItems = countResult[0].total;

    // Add sorting
    if (sort && order) {
      query += ` ORDER BY ${sort} ${order.toUpperCase()}`;
    } else {
      query += " ORDER BY name ASC";
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    // Execute the query
    const [users] = await connection.query(query, params);

    // Format the response
    const formattedUsers = users.map(user => ({
      user_id: user.user_id,
      name: user.name || 'Unknown',
      username: user.username,
      email: user.email,
      phone: user.phone,
      profile_image_path: user.profile_image_path,
      city: user.city,
      country: user.country,
      date_joined: user.date_joined,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at
    }));

    res.status(200).json({
      users: formattedUsers,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] laserXnext: Error fetching users:`, error);
    res.status(500).json({ error: "Failed to fetch users" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get unique countries for filtering
app.get("/api/admin/users/countries", authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Get unique countries
    const [countries] = await connection.query(
      "SELECT DISTINCT country FROM user_profiles WHERE country IS NOT NULL AND country != ''"
    );

    res.status(200).json(countries.map(c => c.country));
  } catch (error) {
    console.error(`[${new Date().toISOString()}] laserXnext: Error fetching countries:`, error);
    res.status(500).json({ error: "Failed to fetch countries" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Create a new user
app.post("/api/admin/users", authenticateToken, async (req, res) => {
  const {
    name,
    username,
    email,
    phone,
    street,
    city,
    state,
    zip_code,
    country,
    profile_image_path,
    password
  } = req.body;

  // Validate required fields
  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: "Name, username, email, and password are required" });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Begin transaction
    await connection.beginTransaction();

    // Check if username or email already exists
    const [existingUsers] = await connection.query(
      "SELECT * FROM user_profiles WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.username === username) {
        await connection.rollback();
        return res.status(409).json({ error: "Username already exists" });
      }
      if (existingUser.email === email) {
        await connection.rollback();
        return res.status(409).json({ error: "Email already exists" });
      }
    }

    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Generate UUID for user_id
    const user_id = uuidv4();

    // Get current date in MySQL format
    const currentDate = new Date().toISOString().slice(0, 10);
    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert new user
    await connection.query(
      `INSERT INTO user_profiles (
        user_id, name, username, email, phone, 
        profile_image_path, street, city, state, 
        zip_code, country, date_joined, 
        password_hash, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        name,
        username,
        email,
        phone || null,
        profile_image_path || null,
        street || null,
        city || null,
        state || null,
        zip_code || null,
        country || null,
        currentDate,
        password_hash,
        currentDateTime,
        currentDateTime
      ]
    );

    // Commit transaction
    await connection.commit();

    res.status(201).json({ 
      message: "User created successfully",
      user_id: user_id
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error(`[${new Date().toISOString()}] laserXnext: Error creating user:`, error);
    res.status(500).json({ error: "Failed to create user" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Update user details
app.put("/api/admin/users/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const {
    name,
    username,
    email,
    phone,
    street,
    city,
    state,
    zip_code,
    country,
    profile_image_path
  } = req.body;

  // Validate required fields
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Begin transaction
    await connection.beginTransaction();

    // Check if user exists
    const [existingUsers] = await connection.query(
      "SELECT * FROM user_profiles WHERE user_id = ?",
      [userId]
    );

    if (existingUsers.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "User not found" });
    }

    // Check if email or username is already taken by another user
    if (email || username) {
      const query = "SELECT * FROM user_profiles WHERE (email = ? OR username = ?) AND user_id != ?";
      const params = [
        email || '', 
        username || '', 
        userId
      ];

      const [duplicateUsers] = await connection.query(query, params);

      if (duplicateUsers.length > 0) {
        const duplicateUser = duplicateUsers[0];
        if (email && duplicateUser.email === email) {
          await connection.rollback();
          return res.status(409).json({ error: "Email already exists" });
        }
        if (username && duplicateUser.username === username) {
          await connection.rollback();
          return res.status(409).json({ error: "Username already exists" });
        }
      }
    }

    // Current timestamp
    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Update user
    await connection.query(
      `UPDATE user_profiles SET
        name = ?,
        username = COALESCE(?, username),
        email = ?,
        phone = ?,
        profile_image_path = ?,
        street = ?,
        city = ?,
        state = ?,
        zip_code = ?,
        country = ?,
        updated_at = ?
      WHERE user_id = ?`,
      [
        name,
        username,
        email,
        phone || null,
        profile_image_path || null,
        street || null,
        city || null,
        state || null,
        zip_code || null,
        country || null,
        currentDateTime,
        userId
      ]
    );

    // Commit transaction
    await connection.commit();

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error(`[${new Date().toISOString()}] laserXnext: Error updating user:`, error);
    res.status(500).json({ error: "Failed to update user" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Delete users (bulk delete)
app.delete("/api/admin/users", authenticateToken, async (req, res) => {
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "User IDs are required" });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Begin transaction
    await connection.beginTransaction();

    // Delete users
    await connection.query(
      "DELETE FROM user_profiles WHERE user_id IN (?)",
      [userIds]
    );

    // Commit transaction
    await connection.commit();

    res.status(200).json({ message: "Users deleted successfully" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error(`[${new Date().toISOString()}] laserXnext: Error deleting users:`, error);
    res.status(500).json({ error: "Failed to delete users" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Update user status (activate/deactivate)
app.put("/api/admin/users/status", authenticateToken, async (req, res) => {
  const { userIds, status } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "User IDs are required" });
  }

  if (status !== "Active" && status !== "Inactive") {
    return res.status(400).json({ error: "Invalid status" });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Begin transaction
    await connection.beginTransaction();

    try {
      await connection.query(
        `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active'`
      );
    } catch (error) {
      // If the column already exists or can't be added, just continue
      console.warn(`[${new Date().toISOString()}] laserXnext: Could not add status column:`, error.message);
    }

    // Update user status
    await connection.query(
      "UPDATE user_profiles SET status = ?, updated_at = NOW() WHERE user_id IN (?)",
      [status, userIds]
    );

    // Commit transaction
    await connection.commit();

    res.status(200).json({ message: "User status updated successfully" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error(`[${new Date().toISOString()}] laserXnext: Error updating user status:`, error);
    res.status(500).json({ error: "Failed to update user status" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get user statistics for admin dashboard
app.get("/api/admin/users/stats", authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Get total users count
    const [totalUsersResult] = await connection.query(
      "SELECT COUNT(*) as total FROM user_profiles"
    );
    const totalUsers = totalUsersResult[0].total;

    // Get new users this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    const [newUsersResult] = await connection.query(
      "SELECT COUNT(*) as total FROM user_profiles WHERE date_joined >= ?",
      [firstDayOfMonth.toISOString().slice(0, 19).replace('T', ' ')]
    );
    const newUsers = newUsersResult[0].total;

    // Get active users (logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [activeUsersResult] = await connection.query(
      "SELECT COUNT(*) as total FROM user_profiles WHERE last_login >= ?",
      [thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' ')]
    );
    const activeUsers = activeUsersResult[0].total;

    // Get user distribution by country
    const [countryDistribution] = await connection.query(
      `SELECT 
        country, 
        COUNT(*) as count 
      FROM user_profiles 
      WHERE country IS NOT NULL AND country != '' 
      GROUP BY country 
      ORDER BY count DESC 
      LIMIT 5`
    );

    res.status(200).json({
      totalUsers,
      newUsers,
      activeUsers,
      countryDistribution
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] laserXnext: Error fetching user statistics:`, error);
    res.status(500).json({ error: "Failed to fetch user statistics" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get all reviews with filtering, sorting and pagination
app.get("/api/admin/reviews", authenticateToken, async (req, res) => {
  const {
    search,
    product_id,
    rating,
    sort = "created_at",
    order = "desc",
    page = 1,
    limit = 10,
  } = req.query;

  console.log(`[2025-03-25 06:57:16] laserXnext: Fetching reviews with filters:`, req.query);

  let connection;
  try {
    connection = await pool.getConnection();

    // Build the base query
    let query = `
      SELECT 
        pr.id, pr.product_id, pr.user_id, pr.rating, 
        pr.title, pr.comment, pr.name, 
        pr.created_at, pr.updated_at,
        s.name as product_name
      FROM product_reviews pr
      LEFT JOIN sarees s ON pr.product_id = s.id
      WHERE 1=1
    `;
    
    const params = [];

    // Add search filter
    if (search) {
      query += " AND (pr.title LIKE ? OR pr.comment LIKE ? OR pr.name LIKE ? OR s.name LIKE ?)";
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    // Add product_id filter
    if (product_id) {
      query += " AND pr.product_id = ?";
      params.push(product_id);
    }

    // Add rating filter
    if (rating) {
      query += " AND pr.rating = ?";
      params.push(parseInt(rating));
    }

    // Get total count for pagination
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM (${query}) as filtered_reviews`,
      params
    );
    const totalItems = countResult[0].total;

    // Add sorting
    if (sort && order) {
      // Handle special case for product_name sorting
      if (sort === 'product_name') {
        query += ` ORDER BY s.name ${order.toUpperCase()}`;
      } else {
        query += ` ORDER BY pr.${sort} ${order.toUpperCase()}`;
      }
    } else {
      query += " ORDER BY pr.created_at DESC";
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    console.log(`[2025-03-25 06:57:16] laserXnext: Executing query:`, query);

    // Execute the query
    const [reviews] = await connection.query(query, params);

    console.log(`[2025-03-25 06:57:16] laserXnext: Found ${reviews.length} reviews`);

    // Format reviews for response
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      product_id: review.product_id,
      product_name: review.product_name || "Unknown Product",
      user_id: review.user_id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      name: review.name,
      created_at: review.created_at,
      updated_at: review.updated_at
    }));

    res.status(200).json({
      reviews: formattedReviews,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error(`[2025-03-25 06:57:16] laserXnext: Error fetching reviews:`, error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Delete a single review
app.delete("/api/admin/reviews/:reviewId", authenticateToken, async (req, res) => {
  const { reviewId } = req.params;
  
  console.log(`[2025-03-25 06:57:16] laserXnext: Deleting review: ${reviewId}`);

  let connection;
  try {
    connection = await pool.getConnection();

    // Check if review exists and is anonymous
    const [reviews] = await connection.query(
      "SELECT id, name, product_id FROM product_reviews WHERE id = ?",
      [reviewId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    const review = reviews[0];
    
    // Only allow deletion of anonymous reviews
    if (review.name !== 'Anonymous') {
      return res.status(403).json({ error: "Only anonymous reviews can be deleted" });
    }

    // Get the product_id to recalculate average rating later
    const productId = review.product_id;

    // Delete the review
    await connection.query(
      "DELETE FROM product_reviews WHERE id = ?",
      [reviewId]
    );

    // Recalculate average rating for the product
    const [ratingResult] = await connection.query(
      "SELECT AVG(rating) as average FROM product_reviews WHERE product_id = ?",
      [productId]
    );
    
    const newRating = ratingResult[0].average || 0;

    // Update product rating
    try {
      await connection.query(
        "UPDATE sarees SET rating = ? WHERE id = ?",
        [newRating, productId]
      );
    } catch (ratingError) {
      console.error(`[2025-03-25 06:57:16] laserXnext: Error updating product rating: ${ratingError.message}`);
      // Don't fail the entire operation if rating update fails
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(`[2025-03-25 06:57:16] laserXnext: Error deleting review:`, error);
    res.status(500).json({ error: "Failed to delete review" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Bulk delete reviews
app.delete("/api/admin/reviews", authenticateToken, async (req, res) => {
  const { reviewIds } = req.body;

  if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
    return res.status(400).json({ error: "Review IDs are required" });
  }

  console.log(`[2025-03-25 06:57:16] laserXnext: Bulk deleting reviews:`, reviewIds);

  let connection;
  try {
    connection = await pool.getConnection();

    // Begin transaction
    await connection.beginTransaction();

    // Verify all reviews exist and are anonymous
    const [reviews] = await connection.query(
      "SELECT id, name, product_id FROM product_reviews WHERE id IN (?)",
      [reviewIds]
    );

    // Check if all requested reviews exist
    if (reviews.length !== reviewIds.length) {
      await connection.rollback();
      return res.status(404).json({ error: "One or more reviews not found" });
    }

    // Check if all reviews are anonymous
    const nonAnonymousReviews = reviews.filter(review => review.name !== 'Anonymous');
    if (nonAnonymousReviews.length > 0) {
      await connection.rollback();
      return res.status(403).json({ error: "Only anonymous reviews can be deleted" });
    }

    // Collect all affected product IDs for rating recalculation
    const affectedProductIds = [...new Set(reviews.map(review => review.product_id))];

    // Delete the reviews
    await connection.query(
      "DELETE FROM product_reviews WHERE id IN (?)",
      [reviewIds]
    );

    // Recalculate ratings for all affected products
    for (const productId of affectedProductIds) {
      const [ratingResult] = await connection.query(
        "SELECT AVG(rating) as average FROM product_reviews WHERE product_id = ?",
        [productId]
      );
      
      const newRating = ratingResult[0].average || 0;

      // Update product rating
      try {
        await connection.query(
          "UPDATE sarees SET rating = ? WHERE id = ?",
          [newRating, productId]
        );
      } catch (ratingError) {
        console.error(`[2025-03-25 06:57:16] laserXnext: Error updating product rating for ${productId}: ${ratingError.message}`);
        // Don't fail the entire operation if one product rating update fails
      }
    }

    // Commit transaction
    await connection.commit();

    res.status(200).json({ message: `${reviews.length} reviews deleted successfully` });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error(`[2025-03-25 06:57:16] laserXnext: Error bulk deleting reviews:`, error);
    res.status(500).json({ error: "Failed to delete reviews" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Refresh token
app.post("/api/user/refresh-token", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).send("Token is required");
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, SECRET_KEY);

    // Check if user still exists
    const connection = await pool.getConnection();

    try {
      const [users] = await connection.query(
        "SELECT user_id, username FROM user_profiles WHERE user_id = ?",
        [decoded.userId]
      );

      if (users.length === 0) {
        return res.status(404).send("User not found");
      }

      // Generate a new token with a new expiration time
      const newToken = jwt.sign(
        {
          userId: decoded.userId,
          username: decoded.username,
        },
        SECRET_KEY,
        { expiresIn: "1d" }
      );

      res.status(200).json({
        token: newToken,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).send("Token has expired");
    }

    console.error("Error refreshing token:", error);
    res.status(403).send("Invalid token");
  }
});

// Session info endpoint - provides current timestamp and username
app.get("/api/user/session-info", authenticateToken, (req, res) => {
  // Return current session info with provided timestamp and username
  res.status(200).json({
    currentDateTime: "2025-03-18 09:33:52",
    username: req.user.username || "laserXnext",
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).send("Server is running");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

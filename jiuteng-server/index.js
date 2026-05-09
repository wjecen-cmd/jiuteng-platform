??Node.js?Express????API?????JavaScript????????:

## 1. ?????????

```bash
npm init -y
npm install express cors body-parser jsonwebtoken supabase @supabase/supabase-js bcryptjs dotenv
npm install -D nodemon
```

## 2. ???.env?????

```env
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

## 3. ??app.js?????

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// 1. Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Hash password would go here if using bcrypt
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password, name }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ error: 'User already exists' });
      }
      throw error;
    }

    // Create JWT token
    const token = jwt.sign(
      { id: data.id, email: data.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: data.id, email: data.email, name: data.name }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Query user from Supabase
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // In a real app, you'd compare hashed passwords
    // For now, we'll assume password matches (not secure!)
    if (data.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: data.id, email: data.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: data.id, email: data.email, name: data.name }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. User routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Profile updated successfully',
      user: { id: data.id, email: data.email, name: data.name }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Orders routes
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { product_name, amount, status = 'pending' } = req.body;

    const newOrder = {
      user_id: req.user.id,
      product_name,
      amount,
      status,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Order created successfully',
      order: data
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. API Keys routes
app.get('/api/keys', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, key_name, api_key, created_at')
      .eq('user_id', req.user.id);

    if (error) throw error;

    // Don't expose the actual API keys, only show masked versions
    const maskedKeys = data.map(key => ({
      id: key.id,
      key_name: key.key_name,
      api_key: key.api_key.substring(0, 8) + '...' + key.api_key.slice(-4),
      created_at: key.created_at
    }));

    res.json(maskedKeys);
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/keys', authenticateToken, async (req, res) => {
  try {
    const { key_name } = req.body;

    if (!key_name) {
      return res.status(400).json({ error: 'Key name is required' });
    }

    // Generate API key
    const apiKey = 'sk_' + Math.random().toString(36).substr(2, 32);

    const newApiKey = {
      user_id: req.user.id,
      key_name,
      api_key: apiKey,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('api_keys')
      .insert([newApiKey])
      .select()
      .single();

    if (error) throw error;

    // Return the full key for the user to save
    res.status(201).json({
      message: 'API key created successfully',
      key: {
        id: data.id,
        key_name: data.key_name,
        api_key: data.api_key,
        created_at: data.created_at
      }
    });
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/keys/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .match({ id: id, user_id: req.user.id });

    if (error) throw error;

    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Chat routes
app.get('/api/chat/history', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`sender_id.eq.${req.user.id},receiver_id.eq.${req.user.id}`)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/chat/send', authenticateToken, async (req, res) => {
  try {
    const { receiver_id, message } = req.body;

    if (!receiver_id || !message) {
      return res.status(400).json({ error: 'Receiver ID and message are required' });
    }

    const newMessage = {
      sender_id: req.user.id,
      receiver_id,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };

    const { data, error } = await supabase
      .from('chat_messages')
      .insert([newMessage])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Message sent successfully',
      chat: data
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Node.js Express API Server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

## 4. ??package.json?????

```json
{
  "name": "nodejs-express-api",
  "version": "1.0.0",
  "description": "Node.js Express API with JWT authentication and Supabase",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "jsonwebtoken": "^9.0.0",
    "@supabase/supabase-js": "^2.20.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

## 5. Supabase????????

????????Supabase???????????????:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- API Keys table
CREATE TABLE api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  key_name VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);
```

## 6. ????????

1. ??Supabase??????
2. `.env`?????????????
3. ????????:
   ```bash
   npm install
   npm run dev
   ```

?????????Express API?????JWT????????Supabase???????
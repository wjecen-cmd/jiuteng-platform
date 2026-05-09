??Express?????`routes/auth.js`????

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory storage for phone verification codes (in production, use Redis or database)
const verificationCodes = new Map();

// Utility function to generate response format
const sendResponse = (res, code, message, data = null) => {
  res.status(code).json({
    code,
    message,
    data
  });
};

// Generate random verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification code to phone number
router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return sendResponse(res, 400, 'Phone number is required');
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone)) {
      return sendResponse(res, 400, 'Invalid phone number format');
    }

    // Generate verification code
    const code = generateVerificationCode();

    // Store code with expiration time (5 minutes)
    const expirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes
    verificationCodes.set(phone, { code, expiresAt: expirationTime });

    // Simulate sending SMS (in real app, integrate with SMS service like Twilio)
    console.log(`Verification code ${code} sent to phone: ${phone}`);
    
    // In production, uncomment and use actual SMS service
    // await sendSMSToUser(phone, `Your verification code is: ${code}`);

    sendResponse(res, 200, 'Verification code sent successfully');
  } catch (error) {
    console.error('Error sending verification code:', error);
    sendResponse(res, 500, 'Internal server error');
  }
});

// Phone login with verification code
router.post('/login/phone', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return sendResponse(res, 400, 'Phone number and verification code are required');
    }

    // Check if verification code exists
    const storedCode = verificationCodes.get(phone);
    if (!storedCode) {
      return sendResponse(res, 400, 'No verification code found for this phone number');
    }

    // Check if code has expired
    if (Date.now() > storedCode.expiresAt) {
      verificationCodes.delete(phone);
      return sendResponse(res, 400, 'Verification code has expired');
    }

    // Verify the code
    if (storedCode.code !== code) {
      return sendResponse(res, 400, 'Invalid verification code');
    }

    // Create user in Supabase if doesn't exist
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code === 'PGRST116') { // User doesn't exist
      // Create new user
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert([
          { 
            phone: phone,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (createUserError) {
        console.error('Error creating user:', createUserError);
        return sendResponse(res, 500, 'Error creating user account');
      }

      user = newUser;
    } else if (error) {
      console.error('Error fetching user:', error);
      return sendResponse(res, 500, 'Error accessing user account');
    }

    // Remove used verification code
    verificationCodes.delete(phone);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    sendResponse(res, 200, 'Login successful', {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error in phone login:', error);
    sendResponse(res, 500, 'Internal server error');
  }
});

// Traditional email/password login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, 'Email and password are required');
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return sendResponse(res, 401, 'Invalid credentials');
    }

    const user = data.user;

    // Generate custom JWT token (optional - you can also use Supabase's session tokens)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    sendResponse(res, 200, 'Login successful', {
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error in traditional login:', error);
    sendResponse(res, 500, 'Internal server error');
  }
});

module.exports = router;
```

????.env???:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

???????:

1. **POST /send-code**: ????/??????????????????
2. **POST /login/phone**: ?????????????????????JWT
3. **POST /login**: ??????????Supabase Auth
4. **Supabase Integration**: ???Supabase JS Client??
5. **Response Format**: `{code, message, data}`

????: ??production????????????????Redis?????????????????????SMS?????Twilio?Nexmo?
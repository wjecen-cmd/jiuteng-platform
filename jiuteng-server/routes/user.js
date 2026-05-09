?? `routes/user.js` ???? Express ???, ??????????????:

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// ???? JWT ?????
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ???? JWT ?????
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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
}

// 1. GET /info: ?????
router.get('/info', authenticateToken, (req, res) => {
    try {
        // ?????? JWT ?????
        const userInfo = {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            // ???: ?????????
            // balance: req.user.balance // ?? JWT ??????
        };
        
        res.json({
            success: true,
            data: userInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve user info'
        });
    }
});

// 2. PUT /update: ?????
router.put('/update', authenticateToken, (req, res) => {
    try {
        const { username, email, phone } = req.body;
        
        // ?????
        if (!username && !email && !phone) {
            return res.status(400).json({
                success: false,
                error: 'At least one field must be provided for update'
            });
        }

        // ???? (???????)
        // ???: ????????????????
        console.log(`User ${req.user.id} profile updated:`, { username, email, phone });

        res.json({
            success: true,
            message: 'User information updated successfully',
            data: {
                id: req.user.id,
                username: username || req.user.username,
                email: email || req.user.email,
                phone: phone || req.user.phone
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update user information'
        });
    }
});

// 3. GET /balance: ????
router.get('/balance', authenticateToken, (req, res) => {
    try {
        // ?????? (???????)
        // ???: ????????????????
        const balance = Math.random() * 1000; // ???: ??????????
        
        res.json({
            success: true,
            data: {
                userId: req.user.id,
                balance: balance.toFixed(2),
                currency: 'USD'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve balance'
        });
    }
});

// 4. POST /update-balance: ????
router.post('/update-balance', authenticateToken, (req, res) => {
    try {
        const { amount, type } = req.body;

        // ??????
        if (!amount || (type !== 'add' && type !== 'subtract')) {
            return res.status(400).json({
                success: false,
                error: 'Amount and valid type (add/subtract) are required'
            });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be a positive number'
            });
        }

        // ?????? (???????)
        // ???: ????????????????
        let newBalance = Math.random() * 900 + 100; // ???: ??????????

        res.json({
            success: true,
            message: 'Balance updated successfully',
            data: {
                userId: req.user.id,
                transactionType: type,
                transactionAmount: parseFloat(amount),
                newBalance: newBalance.toFixed(2)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update balance'
        });
    }
});

// 5. ?????????
module.exports = router;
```

**?????????**:

1. **JWT ???**: ?? `authenticateToken` ???? JWT ?????????, ???? `Authorization: Bearer <token>` ?????

2. **GET /info**: ??????????? JWT ????, ????????????

3. **PUT /update**: ????????????, ?? `req.body` ??????????

4. **GET /balance**: ???????? (???????)

5. **POST /update-balance**: ????, ?? `type` (`add`/`subtract`) ??????????

6. **???????**: ?? `try-catch` ???????????????, ?? JSON ????????????

**???**:
- ???????? JWT ????, ?? `process.env.JWT_SECRET` ??????
- ??????????????????, ??????????????????
- ???????????????, ????????????????
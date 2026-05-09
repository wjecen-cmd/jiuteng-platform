?? `routes/keys.js` ????Express API ??????JavaScript ????:

const express = require('express');
const router = express.Router();

// ???API????
let apiKeys = [
  { id: '1', key: 'jt_abc123def456', createdAt: new Date() },
  { id: '2', key: 'jt_xyz789uvw012', createdAt: new Date() }
];

// 1. GET / - ?????API????
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: apiKeys.map(key => ({
        id: key.id,
        key: key.key,
        createdAt: key.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '????API????',
      error: error.message
    });
  }
});

// 2. POST / - ??????(??jt_xxx??)
router.post('/', (req, res) => {
  try {
    // ????
    const generateApiKey = () => {
      const prefix = 'jt_';
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = prefix;
      for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const newKey = {
      id: Date.now().toString(),
      key: generateApiKey(),
      createdAt: new Date()
    };

    apiKeys.push(newKey);

    res.status(201).json({
      success: true,
      data: {
        id: newKey.id,
        key: newKey.key,
        createdAt: newKey.createdAt
      },
      message: 'API??????'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'API?????',
      error: error.message
    });
  }
});

// 3. DELETE /:id - ????
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const initialLength = apiKeys.length;
    apiKeys = apiKeys.filter(key => key.id !== id);
    
    if (apiKeys.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'API?????'
      });
    }

    res.json({
      success: true,
      message: 'API?????'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'API?????',
      error: error.message
    });
  }
});

module.exports = router;
```

**??????:**

1. **GET /** - ??API??????
   - ??? id, key, createdAt

2. **POST /** - ?????API??
   - ???'jt_' ???
   - 12????????????
   - ????API????

3. **DELETE /:id** - ????API??
   - ?URL ?????id
   - ?????????

4. **????????**
   - ????JSON ??????
   - ???? try-catch ????
   - ????RESTful API ??
   - ????200, 201, 404, 500 ?????

**???:**
- ???? `jt_` ???
- ????id ????
- ????????????
- ????Express ???
- ????API ???????
- ????CRUD ??????
module.exports = {
  apps: [{
    name: 'jt-web',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3002',
    cwd: 'C:/Users/Administrator/.openclaw/workspace/jiuteng-platform-integrated/web',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
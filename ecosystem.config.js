module.exports = {
  apps: [
    {
      name: 'jiuteng-server',
      cwd: './server',
      script: 'npx',
      args: 'tsx src/index.ts',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000
    },
    {
      name: 'jiuteng-web',
      cwd: './web',
      script: 'npx',
      args: 'next start -p 3002',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000
    }
  ]
};
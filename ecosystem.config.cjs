module.exports = {
  apps: [
    {
      name: 'ia-rimas-brasil',
      script: 'npm',
      args: 'run dev',
      cwd: 'C:/Users/lucas/webapp',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    }
  ]
}

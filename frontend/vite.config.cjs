// NON HTTPS
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react()],
});

/*
const fs = require('fs');
const path = require('path');
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allows access via LAN IP
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './cert/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './cert/cert.pem')),
    },
  },
});*/
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.deskdetox.app',
  appName: 'Desk Detox AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // Qui potrai configurare plugin nativi futuri
  }
};

export default config;
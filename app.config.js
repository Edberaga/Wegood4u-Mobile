import 'dotenv/config';

export default {
  expo: {
    name: "Wegood4u",
    slug: "wegood4u-mobile",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/Wegood4u_Icon.png",
    scheme: "wegood4u",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      versionCode: 2,
      package: "com.saysheji.wegood4u",
      adaptiveIcon: {
        foregroundImage: "./assets/images/Wegood4u_Icon.png",
        backgroundColor: "#8B5CF6"
      }
    },
    web: {
      bundler: "metro",
      output: "single",
      icon: "./assets/images/Wegood4u_Icon.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      "expo-image-picker",
      "expo-location",
      "expo-secure-store",
      "expo-notifications",
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: "b764c837-f472-4d94-89ff-a3800542422c"
      }
    },
    env: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    }
  }
};
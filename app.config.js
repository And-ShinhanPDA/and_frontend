// app.config.js
module.exports = ({ config }) => {
  return {
    ...config,
    name: "AND",
    slug: "and",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      ...config.ios,
      bundleIdentifier: "com.anonymous.AND",
      supportsTablet: true,
      buildNumber: "35",
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSAllowsLocalNetworking: true,
          NSExceptionDomains: {
            "43-203-153-18.nip.io": {
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSExceptionMinimumTLSVersion: "1.0.0",
              NSExceptionRequiresForwardSecrecy: false,
              NSIncludesSubdomains: true
            },
            "43.203.153.18": {
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSExceptionMinimumTLSVersion: "1.0.0",
              NSExceptionRequiresForwardSecrecy: false
            }
          }
        },
        RCTNewArchEnabled: true,
        UILaunchStoryboardName: "SplashScreen",
        UISupportedInterfaceOrientations: [
          "UIInterfaceOrientationPortrait",
          "UIInterfaceOrientationLandscapeLeft",
          "UIInterfaceOrientationLandscapeRight"
        ]
      }
    },
    android: {
      ...config.android,
      package: "com.anonymous.AND",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#ffffff",
          image: "./assets/images/splash.png",
          imageWidth: 200
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    }
  };
};
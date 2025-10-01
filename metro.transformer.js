const upstreamTransformer = require("@expo/metro-config/babel-transformer");
const svgTransformer = require("react-native-svg-transformer");

module.exports.transform = async ({ src, filename, options }) => {
  // Do something custom for SVG files...
  if (filename.endsWith(".svg")) {
    // src = "...";
    console.log(src);
    console.log(filename);
    console.log(options);
    return svgTransformer.transform({ src, filename, options });
  }
  // Pass the source through the upstream Expo transformer.
  return upstreamTransformer.transform({ src, filename, options });
};

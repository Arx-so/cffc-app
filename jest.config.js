/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    // Antes do alias "@/": senão "@/global.css" cairia na regra genérica.
    "\\.(css|scss|sass)$": "<rootDir>/src/test/styleMock.js",
    // O tsconfig mapeia "@/assets/*" para a raiz, não para src/ — precisa vir antes.
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // @ui-kitten e @eva-design publicam JSX/ESM não transpilado; o preset do
  // jest-expo não os inclui, então precisam passar pelo babel.
  transformIgnorePatterns: [
    "/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|@ui-kitten|@eva-design))",
    "/node_modules/react-native-reanimated/plugin/",
  ],
  coverageReporters: ["text-summary", "json-summary", "lcov"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.types.ts",
    "!src/**/*.styles.ts",
    "!src/**/index.ts",
    "!src/locales/**",
    "!src/test/**",
  ],
};

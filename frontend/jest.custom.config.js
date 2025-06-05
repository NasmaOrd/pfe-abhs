module.exports = {
  clearMocks: true,
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  },
  moduleNameMapper: {
    // pour ignorer les imports SCSS
    "\\.(scss|sass|css)$": "identity-obj-proxy"
  },
  reporters: [
    "default",
    ["jest-html-reporter", {
      pageTitle: "Rapport des Tests",
      outputPath: "public/reports/test-report.html",
      includeFailureMsg: true,
      includeConsoleLog: true
    }]
  ],
};

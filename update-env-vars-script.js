const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Get the absolute path to the config.env file in the same directory as the script
const filePath = path.join(__dirname, "config.env");

// Read the content of the file
const fileContent = fs.readFileSync(filePath, "utf-8");

// Process the content to create the desired string
const processedContent = fileContent
  .split("\n") // Split the content into lines
  .filter((line) => !line.trim().startsWith("#")) // Remove lines starting with '#' (comments)
  .map((line) => {
    const [key, value] = line.split("=");
    return `${key.trim()}="${value.trim()}"`;
  })
  .join(" ");

// Function to set environment variables on a Heroku app
const setEnvironmentVariables = (remoteName) => {
  const command = `heroku config:set ${processedContent} --remote ${remoteName}`;
  execSync(command, { stdio: "inherit" });
};

// Specify the remote names corresponding to your Heroku apps
const herokuRemotes = ["heroku-prod", "heroku-dev"]; // Replace with your remote names

// Set environment variables on each specified Heroku app
herokuRemotes.forEach((remoteName) => {
  setEnvironmentVariables(remoteName);
});

const fs = require('fs');
const NODE_ENV = process.env.NODE_ENV || 'dev';

// only dev has secret vars such as passwords

let filePath = "src/config/.env.dev";
if (NODE_ENV === 'ci') {
  filePath = "src/config/.env.ci";
}
if (NODE_ENV === 'prod') {
  filePath = "src/config/.env.prod";
}
if (NODE_ENV === 'staging') {
  filePath = "src/config/.env.staging";
}
const envFile = fs.readFileSync(filePath).toString();

const envFileLines = envFile.split("\n")
for (let line of envFileLines) {
    let [key, value] = line.split("=");
    process.env[key] = value
}
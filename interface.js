import fetch from "node-fetch";
import { exec } from "child_process";
import fs from "fs/promises";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv)).argv;

const apiUrl = argv._[0];
let outputFileName = argv.output || "output.ts"; // Default output file name is 'output.ts'

if (!apiUrl) {
  console.error("Please provide an API URL as the first argument.");
  process.exit(1);
}

if (!outputFileName.endsWith(".ts")) {
  outputFileName += ".ts";
}

async function fetchData() {
  try {
    // Fetch data from the API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Convert the JSON data to a string
    const jsonString = JSON.stringify(data);

    // Write the JSON data to a temporary file
    await fs.writeFile("temp.json", jsonString);

    // Generate TypeScript interfaces using Quicktype
    const { error, stdout, stderr } = await new Promise((resolve) => {
      exec(
        `quicktype temp.json --lang ts -o ${outputFileName}`,
        (error, stdout, stderr) => {
          resolve({ error, stdout, stderr });
        }
      );
    });

    if (error) {
      console.error("Error generating interfaces:", error);
    } else {
      console.log(`Generated interfaces and saved to ${outputFileName}`);
    }

    // Clean up the temporary file
    await fs.unlink("temp.json");
  } catch (error) {
    console.error("Error fetching or processing data:", error);
  }
}

fetchData();

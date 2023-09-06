import fs from "fs/promises";
import { exec } from "child_process";

const filePath = "./output.ts"; // Replace with the path to your TypeScript file
const interfacesRegex =
  /export\s+interface\s+(\w+)[\s\S]*?(?=\bexport\s+interface|\n\n|$)/g;
const interfaces = [];

(async () => {
  try {
    const fileContents = await fs.readFile(filePath, "utf-8");
    let match;

    while ((match = interfacesRegex.exec(fileContents)) !== null) {
      interfaces.push(match[0]);
    }

    if (interfaces.length === 0) {
      console.error("No export interfaces found in the file.");
      process.exit(1);
    }

    const selectedInterface = await selectInterface(interfaces);

    if (selectedInterface) {
      copyInterface(selectedInterface);
    } else {
      console.log("No interface selected.");
    }
  } catch (error) {
    console.error("Error reading the file:", error);
    process.exit(1);
  }
})();

async function selectInterface(interfaces) {
  return new Promise((resolve) => {
    const options = interfaces.join("\n\n");
    const rofi = exec(
      `rofi -dmenu -mesg "Select an interface to copy:" -format i`,
      (error, stdout) => {
        if (error) {
          console.error("Rofi error:", error);
          process.exit(1);
        }
        const selectedIndex = parseInt(stdout.trim());
        if (
          isNaN(selectedIndex) ||
          selectedIndex < 0 ||
          selectedIndex >= interfaces.length
        ) {
          resolve(null);
        } else {
          resolve(interfaces[selectedIndex]);
        }
      }
    );

    rofi.stdin.write(options);
    rofi.stdin.end();
  });
}

function copyInterface(interfaceText) {
  exec(`echo "${interfaceText}" | xclip -selection clipboard`);
  console.log(`Interface copied to clipboard.`);
  process.exit(0);
}

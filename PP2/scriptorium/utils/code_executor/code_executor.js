import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";  // We'll use this to run docker commands

// Change in codeExecutor
export function codeExecutor(
    sourceCode,
    language,
    userInput = "",
    outputHandler
) {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir(); // Temporary directory for the source code
    const tempFile = createTempFile(language, sourceCode);
    const fullPath = path.join(tempDir, tempFile);

    const { uid, gid } = os.userInfo();
    console.log(`User ID: ${uid}, Group ID: ${gid}`);

    console.log("Full path: ", fullPath);

    // Write source code to a temporary file
    fs.writeFileSync(fullPath, sourceCode);

    // Map the language to Docker commands
    const dockerDetails = mapLanguageToDocker(language, fullPath);

    try {
      // Prepare the Docker run command
      const dockerRunCommand = [
        "docker", "run", "--rm", "-i", // -i for interactive mode
        "--user", `${uid}:${gid}`,
        "-v", `${fullPath}:/usr/src/app/${tempFile}`, // Mount the code file inside the container
        dockerDetails.image, // Docker image name
        "/bin/sh", "-c", dockerDetails.runCmd // Command to run inside the container
      ];

      const dockerProcess = spawn(dockerRunCommand[0], dockerRunCommand.slice(1), {
        stdio: ["pipe", "pipe", "pipe"], // Pipes for real-time output
      });

      if (userInput) {
        // If there's user input, write it to stdin
        dockerProcess.stdin.write(userInput);
      }
      dockerProcess.stdin.end();

      let outputData = "";

      // Capture the real-time output
      dockerProcess.stdout.on("data", (data) => {
        const output = data.toString();
        if (outputHandler) {
          outputHandler(output);
        } else {
          outputData += output;
        }
      });

      dockerProcess.stderr.on("data", (data) => {
        const output = data.toString();
        if (outputHandler) {
          outputHandler(output);
        } else {
          outputData += output;
        }
      });

      dockerProcess.on("close", (exitCode) => {
        // Clean up after the container finishes execution
        if (exitCode === 0) {
          resolve(outputData.trim());
        } else {
          reject(`Execution failed with code ${exitCode}: ${outputData.trim()}`);
        }
      });
    } catch (error) {
      reject(`Error: ${error.message}`);
    }
  });
}

// Mapping languages to Docker images and commands
export function mapLanguageToDocker(language, filePath) {
  const dockerMap = {
    Python: {
      image: "python_executor", // Docker image for Python
      runCmd: "python3 /usr/src/app/temp.py", // Command to run inside the container
    },
    Java: {
      image: "java_executor", // Docker image for Java
      runCmd: "java /usr/src/app/Main", // Command to run inside the container
    },
    // Add more languages as necessary
  };

  if (!dockerMap[language]) {
    throw new Error("Unsupported language");
  }

  return dockerMap[language];
}

export function createTempFile(language, sourceCode) {
  const extensions = {
    C: "c",
    "C++": "cpp",
    Java: "java",
    Python: "py",
    JavaScript: "js",
  };

  if (!extensions[language]) {
    throw new Error("Unsupported language");
  }

  return `temp.${extensions[language]}`;
}

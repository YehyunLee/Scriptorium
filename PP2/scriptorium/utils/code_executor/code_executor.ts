import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";  // We'll use this to run docker commands
import { SUPPORTED_LANGUAGES } from "@/constants/languages";

// Change in codeExecutor
export function codeExecutor(
    sourceCode: string,
    language: string,
    userInput = "",
    outputHandler: (data: string) => void
) {
  return new Promise((resolve, reject) => {

    // Convert name language to id language
    // Language might be given as either name or id
    // We want to ensure that it's always the id
    if (typeof language === "string") {
      const languageObj = SUPPORTED_LANGUAGES.find(
        (lang) => lang.name === language
      );
      if (languageObj) {
        language = languageObj.id;
      }
    }

    const tempDir = os.tmpdir(); // Temporary directory for the source code
    const tempFile = createTempFile(language, sourceCode);
    const fullPath = path.join(tempDir, tempFile);

    const { uid, gid } = os.userInfo();
    console.log(`User ID: ${uid}, Group ID: ${gid}`);

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
    } catch (error: any) {
      reject(`Error: ${error.message}`);
    }
  });
}

// Mapping languages to Docker images and commands
export function mapLanguageToDocker(language: string, filePath: string) {
  const dockerMap = {
    python: {
      image: "python_executor", // Docker image for Python
      runCmd: "python3 /usr/src/app/temp.py", // Command to run inside the container
    },
    java: {
      image: "java_executor",
      runCmd: "javac /usr/src/app/temp.java && java -cp /usr/src/app Main",
    },
    javascript: {
      image: "javascript_executor",
      runCmd: "node /usr/src/app/temp.js",
    },
    cpp: {
      image: "cpp_executor",
      runCmd: "sh -c 'g++ -o temp.out /usr/src/app/temp.cpp && ./temp.out'",
    },
    c: {
      image: "c_executor",
      runCmd: "sh -c 'gcc -o temp.out /usr/src/app/temp.c && ./temp.out'",
    },
    ruby: {
      image: "ruby_executor",
      runCmd: "ruby /usr/src/app/temp.rb",
    },
    csharp: {
      image: "csharp_executor",
      runCmd: "dotnet-script /usr/src/app/temp.cs",
    },
    php: {
      image: "php_executor",
      runCmd: "php /usr/src/app/temp.php",
    },
    go: {
      image: "go_executor",
      runCmd: "go run /usr/src/app/temp.go",
    },
    swift: {
      image: "swift_executor",
      runCmd: "swift /usr/src/app/temp.swift",
    },
    assembly: {
      image: "assembly_executor",
      runCmd: "sh -c 'nasm -f elf64 /usr/src/app/temp.asm && ld -o temp /usr/src/app/temp.o && ./temp'",
    },
  } as Record<string, { image: string; runCmd: string }>;

  if (!dockerMap[language]) {
    throw new Error("Unsupported language");
  }

  return dockerMap[language];
}

export function createTempFile(language: string, sourceCode: string) {
  const extensions = {
    c: "c",
    cpp: "cpp",
    java: "java",
    python: "py",
    javascript: "js",
    ruby: "rb",
    csharp: "cs",
    php: "php",
    go: "go",
    swift: "swift",
    assembly: "asm",
  } as Record<string, string>;

  if (!extensions[language]) {
    throw new Error("Unsupported language");
  }

  return `temp.${extensions[language]}`;
}

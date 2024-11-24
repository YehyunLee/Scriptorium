import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

// Rosalie and Yehyun worked together on this file
// Rosalie did major ground work. Building top of Rosalie's code, Yehyun supported Java, C, and C++ languages, and bug fixes.
// Yehyun used Github Copilot autocomplete feature to help with the code, and knowledge from CSC209 course.

// 1. Temporary file creation and cleanup
// What it does is that it creates a temporary file with the source code in the specified language, and returns the file name.

// 2. We then map the language to the command that will be used to compile and execute the code.

// 3. We compile
// 4. Then we execute the code

// We also support stdin input for the code execution.
export function codeExecuter(
  sourceCode,
  language,
  userInput = "",
  outputHandler
) {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir(); // Example: \AppData\Local\Temp
    const tempFile = createTempFile(language, sourceCode); // Example: temp.py
    const fullPath = path.join(tempDir, tempFile); // Example: \AppData\Local\Temp\temp.py

    fs.writeFileSync(fullPath, sourceCode); // Write the source code to the temporary file

    const execDetails = mapLanguageToCommand(language, fullPath, sourceCode);

    try {
      if (execDetails.compile) {
        // If the language requires compilation, we compile the code first.
        const compileProcess = spawn(
          execDetails.compile.cmd,
          execDetails.compile.args,
          {
            cwd: tempDir,
            shell: true,
          }
        );

        let compileError = "";

        compileProcess.stderr.on("data", (data) => {
          compileError += data.toString();
        });

        compileProcess.on("close", (compileExitCode) => {
          if (compileExitCode !== 0) {
            fs.unlinkSync(fullPath);
            reject(`Compilation failed: ${compileError}`);
          } else {
            executeCode(execDetails.execute);
          }
        });
      } else {
        // If the language does not require compilation, we directly execute the code.
        executeCode(execDetails.execute);
      }

      function executeCode(executeCommand) {
        // We execute the code and handle the output.

        // We spawn a new process to execute the code.
        const childProcess = spawn(executeCommand.cmd, executeCommand.args, {
          cwd: tempDir,
          shell: true,
        });

        // Timeout feature for the user story in the handout
        const timeout = setTimeout(() => {
          childProcess.kill();
          reject("Process timed out");
        }, 5000);

        if (userInput) {
          // If there is user input, we write it to the stdin of the child process.
          childProcess.stdin.write(userInput);
        }
        childProcess.stdin.end();

        let outputData = "";
        // We handle the output of the child process.
        childProcess.stdout.on("data", (data) => {
          const output = data.toString();
          if (outputHandler) {
            outputHandler(output);
          } else {
            outputData += output;
          }
        });

        childProcess.stderr.on("data", (data) => {
          const output = data.toString();
          if (outputHandler) {
            outputHandler(output);
          } else {
            outputData += output;
          }
        });

        childProcess.on("close", (exitCode) => {
          clearTimeout(timeout); // Clear the timeout if the process completes before the timeout.
          fs.unlinkSync(fullPath); // This deletes the temporary file after execution.
          cleanupCompiledFiles(language, sourceCode, tempDir); // We clean up the compiled files after execution.

          // Q. fs.unlinkSync(fullPath) vs cleanupCompiledFiles(language, sourceCode, tempDir)
          // A. fs.unlink removes the file from the file system, while cleanupCompiledFiles removes the compiled files after execution.
          if (exitCode === 0) {
            if (outputHandler) {
              resolve("Success!");
            } else {
            resolve(outputData.trim());
            }
          } else {
            reject(
              `Execution failed with code ${exitCode}: ${outputData.trim()}`
            );
          }
        });
      }
    } catch (error) {
      fs.unlinkSync(fullPath);
      reject(`Error: ${error.message}`);
    }
  });
}

export function createTempFile(language, sourceCode) {
  // We create a temporary file with the source code in the specified language.
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

  if (language === "Java") {
    const className = getClassName(sourceCode);
    return `${className}.${extensions[language]}`;
  } else {
    return `temp.${extensions[language]}`;
  }
}

export function mapLanguageToCommand(language, filePath, sourceCode) {
  // We map the language to the command that will be used to compile and execute the code.
  const commandMap = {
    C: {
      compile: { cmd: "gcc", args: [filePath, "-o", "a.out"] },
      execute: { cmd: "./a.out", args: [] },
    },
    "C++": {
      compile: { cmd: "g++", args: [filePath, "-o", "a.out"] },
      execute: { cmd: "./a.out", args: [] },
    },
    Java: {
      compile: { cmd: "javac", args: [filePath] },
      execute: { cmd: "java", args: [getClassName(sourceCode)] },
    },
    Python: {
      execute: { cmd: "python3", args: [filePath] },
    },
    JavaScript: {
      execute: { cmd: "node", args: [filePath] },
    },
  };

  if (!commandMap[language]) {
    throw new Error("Unsupported language");
  }

  return commandMap[language];
}

function getClassName(sourceCode) {
  // This function extracts the class name from the Java source code.
  const match = sourceCode.match(/public\s+class\s+(\w+)/);
  if (match) {
    return match[1];
  }
  return "Main";
}

function cleanupCompiledFiles(language, sourceCode, tempDir) {
  // This function cleans up the compiled files after execution.
  // AKA, it deletes the temporary files created during the compilation and execution process.
  if (language === "Java") {
    const className = getClassName(sourceCode);
    const classFile = path.join(tempDir, `${className}.class`);
    if (fs.existsSync(classFile)) {
      fs.unlinkSync(classFile);
    }
  }
  if (language === "C" || language === "C++") {
    const executable = path.join(tempDir, "a.out");
    if (fs.existsSync(executable)) {
      fs.unlinkSync(executable);
    }
  }
}

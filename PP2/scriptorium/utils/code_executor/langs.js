export function mapLanguageToCommand(language) {
    const languages = {
        python: {
            dockerCommand: "docker run --rm -v /workspace:/workspace docker_python_executor python3 /workspace/temp.py",
            extension: "py"
        },
        java: {
            dockerCommand: "docker run --rm -v /workspace:/workspace docker_java_executor java /workspace/temp.java",
            extension: "java"
        },
        cpp: {
            dockerCommand: "docker run --rm -v /workspace:/workspace docker_cpp_executor g++ /workspace/temp.cpp -o /workspace/temp && /workspace/temp",
            extension: "cpp"
        },
        javascript: {
            dockerCommand: "docker run --rm -v /workspace:/workspace docker_js_executor node /workspace/temp.js",
            extension: "js"
        },
        // Add more languages if needed
    };

    if (!languages[language]) {
        throw new Error(`Unsupported language: ${language}`);
    }

    return languages[language];
}

import { exec } from "child_process";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join,dirname } from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const runCodeInDocker = async (language, code, testCases) => {
  const uniqueId = uuidv4();
  const folderPath = join(__dirname, "..", "temp", uniqueId);
  mkdirSync(folderPath, { recursive: true });

  const fileExtension = language === "python" ? "py" : "java";
  const fileName = `Main.${fileExtension}`;
  const filePath = join(folderPath, fileName);
  writeFileSync(filePath, code);

  const dockerImage = language === "python" ? "custom-python" : "custom-java";
  const results = [];

  for (const testCase of testCases) {
    const inputFilePath = join(folderPath, "input.txt");
    writeFileSync(inputFilePath, testCase.input);
    const dockerCmd =
      language === "python"
        ? `docker run --rm --memory=128m --cpus="0.5" -v "${folderPath}:/code" ${dockerImage} sh -c "timeout 10s python /code/Main.py < /code/input.txt"`
        : `docker run --rm --memory=512m --cpus="0.5" -v "${folderPath}:/code" ${dockerImage} sh -c "javac /code/Main.java && timeout 5s java -cp /code Main < /code/input.txt"`;

    try {
      const output = await new Promise((resolve) => {
        exec(dockerCmd, { timeout: 10000 }, (error, stdout, stderr) => {
          resolve(error ? `Error: ${stderr.trim() || error.message}` : stdout.trim());
        });
      });

      results.push({
        input: testCase.input,
        expectedOutput: testCase.expected_output,
        actualOutput: output,
        passed: output === testCase.expected_output,
      });
    } catch (error) {
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expected_output,
        actualOutput: `Error: ${error.message}`,
        passed: false,
      });
    }
  }

  rmSync(folderPath, { recursive: true, force: true });
  return results;
};

export default runCodeInDocker;

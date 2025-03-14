import { query, connect } from "../db/db.js";
import runCodeInDocker from "../utils/runCodeInDocker.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { hashPassword, generateToken, comparePassword } from "../utils/auth.js";

const resolvers = {
  Query: {
    problem: async (_, { id }) => {
      const problemResult = await query("SELECT * FROM problems WHERE id = $1", [id]);
      const problem = problemResult.rows[0];

      if (!problem) {
        throw new Error("Problem not found");
      }

      const testCasesResult = await query(
        "SELECT input, expected_output FROM test_cases WHERE problem_id = $1",
        [id]
      );
      problem.testCases = testCasesResult.rows;
      return problem;
    },
    submissions: async (_, { problemId }, { token }) => {
      const user = await authMiddleware(token);
      if (!user) throw new Error("Unauthorized");
      const { rows } = await query(
        "SELECT id, language, code, status, created_at FROM submissions WHERE problem_id = $1 AND user_id = $2 ORDER BY created_at DESC",
        [problemId, user.userId]
      );
      return rows.map(submission => ({
        ...submission,
        createdAt: submission.created_at.toISOString(), 
      }));
    },
    
    problems: async () => {
      const { rows } = await query("SELECT * FROM problems ORDER BY id");
      return rows;
    },
    myProblems: async (_, __, { token }) => {
      const user = await authMiddleware(token);
      if (!user) throw new Error("Unauthorized");

      const { rows } = await query(
        "SELECT * FROM problems WHERE author_id = $1 ORDER BY id",
        [user.userId]
      );
      return rows;
    },
    
  },
  Mutation: {
    addProblem: async (_, input, { token }) => {
      const user = await authMiddleware(token);
      if (!user) throw new Error("Unauthorized");
       console.log(input);
      const {
        title,
        description,
        constraints,
        examples,
        solutionCode,
        solutionLanguage,
        testCases,
        difficulty,
      } = input;
      const client = await connect();

      try {
        await client.query("BEGIN");
        const problemResult = await client.query(
          `INSERT INTO problems (title, description, problem_constraints, examples, solution_code, solution_language, author_id, difficulty) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
          [
            title,
            description,
            constraints,
            examples,
            solutionCode,
            solutionLanguage,
            user.userId,
            difficulty,
          ]
        );
        const problemId = problemResult.rows[0].id;
        const testCaseQueries = testCases.map((tc) =>
          client.query(
            `INSERT INTO test_cases (problem_id, input, expected_output) VALUES ($1, $2, $3)`,
            [problemId, tc.input, tc.expected_output]
          )
        );
        await Promise.all(testCaseQueries);
        await client.query("COMMIT");
        return {
          id: problemId,
          title,
          description,
          constraints,
          examples,
          solutionCode,
          solutionLanguage,
          difficulty,
        };
      } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error inserting problem:", error);
        throw new Error("Failed to add problem");
      } finally {
        client.release();
      }
    },
    updateProblem: async (_, problem) => {
      try {
       const { id, title, description, examples, constraints, difficulty, solutionCode, solutionLanguage, testCases }=problem;
       console.log(problem)
        await query(
          `UPDATE problems SET title=$1, description=$2, examples=$3, problem_constraints=$4, difficulty=$5, solution_code=$6, solution_language=$7 WHERE id=$8`,
          [title, description, examples, constraints, difficulty, solutionCode, solutionLanguage, id]
        );

       console.log("done")
        await query(`DELETE FROM test_cases WHERE problem_id=$1`, [id]);
        for (const testCase of testCases) {
          await query(
            `INSERT INTO test_cases (problem_id, input, expected_output) VALUES ($1, $2, $3)`,
            [id, testCase.input, testCase.expected_output]
          );
        }

  
        const updatedProblem = await query(`SELECT * FROM problems WHERE id=$1`, [id]);
        const updatedTestCases = await query(`SELECT * FROM test_cases WHERE problem_id=$1`, [id]);

        return {
          ...updatedProblem.rows[0],
          testCases: updatedTestCases.rows,
        };
      } catch (error) {
        console.log(error);
        throw new Error('Failed to update problem',error);
      }
    },

    signup: async (_, account) => {
      const { name, email, password } = account;
      const { rows } = await query("SELECT * FROM users WHERE email=$1", [email]);
      if (rows.length !== 0) {
        throw new Error("Email already exists");
      }
      const hashedPassword = await hashPassword(password);
      const newUser = await query(
        "INSERT INTO users(name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
        [name, email, hashedPassword]
      );
      const token = generateToken(newUser.rows[0].id);

      return {
        token,
        user: newUser.rows[0],
      };
    },

    signin: async (_, account) => {
      const { email, password } = account;
      const { rows } = await query("SELECT * FROM users WHERE email=$1", [email]);
      if (rows.length === 0) {
        throw new Error("Invalid user or password");
      }
      const isValidPassword = await comparePassword(password, rows[0].password);
      if (!isValidPassword) {
        throw new Error("Invalid user or password");
      }
      const token = generateToken(rows[0].id);
      return {
        token,
        user: {
          id: rows[0].id,
          name: rows[0].name,
          email: rows[0].email,
        },
      };
    },

    runCode: async (_, { problemId, language, code }, { token }) => {
      const user = await authMiddleware(token);
      if (!user) throw new Error("Unauthorized");
      try {
        const { rows: testCases } = await query(
          "SELECT input, expected_output FROM test_cases WHERE problem_id = $1",
          [problemId]
        );

        if (testCases.length === 0)
          throw new Error("No test cases found for this problem.");
        return await runCodeInDocker(language, code, testCases);
      } catch (error) {
        console.error(`Server Error: ${error.message}`);
        return [
          { input: "", expectedOutput: "", actualOutput: "Server Error", passed: false },
        ];
      }
    },
    submitCode: async (_, { problemId, language, code }, { token }) => {
      const user = await authMiddleware(token);
      if (!user) throw new Error("Unauthorized");
      try {
        const { rows: testCases } = await query(
          "SELECT input, expected_output FROM test_cases WHERE problem_id = $1 AND is_public = false",
          [problemId]
        );
        console.log(testCases)
        let allPassed = true;
        for (const { input, expected_output } of testCases) {
          const actualOutput = await runCodeInDocker(language, code, input);
          if (actualOutput.trim() !== expected_output.trim()) {
            allPassed = false;
            break;
          }
        }
        console.log(allPassed);
        if (!allPassed) {
          return { id: null, status: "Failed" };
        }
        const result = await query(
          "INSERT INTO submissions (user_id, problem_id, language, code, status) VALUES ($1, $2, $3, $4, 'Accepted') RETURNING *",
          [user.userId, problemId, language, code]
        );
        return result.rows[0];
      } catch (error) {
        console.error("Error in submitCode:", error);
        throw new Error("Submission failed due to an internal server error.");
      }
    },
     deleteProblem: async (_, { id }, { token }) => {
      const user = await authMiddleware(token);
      if (!user) throw new Error("Unauthorized");

      const client = await connect();
      try {
        await client.query("BEGIN");

        const problemResult = await client.query(
          "SELECT * FROM problems WHERE id = $1 AND author_id = $2",
          [id, user.userId]
        );

        if (problemResult.rows.length === 0) {
          throw new Error("Problem not found or you don't have permission to delete it.");
        }

        await client.query("DELETE FROM test_cases WHERE problem_id = $1", [id]);
        await client.query("DELETE FROM problems WHERE id = $1", [id]);

        await client.query("COMMIT");

        return { success: true, message: "Problem deleted successfully" };
      } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error deleting problem:", error);
        return { success: false, message: "Failed to delete problem" };
      } finally {
        client.release();
      }
    },
  },
};

export default resolvers;

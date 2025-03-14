import { gql } from "apollo-server";

const typeDefs = gql`
 type User
  {
      id:ID!
      name:String!
      email:String!
  }
  type Auth {
        token: String!
        user: User!
    }
  type Query {
    problem(id: ID!): Problem
    problems: [Problem]
    myProblems: [Problem!]!
    submissions(problemId: Int!):[Submission!]!
  }

  type TestCase {
    input: String!
    expected_output: String!
  }

  type Problem {
    id: Int!
    title: String!
    description: String!
    problem_constraints: String!
    examples: String!
    solution_code: String!  
    solution_language: String!
    author_id: Int!
    difficulty: String!
    testCases: [TestCase!]!
  }
  type TestCaseResult {
    input: String!
    expectedOutput: String!
    actualOutput: String!
    passed: Boolean!
  }

  input TestCaseInput {
    input: String!
    expected_output: String!
  }
  type DeleteResponse {
    success: Boolean!
    message: String!
  }
  type Submission {
  id: ID!
  user: User!
  problem: Problem!
  language: String!
  code: String!
  status: String!
  createdAt: String!
}




  type Mutation {
    signup(name:String!,email:String!,password:String!):Auth
    signin(email:String!,password:String!):Auth
    runCode(problemId: Int!, language: String!, code: String!): [TestCaseResult]
    addProblem(
      title: String!,
      description: String!,
      constraints: String!,
      examples: String!,
      solutionCode: String!,
      difficulty:String!,
      solutionLanguage: String!,
      testCases: [TestCaseInput!]!
    ): Problem
    updateProblem(
      id: ID!
      title: String!
      description: String!
      examples: String!
      constraints: String!
      difficulty: String!
      solutionCode: String!
      solutionLanguage: String!
      testCases: [TestCaseInput!]!
    ): Problem
    deleteProblem(id: ID!): DeleteResponse!
    submitCode(problemId: Int!, language: String!, code: String!): Submission
   
  }
`;

export default typeDefs;

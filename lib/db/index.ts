// Quiz, QuizResult, QuizAnswer queries
export {
  // Quiz
  getQuizByToken,
  getQuizForStart,
  getQuizForAnswer,
  getQuizForSubmit,
  getQuizForEvaluation,
  getQuizById,
  getQuizWithOwnership,
  getQuizByCandidate,
  insertQuiz,
  updateQuizCompleted,
  updateQuizCandidateStatus,
  // QuizResult
  insertQuizResult,
  getQuizResultByQuizId,
  updateQuizResultSubmitted,
  updateQuizResultEvaluated,
  // QuizAnswer
  upsertQuizAnswer,
} from "./quiz.queries";

// JobRole queries
export {
  getJobRoleById,
  getJobRoleWithStats,
  getQuizzesByRole,
  getJobRolesWithQuizzes,
  getJobRolesPaginated,
  getDashboardStats,
  insertJobRole,
  type QuizFilters,
  type RoleFilters,
} from "./job-role.queries";

// Recruiter queries
export { getRecruiterByUserId, insertRecruiter } from "./recruiter.queries";

// User queries
export { getUserWithRecruiter } from "./user.queries";

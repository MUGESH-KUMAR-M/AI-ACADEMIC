const BASE_URL = "http://127.0.0.1:8000/api/v1";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  full_name: string;
  role: "faculty" | "student" | "admin" | "hod";
  institution_id: string;
  department: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  institution_id: string;
  department: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Redirect to /login and wipe stored tokens (safe to call from anywhere). */
function redirectToLogin() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("aa_access_token");
  localStorage.removeItem("aa_refresh_token");
  window.location.replace("/login");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { headers: optHeaders, ...rest } = options;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(optHeaders ?? {}),
    },
    ...rest,
  });

  if (!res.ok) {
    // ── Auth failures → clear session and go to login ──────────────────────
    if (res.status === 401 || res.status === 403) {
      redirectToLogin();
      throw new Error("Session expired. Please log in again.");
    }

    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      const detail = data?.detail;

      if (typeof detail === "string") {
        msg = detail;
        // FastAPI auth dependency sometimes surfaces 422 for bad/missing token
        if (
          res.status === 422 &&
          (detail.toLowerCase().includes("credential") ||
            detail.toLowerCase().includes("authoriz") ||
            detail.toLowerCase().includes("token"))
        ) {
          redirectToLogin();
        }
      } else if (Array.isArray(detail)) {
        // FastAPI validation error array — check if it's an auth field error
        const isAuthError = detail.some(
          (e: { loc?: string[] }) =>
            e.loc?.includes("authorization") || e.loc?.includes("header")
        );
        if (res.status === 422 && isAuthError) {
          redirectToLogin();
          throw new Error("Session expired. Please log in again.");
        }
        // Surface the first human-readable message
        msg = detail.map((e: { msg?: string }) => e.msg ?? "").filter(Boolean).join("; ") || msg;
      } else if (detail && typeof detail === "object") {
        msg =
          (detail as Record<string, unknown>).message as string ??
          JSON.stringify(detail);
      } else if (typeof data?.message === "string") {
        msg = data.message;
      }
    } catch (parseErr) {
      // keep default msg if body isn't JSON
      if (parseErr instanceof Error && parseErr.message !== msg) {
        // ignore parse errors
      }
    }
    throw new Error(msg);
  }

  // 204 No Content
  if (res.status === 204) return {} as T;
  return res.json();
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ─── Auth Endpoints ───────────────────────────────────────────────────────────

/** POST /auth/register */
export const register = (payload: RegisterPayload): Promise<UserProfile> =>
  request("/auth/register", { method: "POST", body: JSON.stringify(payload) });

/** POST /auth/login */
export const login = (payload: LoginPayload): Promise<AuthResponse> =>
  request("/auth/login", { method: "POST", body: JSON.stringify(payload) });

/** POST /auth/refresh */
export const refreshTokens = (
  refresh_token: string
): Promise<AuthResponse> =>
  request("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token }),
  });

/** POST /auth/logout */
export const logout = (access_token: string): Promise<{ message: string }> =>
  request("/auth/logout", {
    method: "POST",
    headers: authHeaders(access_token),
    body: "",
  });

/** GET /auth/me */
export const getMe = (access_token: string): Promise<UserProfile> =>
  request("/auth/me", {
    method: "GET",
    headers: authHeaders(access_token),
  });

/** POST /auth/change-password */
export const changePassword = (
  access_token: string,
  payload: ChangePasswordPayload
): Promise<{ message: string }> =>
  request("/auth/change-password", {
    method: "POST",
    headers: authHeaders(access_token),
    body: JSON.stringify(payload),
  });

// ─── Course Types ─────────────────────────────────────────────────────────────

export type CourseStatus = "draft" | "generating" | "completed" | "failed" | "published";

export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  program: string;
  department: string;
  semester: number;
  credits: number;
  academic_year: string;
  status: CourseStatus;
  workflow_id: string | null;
  generation_progress: number;
  error_message: string | null;
  syllabus_pdf_url: string | null;
  presentation_urls: string[] | null;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  // Embedded generation data (present on GET /courses/{id})
  curriculum_data?: ResultCurriculum;
  semester_plan_data?: ResultSemesterPlan;
  assessment_data?: ResultAssessments;
  obe_data?: Record<string, unknown>;
  analytics_data?: CourseAnalyticsData;
}

export interface CourseAnalyticsData {
  difficulty_analysis?: {
    overall_difficulty: string;
    difficulty_score: number;
    challenging_topics: string[];
    prerequisite_gaps_risk: string;
  };
  student_performance_prediction?: {
    expected_pass_rate: number;
    expected_distinction_rate: number;
    at_risk_factors: string[];
    success_factors: string[];
  };
  teaching_effectiveness_indicators?: {
    clo_attainability_score: number;
    assessment_alignment_score: number;
    bloom_coverage_score: number;
    overall_quality_score: number;
  };
  recommendations?: {
    for_faculty: string[];
    for_students: string[];
    for_curriculum: string[];
  };
  benchmarking?: {
    similar_courses_avg_pass_rate: number;
    industry_alignment_score: number;
    research_relevance_score: number;
  };
  intervention_strategies?: Array<{
    trigger: string;
    action: string;
    expected_impact: string;
  }>;
}

export interface CreateCoursePayload {
  title: string;
  code: string;
  description: string;
  program: string;
  department: string;
  semester: number;
  credits: number;
  academic_year: string;
  tags: string[];
  is_public: boolean;
}

export interface UpdateCoursePayload {
  title?: string;
  description?: string;
  department?: string;
  is_public?: boolean;
  tags?: string[];
  program?: string;
  semester?: number;
  credits?: number;
  academic_year?: string;
}

export interface CoursesResponse {
  items: Course[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CourseFilters {
  page?: number;
  page_size?: number;
  search?: string;
  program?: string;
  department?: string;
  status?: CourseStatus;
  semester?: number;
}

// ─── Course Endpoints ─────────────────────────────────────────────────────────

/** POST /courses/ */
export const createCourse = (
  token: string,
  payload: CreateCoursePayload
): Promise<Course> =>
  request("/courses/", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

/** GET /courses/{id} */
export const getCourse = (token: string, id: string): Promise<Course> =>
  request(`/courses/${id}`, {
    method: "GET",
    headers: authHeaders(token),
  });

/** GET /courses/ */
export const listCourses = (
  token: string,
  filters: CourseFilters = {}
): Promise<CoursesResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) params.set(k, String(v));
  });
  const qs = params.toString();
  return request(`/courses${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: authHeaders(token),
  });
};

/** PATCH /courses/{id} */
export const updateCourse = (
  token: string,
  id: string,
  payload: UpdateCoursePayload
): Promise<Course> =>
  request(`/courses/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

/** DELETE /courses/{id} */
export const deleteCourse = (token: string, id: string): Promise<void> =>
  request(`/courses/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

/** GET /courses/{id}/assessments */
export const getCourseAssessments = (
  token: string,
  courseId: string
): Promise<CourseAssessmentsResponse> =>
  request(`/courses/${courseId}/assessments`, {
    method: "GET",
    headers: authHeaders(token),
  });

/** GET /courses/{id}/question-bank?bloom_level=Full */
export const getCourseQuestionBank = (
  token: string,
  courseId: string,
  bloomLevel?: string
): Promise<QuestionBankResponse> => {
  const qs = bloomLevel ? `?bloom_level=${encodeURIComponent(bloomLevel)}` : "";
  return request(`/courses/${courseId}/question-bank${qs}`, {
    method: "GET",
    headers: authHeaders(token),
  });
};

// ─── Generation Types ─────────────────────────────────────────────────────────

export type GenerationMode = "full" | "curriculum" | "semester" | "assessments" | "obe" | "analytics";

export type RegenerateComponent =
  | "curriculum"
  | "semester"
  | "assessments"
  | "obe"
  | "analytics";

export type AgentRunStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface AgentStatus {
  agent_name: string;
  status: AgentRunStatus;
  updated_at: string;
}

// ─── Agent Registry Types ─────────────────────────────────────────────────────

export interface AgentInfo {
  name: string;
  id: string;
  description: string;
}

export interface AgentsResponse {
  agents: AgentInfo[];
}

/** GET /agents/ — list all registered agents (requires auth) */
export const getAgents = (token: string): Promise<AgentsResponse> =>
  request("/agents/", {
    method: "GET",
    headers: authHeaders(token),
  });

export interface GeneratePayload {
  course_id: string;
  mode: GenerationMode;
  additional_context?: string;
  reference_docs?: string[];
  force_regenerate?: boolean;
}

export interface GenerateResponse {
  workflow_id: string;
  course_id: string;
  status: string;
  message: string;
  started_at: string;
}

export interface GenerationStatus {
  workflow_id: string;
  course_id: string;
  status: string;
  progress: number;
  agents: AgentStatus[];
  started_at: string;
  error: string | null;
}

// ── Result sub-types ──────────────────────────────────────────────────────────

export interface CLO {
  id: string;
  statement: string;
  bloom_level: string;
  po_mapping: string[];
}

export interface CourseModule {
  module_number: number;
  title: string;
  topics: string[];
  hours: number;
  clo_mapping: string[];
}

export interface CourseBook {
  title: string;
  author: string;
  publisher: string;
  edition?: string;
  year: string;
}

export interface BloomAnalysis {
  distribution: Record<string, number>;
  higher_order_count: number;
  total: number;
  hot_ratio: number;
  is_adequate: boolean;
  recommendation: string;
}

export interface ResultCurriculum {
  course_objectives: string[];
  course_learning_outcomes: CLO[];
  modules: CourseModule[];
  textbooks: CourseBook[];
  references: CourseBook[];
  prerequisites: string[];
  assessment_weightage: { internal_assessment: number; end_semester_exam: number };
  co_attainment_methods: string[];
  bloom_analysis: BloomAnalysis;
}

export interface WeekAssessment {
  type: string;
  topics_covered: string[];
}

export interface WeekPlan {
  week: number;
  module: string;
  topics: string[];
  clos_addressed: string[];
  teaching_methods: string[];
  activities: string[];
  assessment: WeekAssessment | null;
}

export interface ResultSemesterPlan {
  semester_overview: { total_weeks: number; total_hours: number; teaching_hours_per_week: number };
  weeks: WeekPlan[];
  mid_semester_break: number;
  assessment_schedule: { week: number; type: string; topics_covered: string[] }[];
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options?: string[];
  answer?: string;
  model_answer?: string;
  bloom_level: string;
  clo: string;
}

export interface AssessmentSection {
  section: string;
  type: string;
  marks_per_question: number;
  questions: AssessmentQuestion[];
}

export interface SingleAssessment {
  assessment_title: string;
  type: string;
  total_marks: number;
  duration_minutes: number;
  instructions: string;
  sections: AssessmentSection[];
}

export interface ResultAssessments {
  assessments: SingleAssessment[];
  question_bank?: { total_questions: number; by_bloom_level: Record<string, number> };
  bloom_coverage?: Record<string, number>;
}

/** Response from GET /courses/{id}/assessments
 *  The `assessments` field is a nested ResultAssessments wrapper object.
 */
export interface CourseAssessmentsResponse {
  course_id: string;
  /** Nested object — real list is at assessments.assessments[] */
  assessments: ResultAssessments;
}

/**
 * Response from GET /courses/{id}/question-bank
 * Two shapes depending on whether bloom_level filter is present:
 *   No filter  → { course_id, question_bank: { total_questions, by_bloom_level } }
 *   Filtered   → { bloom_level, questions[] }
 */
export interface QuestionBankResponse {
  // No-filter shape
  course_id?: string;
  question_bank?: { total_questions: number; by_bloom_level: Record<string, number> };
  // Filtered shape
  bloom_level?: string;
  questions?: AssessmentQuestion[];
}

export interface GenerationResult {
  workflow_id: string;
  course_id: string;
  success: boolean;
  generated_components: string[];
  curriculum?: ResultCurriculum;
  semester_plan?: ResultSemesterPlan;
  assessments?: ResultAssessments;
  obe_report?: ObeReport | Record<string, unknown>;
  analytics?: CourseAnalyticsData;
  file_urls?: { syllabus_pdf: string | null; presentations: string[] };
  duration_seconds?: number;
  errors?: string[];
}

// ─── OBE Report Types ─────────────────────────────────────────────────────────

export interface CourseOutcome {
  id: string;             // "CO1", "CO2" …
  statement: string;
  bloom_level: string;
  po_mapping: string[];   // ["PO1", "PO3"]
  pso_mapping?: string[];
}

export interface ProgramOutcome {
  id: string;             // "PO1" … "PO12"
  statement: string;
}

/** Correlation strength: 1 = Low · 2 = Medium · 3 = High · 0 = No mapping */
export type CorrelationLevel = 0 | 1 | 2 | 3;

export interface AttainmentResult {
  co: string;
  direct_attainment: number;   // 0-100
  indirect_attainment: number; // 0-100
  overall_attainment: number;  // 0-100
  target_attainment?: number;
  attainment_met?: boolean;
}

export interface ObeReport {
  /** CO → PO correlation levels (1 Low · 2 Medium · 3 High) */
  co_po_mapping?: Record<string, Record<string, number>>;
  /** CO → PSO correlation levels */
  co_pso_mapping?: Record<string, Record<string, number>>;
  /** Justification text keyed by "CLO1-PO1" etc. */
  mapping_justification?: Record<string, string>;
  /** Per-CO attainment target and measurement method */
  co_attainment_targets?: Record<string, { target: number; method: string }>;
  /** Per-PO contribution from COs */
  po_attainment_contribution?: Record<string, { contributing_cos: string[]; average_level: number }>;
  /** Assessment name → list of CLOs it evaluates */
  assessment_co_mapping?: Record<string, string[]>;
  recommendations?: string[];
  nba_compliance_notes?: string;
  compliance_score?: number;
  bloom_analysis?: {
    distribution: Record<string, number>;
    higher_order_count: number;
    total: number;
    hot_ratio: number;
    is_adequate: boolean;
    recommendation: string;
  };
  // legacy fields kept for backward compat
  course_outcomes?: CourseOutcome[];
  program_outcomes?: ProgramOutcome[];
  co_po_matrix?: Record<string, Record<string, CorrelationLevel>>;
  co_pso_matrix?: Record<string, Record<string, CorrelationLevel>>;
  pso_list?: ProgramOutcome[];
  attainment_levels?: AttainmentResult[];
  bloom_distribution?: Record<string, number>;
  summary?: {
    total_cos?: number;
    total_pos?: number;
    average_attainment?: number;
    nba_compliance?: boolean;
    program?: string;
    department?: string;
  };
  [key: string]: unknown;
}

export interface ObeReportResponse {
  course_id: string;
  obe_report: ObeReport;
}

export interface RegenerateResponse {
  workflow_id: string;
  component: string;
  status: string;
}

// ─── Generation Endpoints ─────────────────────────────────────────────────────

/** POST /courses/{id}/generate */
export const generateCourse = (
  token: string,
  courseId: string,
  payload: GeneratePayload
): Promise<GenerateResponse> =>
  request(`/courses/${courseId}/generate`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

/** GET /courses/{id}/status */
export const getCourseGenerationStatus = (
  token: string,
  courseId: string
): Promise<GenerationStatus> =>
  request(`/courses/${courseId}/status`, {
    method: "GET",
    headers: authHeaders(token),
  });

/** GET /courses/{id}/result */
export const getCourseResult = (
  token: string,
  courseId: string
): Promise<GenerationResult> =>
  request(`/courses/${courseId}/result`, {
    method: "GET",
    headers: authHeaders(token),
  });

/** GET /courses/{id}/obe-report */
export const getObeReport = (
  token: string,
  courseId: string
): Promise<ObeReportResponse> =>
  request(`/courses/${courseId}/obe-report`, {
    method: "GET",
    headers: authHeaders(token),
  });

/** POST /courses/{id}/regenerate/{component} */
export const regenerateComponent = (
  token: string,
  courseId: string,
  component: RegenerateComponent
): Promise<RegenerateResponse> =>
  request(`/courses/${courseId}/regenerate/${component}`, {
    method: "POST",
    headers: authHeaders(token),
    body: "",
  });

// ─── Question Paper Types ─────────────────────────────────────────────────────

export interface ExamTypePart {
  label: string;
  type: string;
  num_questions: number;
  marks_each: number;
  choose?: number;
  either_or?: boolean;
}

export interface ExamTypeConfig {
  duration_minutes: number | null;
  total_marks: number | null;
  modules_covered: string | null;
  instructions: string | null;
  parts: ExamTypePart[];
}

export interface ExamTypesResponse {
  exam_types: Record<string, ExamTypeConfig>;
}

export interface QuestionPaperPayload {
  course_id: string;
  exam_type: string;
  department: string;
  institution_name: string;
  academic_year: string;
  subject_code: string;
  modules_covered: string;
  duration_minutes: number;
  total_marks: number;
  instructions: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  additional_context?: string;
  /** Sent as query-param ?include_answer_hints=true — NOT in the request body */
  export_format?: "pdf" | "docx";
}

// ─── Question Paper Endpoints ─────────────────────────────────────────────────

/** GET /question-papers/exam-types */
export const getExamTypes = (): Promise<ExamTypesResponse> =>
  request("/question-papers/exam-types", { method: "GET" });

/** POST /question-papers/generate → PDF blob */
export const generateQuestionPaper = (
  token: string,
  payload: QuestionPaperPayload,
  includeAnswerHints = false
): Promise<{ blob: Blob; filename: string }> =>
  downloadBlob(
    `/question-papers/generate${includeAnswerHints ? "?include_answer_hints=true" : ""}`,
    "POST",
    token,
    JSON.stringify(payload)
  );

// ─── Export helpers ───────────────────────────────────────────────────────────

async function downloadBlob(
  path: string,
  method: "GET" | "POST",
  token: string,
  body?: string
): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "*/*",
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body } : method === "POST" ? { body: "" } : {}),
  });

  if (!res.ok) {
    let msg = `Export failed (${res.status})`;
    try {
      const j = await res.json();
      if (j?.detail?.message) msg = j.detail.message;
      else if (typeof j?.detail === "string") msg = j.detail;
    } catch {}
    throw new Error(msg);
  }

  const blob = await res.blob();
  const cd = res.headers.get("content-disposition") ?? "";
  const match = cd.match(/filename="?([^";\n]+)"?/);
  const filename = match?.[1] ?? "download";
  return { blob, filename };
}

/** GET /courses/{id}/export/syllabus → PDF */
export const exportSyllabus = (token: string, courseId: string) =>
  downloadBlob(`/courses/${courseId}/export/syllabus`, "GET", token);

/** GET /courses/{id}/export/question-paper/{index} → PDF */
export const exportQuestionPaper = (token: string, courseId: string, index: number) =>
  downloadBlob(`/courses/${courseId}/export/question-paper/${index}`, "GET", token);

/** GET /courses/{id}/export/obe-report → PDF */
export const exportObeReport = (token: string, courseId: string) =>
  downloadBlob(`/courses/${courseId}/export/obe-report`, "GET", token);

/** POST /courses/{id}/export/bundle → ZIP */
export const exportBundle = (token: string, courseId: string) =>
  downloadBlob(`/courses/${courseId}/export/bundle`, "POST", token);

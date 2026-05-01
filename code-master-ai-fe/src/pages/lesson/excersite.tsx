// import { useState, useEffect, useRef } from "react";
// import Editor from "@monaco-editor/react";
// import { useParams, useNavigate } from "react-router-dom";

// // 🚨 ĐÃ THÊM: Import axiosInstance để tự động lo vụ Cookie
// import { axiosInstance } from "../../utils/axios"; 

// // =============================================
// // TYPES
// // =============================================
// interface SubmissionResult {
//   message: string;
//   submission: {
//     _id: string;
//     user_id: string;
//     assignment_id: string;
//     language: string;
//     code: string;
//     status: string;
//     score: number;
//     ai_hint: string | null;
//   };
//   passedCases: number;
//   totalCases: number;
//   compileError: string | null;
// }

// interface ExerciseData {
//   _id: string;
//   title: string;
//   difficulty: "Dễ" | "Trung bình" | "Khó";
//   description: string;
//   requirements: string[];
//   examples: { input: string; output: string }[];
//   note?: string;
//   default_code?: Record<string, string>;
// }

// // =============================================
// // LANGUAGE CONFIG
// // =============================================
// const LANGUAGES = [
//   { value: "javascript", label: "JavaScript", monaco: "javascript" },
//   { value: "typescript", label: "TypeScript", monaco: "typescript" },
//   { value: "python", label: "Python", monaco: "python" },
//   { value: "java", label: "Java", monaco: "java" },
//   { value: "cpp", label: "C++", monaco: "cpp" },
// ];

// const DEFAULT_CODES: Record<string, string> = {
//   javascript: `import React from 'react';\n\nfunction Greeting({ name = 'Khách' }) {\n  return (\n    <h1>Xin chào, {name}!</h1>\n  );\n}\n\nexport default Greeting;`,
//   typescript: `import React from 'react';\n\ninterface Props {\n  name?: string;\n}\n\nconst Greeting: React.FC<Props> = ({ name = 'Khách' }) => {\n  return <h1>Xin chào, {name}!</h1>;\n};\n\nexport default Greeting;`,
//   python: `def greeting(name="Khách"):\n    return f"Xin chào, {name}!"\n\nif __name__ == "__main__":\n    print(greeting("An"))`,
//   java: `public class Solution {\n    public static String greeting(String name) {\n        if (name == null || name.isEmpty()) name = "Khách";\n        return "Xin chào, " + name + "!";\n    }\n}`,
//   cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n\nstring greeting(string name = "Khách") {\n    return "Xin chào, " + name + "!";\n}\n\nint main() {\n    cout << greeting("An") << endl;\n    return 0;\n}`,
// };

// // =============================================
// // DIFFICULTY BADGE CONFIG
// // =============================================
// const DIFFICULTY_STYLE: Record<string, string> = {
//   "Dễ": "bg-emerald-900/60 text-emerald-400 border border-emerald-700/50",
//   "Trung bình": "bg-yellow-900/60 text-yellow-400 border border-yellow-700/50",
//   "Khó": "bg-red-900/60 text-red-400 border border-red-700/50",
// };

// const STATUS_STYLE: Record<string, string> = {
//   ACCEPTED: "bg-emerald-900/60 text-emerald-400 border border-emerald-700/50",
//   COMPILATION_ERROR: "bg-yellow-900/60 text-yellow-400 border border-yellow-700/50",
//   WRONG_ANSWER: "bg-red-900/60 text-red-400 border border-red-700/50",
//   TIME_LIMIT_EXCEEDED: "bg-orange-900/60 text-orange-400 border border-orange-700/50",
//   RUNTIME_ERROR: "bg-red-900/60 text-red-400 border border-red-700/50",
// };

// // =============================================
// // MAIN COMPONENT
// // =============================================
// export default function ExercisePage() {
//   const { assignmentId } = useParams<{ assignmentId: string }>();
//   const navigate = useNavigate();

//   const [exercise, setExercise] = useState<ExerciseData | null>(null);
//   const [loadingExercise, setLoadingExercise] = useState(true);

//   const [language, setLanguage] = useState("javascript");
//   const [code, setCode] = useState(DEFAULT_CODES.javascript);

//   const [activeTab, setActiveTab] = useState<"console" | "result">("console");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [consoleOutput, setConsoleOutput] = useState('Nhấn "Nộp bài" để chạy và chấm bài...');
//   const [result, setResult] = useState<SubmissionResult | null>(null);
//   const [isSuccess, setIsSuccess] = useState(false);

//   const editorRef = useRef<any>(null);

//   // =============================================
//   // FETCH ĐỀ BÀI 
//   // =============================================
//   useEffect(() => {
//     if (!assignmentId) return;

//     const fetchExercise = async () => {
//       try {
//         const res = await axiosInstance.get(`/code-assignments/65e000000000000000000001`);

//         const data: ExerciseData = res.data;
//         setExercise(data);

//         if (data.default_code?.[language]) {
//           setCode(data.default_code[language]);
//         }
//       } catch (error) {
//         console.error("Lỗi lấy đề bài:", error);
//       } finally {
//         setLoadingExercise(false);
//       }
//     };

//     fetchExercise();
//   }, [assignmentId]);

// //   useEffect(() => {
// //     if (exercise?.default_code?.[language]) {
// //       setCode(exercise.default_code[language]);
// //     } else {
// //       setCode(DEFAULT_CODES[language] || "// Nhập code của bạn tại đây");
// //     }
// //   }, [language]);

//   // =============================================
//   // HANDLERS
//   // =============================================
//   const handleEditorDidMount = (editor: any) => {
//     editorRef.current = editor;
//   };

//   const handleReset = () => {
//     if (exercise?.default_code?.[language]) {
//       setCode(exercise.default_code[language]);
//     } else {
//       setCode(DEFAULT_CODES[language] || "");
//     }
//   };

//   const handleSubmit = async () => {
//     const sourceCode = code.trim();
//     if (!sourceCode) {
//       setConsoleOutput("Vui lòng nhập code trước khi nộp bài.");
//       setActiveTab("console");
//       return;
//     }

//     setIsSubmitting(true);
//     setIsSuccess(false);
//     setResult(null);
//     setActiveTab("console");

//     const ts = new Date().toLocaleTimeString();
//     setConsoleOutput(`[${ts}] Đang biên dịch và chạy test cases...`);

//     try {
//      const testAssignmentId = "65e000000000000000000001";
//       const res = await axiosInstance.post('/submissions/submit', {
//         assignmentId:testAssignmentId,
//         language,
//         sourceCode,
//       });

//       const data: SubmissionResult = res.data;
//       const ts2 = new Date().toLocaleTimeString();

//       if (data.compileError) {
//         setConsoleOutput(`[${ts2}] Biên dịch thất bại.\n\nLỗi biên dịch:\n${data.compileError}`);
//       } else {
//         setConsoleOutput(`[${ts2}] Biên dịch thành công.\n✓ Passed ${data.passedCases}/${data.totalCases} test cases.`);
//       }

//       setResult(data);
//       setActiveTab("result");

//       if (data.submission?.status === "ACCEPTED") {
//         setIsSuccess(true);
//       }
//     } catch (err: any) {
//       // Axios trả về lỗi trong err.response
//       if (err.response?.status === 401) {
//         // Interceptor thường tự xử lý vụ đá về login, nhưng ta cứ in ra đây cho chắc
//         setConsoleOutput("Phiên đăng nhập hết hạn. Hệ thống đang chuyển hướng...");
//       } else {
//         setConsoleOutput(
//           `Lỗi từ server: ${err.response?.data?.message || err.message}`
//         );
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const pct = result && result.totalCases > 0
//       ? Math.round((result.passedCases / result.totalCases) * 100)
//       : 0;

//   const title = exercise?.title ?? "Xây dựng Component Greeting";
//   const difficulty = exercise?.difficulty ?? "Dễ";

//   // =============================================
//   // RENDER (Phần giao diện giữ nguyên 100%)
//   // =============================================
//   return (
//     <div className="flex h-screen bg-[#0d1117] text-sm overflow-hidden select-none">
//       {/* ===== LEFT PANEL: ĐỀ BÀI ===== */}
//       <div className="w-[38%] min-w-[300px] border-r border-gray-800 flex flex-col overflow-hidden">
//         <div className="px-4 py-3 border-b border-gray-800 bg-[#161b22] flex items-start gap-2 flex-shrink-0">
//           <div className="flex-1 min-w-0">
//             <h1 className="text-sm font-semibold text-white leading-snug">{title}</h1>
//             <div className="flex items-center gap-2 mt-1.5">
//               <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_STYLE[difficulty]}`}>
//                 {difficulty}
//               </span>
//               <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-900/60 text-blue-400 border border-blue-700/50">
//                 Daily
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d1117]">
//           {loadingExercise ? (
//             <div className="space-y-2">
//               {[80, 60, 90, 50].map((w, i) => (
//                 <div key={i} className={`h-3 bg-gray-800 rounded animate-pulse`} style={{ width: `${w}%` }} />
//               ))}
//             </div>
//           ) : (
//             <>
//               <p className="text-gray-400 text-xs leading-relaxed">
//                 {exercise?.description ?? `Trong bài tập này, bạn sẽ tạo một functional component đơn giản có tên là `}
//                 {!exercise?.description && (
//                   <>
//                     <code className="bg-gray-800 px-1 py-0.5 rounded text-emerald-400 font-mono">Greeting</code>
//                     {". Component này nhận prop "}
//                     <code className="bg-gray-800 px-1 py-0.5 rounded text-emerald-400 font-mono">name</code>
//                     {" và hiển thị lời chào tương ứng."}
//                   </>
//                 )}
//               </p>

//               <div>
//                 <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Yêu cầu</h3>
//                 <ul className="space-y-1.5">
//                   {(exercise?.requirements ?? [
//                     "Component phải được đặt tên là Greeting",
//                     "Sử dụng cấu trúc Functional Component của React",
//                     'Hiển thị "Xin chào, [name]!" bên trong thẻ h1',
//                     'Nếu không có prop name, mặc định hiển thị "Khách"',
//                   ]).map((req, i) => (
//                     <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
//                       <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
//                       <span>{req}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <div>
//                 <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Ví dụ</h3>
//                 <div className="space-y-2">
//                   {(exercise?.examples ?? [
//                     { input: '<Greeting name="An" />', output: "<h1>Xin chào, An!</h1>" },
//                     { input: "<Greeting />", output: "<h1>Xin chào, Khách!</h1>" },
//                   ]).map((ex, i) => (
//                     <div key={i} className="bg-[#161b22] border border-gray-800 rounded-lg p-3 font-mono text-xs space-y-1">
//                       <div className="text-blue-400">{ex.input}</div>
//                       <div className="text-gray-500">→ {ex.output}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {(exercise?.note || true) && (
//                 <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg p-3">
//                   <p className="text-xs text-yellow-500/80">
//                     {exercise?.note ?? "Phải sử dụng cú pháp JSX hợp lệ. Không được dùng class component."}
//                   </p>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* ===== RIGHT PANEL: EDITOR + OUTPUT ===== */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800 bg-[#161b22] flex-shrink-0">
//           <select
//             value={language}
//             onChange={(e) => setLanguage(e.target.value)}
//             className="text-xs px-2.5 py-1.5 rounded-md border border-gray-700 bg-[#0d1117] text-gray-300 cursor-pointer focus:outline-none focus:border-gray-500 hover:border-gray-600 transition-colors"
//           >
//             {LANGUAGES.map((l) => (
//               <option key={l.value} value={l.value}>{l.label}</option>
//             ))}
//           </select>
//           <div className="flex-1" />
//           <button
//             onClick={handleReset}
//             className="text-xs px-3 py-1.5 rounded-md border border-gray-700 bg-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
//           >
//             Đặt lại
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={isSubmitting}
//             className="text-xs px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center gap-1.5 min-w-[90px] justify-center"
//           >
//             {isSubmitting ? (
//               <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang chấm...</>
//             ) : ("Nộp bài")}
//           </button>
//         </div>

//         <div className="flex-1 min-h-0">
//           <Editor
//             height="100%"
//             language={LANGUAGES.find((l) => l.value === language)?.monaco ?? "javascript"}
//             value={code}
//             onChange={(val) => setCode(val || "")}
//             onMount={handleEditorDidMount}
//             theme="vs-dark"
//             options={{
//               fontSize: 13,
//               fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
//               fontLigatures: true,
//               minimap: { enabled: false },
//               scrollBeyondLastLine: false,
//               lineNumbers: "on",
//               lineNumbersMinChars: 3,
//               renderLineHighlight: "line",
//               padding: { top: 14, bottom: 14 },
//               automaticLayout: true,
//               tabSize: 2,
//               wordWrap: "on",
//               smoothScrolling: true,
//               cursorBlinking: "smooth",
//               cursorSmoothCaretAnimation: "on",
//               formatOnPaste: true,
//               bracketPairColorization: { enabled: true },
//               suggest: { showKeywords: true },
//               quickSuggestions: true,
//             }}
//           />
//         </div>

//         <div className="h-52 border-t border-gray-800 flex flex-col flex-shrink-0 bg-[#0d1117]">
//           <div className="flex bg-[#161b22] border-b border-gray-800 flex-shrink-0">
//             {(["console", "result"] as const).map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`text-xs px-4 py-2.5 border-b-2 transition-colors font-medium ${
//                   activeTab === tab ? "border-emerald-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"
//                 }`}
//               >
//                 {tab === "console" ? "Console output" : "Kết quả"}
//                 {tab === "result" && result && (
//                   <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
//                     result.submission?.status === "ACCEPTED" ? "bg-emerald-900/60 text-emerald-400" : "bg-red-900/60 text-red-400"
//                   }`}>
//                     {result.submission?.status === "ACCEPTED" ? "AC" : "WA"}
//                   </span>
//                 )}
//               </button>
//             ))}
//           </div>

//           {activeTab === "console" && (
//             <div className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
//               <span className={
//                 consoleOutput.includes("Lỗi") || consoleOutput.includes("thất bại")
//                   ? "text-red-400"
//                   : consoleOutput.includes("thành công") || consoleOutput.includes("Passed")
//                   ? "text-emerald-400"
//                   : consoleOutput.includes("Đang")
//                   ? "text-blue-400"
//                   : "text-gray-500"
//               }>
//                 {consoleOutput}
//               </span>
//             </div>
//           )}

//           {activeTab === "result" && (
//             <div className="flex-1 overflow-y-auto p-3 text-xs">
//               {!result ? (
//                 <span className="text-gray-600">Chưa có kết quả.</span>
//               ) : (
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <span className="text-gray-400">Trạng thái:</span>
//                       <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
//                         STATUS_STYLE[result.submission?.status] ?? "bg-gray-800 text-gray-400"
//                       }`}>
//                         {result.submission?.status?.replace(/_/g, " ")}
//                       </span>
//                     </div>
//                     <span className="text-gray-400">
//                       Điểm: <span className="text-white font-semibold text-sm">{result.submission?.score?.toFixed(1)}<span className="text-gray-500 text-xs font-normal">/10</span></span>
//                     </span>
//                   </div>

//                   <div>
//                     <div className="flex justify-between text-gray-500 mb-1.5">
//                       <span>Test cases</span>
//                       <span className="text-gray-400">
//                         <span className="text-white font-medium">{result.passedCases}</span>
//                         /{result.totalCases} ({pct}%)
//                       </span>
//                     </div>
//                     <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
//                       <div
//                         className={`h-full rounded-full transition-all duration-700 ${
//                           pct === 100 ? "bg-emerald-500" : pct > 50 ? "bg-yellow-500" : "bg-red-500"
//                         }`}
//                         style={{ width: `${pct}%` }}
//                       />
//                     </div>
//                   </div>

//                   <div className="border-t border-gray-800 pt-2.5 grid grid-cols-2 gap-1">
//                     {Array.from({ length: result.totalCases }).map((_, i) => {
//                       const passed = i < result.passedCases;
//                       return (
//                         <div key={i} className="flex items-center gap-1.5">
//                           <span className={`w-2 h-2 rounded-full flex-shrink-0 ${passed ? "bg-emerald-500" : "bg-red-500"}`} />
//                           <span className="text-gray-400">
//                             Test #{i + 1}: <span className={passed ? "text-emerald-400" : "text-red-400"}>{passed ? "Passed" : "Failed"}</span>
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {isSuccess && (
//           <div className="flex items-center gap-3 px-4 py-2.5 border-t border-emerald-900/50 bg-emerald-900/20 flex-shrink-0">
//             <span className="text-xs text-emerald-400 flex-1 font-medium">
//               ✓ Tuyệt vời! Bạn đã hoàn thành bài tập này.
//             </span>
//             <button
//               onClick={() => navigate(-1)}
//               className="text-xs px-4 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white font-semibold transition-colors"
//             >
//               Bài tập tiếp theo →
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axios";
import { Select } from "antd";

// =============================================
// TYPES
// =============================================
interface SubmissionResult {
  message: string;
  submission: {
    _id: string;
    user_id: string;
    assignment_id: string;
    language: string;
    code: string;
    status: string;
    score: number;
    ai_hint: string | null;
  };
  passedCases: number;
  totalCases: number;
  compileError: string | null;
}

interface AiTutorResult {
  ai_hint: string;
  message: string;
}

interface ExerciseData {
  _id: string;
  title: string;
  difficulty: "Dễ" | "Trung bình" | "Khó";
  description: string;
  requirements: string[];
  examples: { input: string; output: string }[];
  note?: string;
  default_code?: Record<string, string>;
}

// =============================================
// CONFIG
// =============================================
const LANGUAGES = [
  { value: "javascript", label: "JavaScript", monaco: "javascript" },
  { value: "typescript", label: "TypeScript", monaco: "typescript" },
  { value: "python", label: "Python", monaco: "python" },
  { value: "java", label: "Java", monaco: "java" },
  { value: "cpp", label: "C++", monaco: "cpp" },
];

const DEFAULT_CODES: Record<string, string> = {
  javascript: `import React from 'react';\n\nfunction Greeting({ name = 'Khách' }) {\n  return (\n    <h1>Xin chào, {name}!</h1>\n  );\n}\n\nexport default Greeting;`,
  typescript: `import React from 'react';\n\ninterface Props {\n  name?: string;\n}\n\nconst Greeting: React.FC<Props> = ({ name = 'Khách' }) => {\n  return <h1>Xin chào, {name}!</h1>;\n};\n\nexport default Greeting;`,
  python: `def greeting(name="Khách"):\n    return f"Xin chào, {name}!"\n\nif __name__ == "__main__":\n    print(greeting("An"))`,
  java: `public class Solution {\n    public static String greeting(String name) {\n        if (name == null || name.isEmpty()) name = "Khách";\n        return "Xin chào, " + name + "!";\n    }\n}`,
  cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n\nstring greeting(string name = "Khách") {\n    return "Xin chào, " + name + "!";\n}\n\nint main() {\n    cout << greeting("An") << endl;\n    return 0;\n}`,
};

// Status display helpers (kept as maps since they're data, not styles)
const STATUS_LABEL: Record<string, string> = {
  ACCEPTED: "Chấp nhận",
  WRONG_ANSWER: "Sai đáp án",
  COMPILATION_ERROR: "Lỗi biên dịch",
  TIME_LIMIT_EXCEEDED: "Quá thời gian",
  RUNTIME_ERROR: "Lỗi runtime",
};

// Status badge classes (Tailwind)
const STATUS_CLASS: Record<string, string> = {
  ACCEPTED: "bg-green-100 text-green-700",
  WRONG_ANSWER: "bg-red-100 text-red-700",
  COMPILATION_ERROR: "bg-yellow-100 text-yellow-700",
  TIME_LIMIT_EXCEEDED: "bg-orange-100 text-orange-700",
  RUNTIME_ERROR: "bg-red-100 text-red-700",
};

// Progress bar color
function pctColor(pct: number) {
  if (pct === 100) return "bg-green-500";
  if (pct > 50) return "bg-yellow-400";
  return "bg-red-500";
}

// =============================================
// AI TUTOR MODAL
// =============================================
function AiTutorModal({
  isOpen,
  onClose,
  aiHint,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  aiHint: string | null;
  isLoading: boolean;
}) {
  if (!isOpen) return null;
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="w-full max-w-[520px] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#7c3aed">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-slate-900 m-0">Gia Sư AI</p>
            <p className="text-[11px] text-slate-400 m-0">Phân tích lỗi và gợi ý cải thiện</p>
          </div>
          <button
            onClick={onClose}
            className="bg-transparent border-0 cursor-pointer text-slate-400 p-1 rounded-md flex items-center hover:text-slate-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[55vh] overflow-y-auto">
          {isLoading ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-violet-600 inline-block animate-pulse" />
                <span className="text-xs text-violet-600">Gia sư AI đang phân tích code của bạn...</span>
              </div>
              {[100, 80, 95, 65].map((w, i) => (
                <div
                  key={i}
                  className="h-2.5 bg-slate-100 rounded mb-2.5 animate-pulse"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          ) : aiHint ? (
            <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap m-0">{aiHint}</p>
          ) : (
            <p className="text-[13px] text-slate-400 m-0">Không có gợi ý.</p>
          )}
        </div>

        {!isLoading && (
          <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="text-xs px-[18px] py-[7px] rounded-lg border border-slate-200 bg-white text-slate-500 cursor-pointer font-medium hover:bg-slate-50"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function ExercisePage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState<ExerciseData | null>(null);
  const [loadingExercise, setLoadingExercise] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(DEFAULT_CODES.javascript);
  const [activeTab, setActiveTab] = useState<"console" | "result">("console");
  const [leftTab, setLeftTab] = useState<"desc" | "hint" | "discuss">("desc");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('Nhấn "Nộp bài" để chạy và chấm bài...');
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const editorRef = useRef<any>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);

  useEffect(() => {
    if (!assignmentId) return;
    const fetchExercise = async () => {
      try {
        const res = await axiosInstance.get(`/code-assignments/65e000000000000000000001`);
        const data: ExerciseData = res.data;
        setExercise(data);
        if (data.default_code?.[language]) setCode(data.default_code[language]);
      } catch (error) {
        console.error("Lỗi lấy đề bài:", error);
      } finally {
        setLoadingExercise(false);
      }
    };
    fetchExercise();
  }, [assignmentId]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleReset = () => {
    if (exercise?.default_code?.[language])
      setCode(exercise.default_code[language]);
    else setCode(DEFAULT_CODES[language] || "");
  };

  const handleSubmit = async () => {
    const sourceCode = code.trim();
    if (!sourceCode) {
      setConsoleOutput("Vui lòng nhập code trước khi nộp bài.");
      setActiveTab("console");
      return;
    }
    setIsSubmitting(true);
    setIsSuccess(false);
    setResult(null);
    setAiHint(null);
    setActiveTab("console");
    const ts = new Date().toLocaleTimeString();
    setConsoleOutput(`[${ts}] Compiling project...`);

    try {
      const testAssignmentId = "65e000000000000000000001";
      const res = await axiosInstance.post("/submissions/submit", {
        assignmentId: testAssignmentId,
        language,
        sourceCode,
      });
      const data: SubmissionResult = res.data;
      const ts2 = new Date().toLocaleTimeString();
      if (data.compileError) {
        setConsoleOutput(
          `[${ts2}] Compiling project...\n✗ Compilation failed\n\n${data.compileError}`
        );
      } else {
        setConsoleOutput(
          `[${ts2}] Compiling project...\n✓ Compiled successfully\n✓ All tests passed (${data.passedCases}/${data.totalCases})`
        );
      }
      setResult(data);
      setActiveTab("result");
      if (data.submission?.ai_hint) setAiHint(data.submission.ai_hint);
      if (data.submission?.status === "ACCEPTED") setIsSuccess(true);
    } catch (err: any) {
      setConsoleOutput(`Lỗi từ server: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAskAiTutor = async () => {
    setIsAiModalOpen(true);
    if (aiHint) return;

    const subId = result?.submission?._id || (result?.submission as any)?.id;
    if (!subId) {
      setAiHint(
        "Không tìm thấy ID bài nộp (có thể API giả lập hoặc hệ thống chưa trả về ID). Vui lòng nộp bài lại."
      );
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await axiosInstance.post(`/submissions/${subId}/ask-ai-tutor`);
      const data: AiTutorResult = res.data;
      setAiHint(
        data.ai_hint || data.message || "Gia sư AI không đưa ra gợi ý nào.",
      );
    } catch (err: any) {
      setAiHint(
        `Lỗi kết nối API: ${err.response?.data?.message || err.message}`,
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const pct =
    result && result.totalCases > 0
      ? Math.round((result.passedCases / result.totalCases) * 100)
      : 0;
  const showAiTutorBtn = result !== null && result.submission?.status !== "ACCEPTED";
  const title = exercise?.title ?? "Xây dựng Component Greeting";

  const fileExt: Record<string, string> = {
    javascript: "jsx",
    typescript: "tsx",
    python: "py",
    java: "java",
    cpp: "cpp",
  };

  // Console line colors
  function consoleLineClass(line: string) {
    if (line.includes("✓") || line.includes("successfully") || line.includes("passed"))
      return "text-green-400";
    if (line.includes("✗") || line.includes("failed") || line.includes("Lỗi"))
      return "text-red-400";
    if (line.includes("Compiling") || line.includes("Đang")) return "text-blue-400";
    return "text-slate-500";
  }

  return (
    <>
      <AiTutorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        aiHint={aiHint}
        isLoading={isAiLoading}
      />

      {/* Root layout */}
      <div
        className="flex h-screen bg-slate-50 select-none overflow-hidden"
        style={{ fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif", fontSize: 13 }}
      >
        {/* ===== LEFT PANEL ===== */}
        <div className="w-[36%] min-w-[300px] bg-white border-r border-[#e8edf2] flex flex-col overflow-hidden">
          {/* Title area */}
          <div className="px-[22px] pt-5">
            <h1 className="text-[17px] font-bold text-slate-900 leading-snug mb-[10px]">
              {loadingExercise ? (
                <div className="h-5 bg-slate-100 rounded-md w-3/4 animate-pulse" />
              ) : (
                `Bài tập: ${title}`
              )}
            </h1>

            {/* Tabs */}
            <div className="flex border-b-[1.5px] border-slate-100">
              {(["desc", "hint", "discuss"] as const).map((t, i) => {
                const labels = ["Mô tả", "Gợi ý", "Thảo luận"];
                const active = leftTab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setLeftTab(t)}
                    className={[
                      "text-xs font-medium px-[14px] pb-[9px] pt-2 bg-transparent border-0 cursor-pointer transition-colors -mb-[1.5px]",
                      "border-b-2",
                      active
                        ? "font-semibold text-brand-400 border-brand-400"
                        : "text-slate-400 border-transparent hover:text-slate-600",
                    ].join(" ")}
                  >
                    {labels[i]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-[22px] py-[18px]">
            {/* DESC TAB */}
            {leftTab === "desc" &&
              (loadingExercise ? (
                <div className="flex flex-col gap-2">
                  {[75, 55, 85, 45, 65].map((w, i) => (
                    <div
                      key={i}
                      className="h-[11px] bg-slate-100 rounded"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-[18px]">
                  {/* Description */}
                  <p className="text-[13px] text-slate-500 leading-[1.7] m-0">
                    {exercise?.description ?? (
                      <>
                        Trong bài tập này, bạn sẽ tạo một functional component đơn giản có tên là{" "}
                        <code className="bg-slate-100 px-1.5 py-px rounded text-xs text-cyan-600 font-mono">
                          Greeting
                        </code>
                        . Component này sẽ nhận vào một prop là{" "}
                        <code className="bg-slate-100 px-1.5 py-px rounded text-xs text-cyan-600 font-mono">
                          name
                        </code>{" "}
                        và hiển thị lời chào tương ứng.
                      </>
                    )}
                  </p>

                  {/* Requirements */}
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.06em] text-slate-400 uppercase mb-[10px]">
                      Yêu cầu:
                    </p>
                    <ul className="list-none m-0 p-0 flex flex-col gap-2">
                      {(
                        exercise?.requirements ?? [
                          "Component phải được đặt tên là Greeting",
                          "Sử dụng cấu trúc Functional Component của React",
                          'Hiển thị văn bản theo định dạng: "Xin chào, [name]!" bên trong thẻ h1',
                          'Nếu không có prop name, mặc định sẽ hiển thị "Xin chào, Khách!"',
                        ]
                      ).map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-slate-500 leading-snug">
                          <span className="w-[18px] h-[18px] rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-[1px]">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Examples */}
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.06em] text-slate-400 uppercase mb-[10px]">
                      Ví dụ:
                    </p>
                    <div className="flex flex-col gap-2">
                      {(
                        exercise?.examples ?? [
                          { input: '<Greeting name="An" />', output: "<h1>Xin chào, An!</h1>" },
                          { input: "<Greeting />", output: "<h1>Xin chào, Khách!</h1>" },
                        ]
                      ).map((ex, i) => (
                        <div
                          key={i}
                          className="bg-slate-50 border border-[#e8edf2] rounded-[10px] px-[14px] py-[10px] font-mono text-xs"
                        >
                          <div className="text-cyan-600 mb-1">
                            <span className="text-slate-400 text-[10px] font-sans mr-1.5">INPUT</span>
                            {ex.input}
                          </div>
                          <div className="text-slate-500">
                            <span className="text-slate-400 text-[10px] font-sans mr-1.5">OUTPUT</span>
                            {ex.output}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Note */}
                  <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-[14px] py-[10px]">
                    <p className="text-xs text-amber-800 m-0 leading-relaxed">
                      {exercise?.note ??
                        "Phải sử dụng cú pháp JSX hợp lệ. Không được dùng class component."}
                    </p>
                  </div>
                </div>
              ))}

            {/* HINT TAB */}
            {leftTab === "hint" && (
              <div className="flex flex-col items-center gap-3 pt-8 text-slate-400 text-center">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#7c3aed">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <p className="text-[13px] text-slate-500 m-0">Nộp bài trước để nhận gợi ý từ AI</p>
                {showAiTutorBtn && (
                  <button
                    onClick={handleAskAiTutor}
                    className="text-xs px-5 py-2 rounded-lg bg-violet-700 text-white border-0 cursor-pointer font-semibold hover:bg-violet-800 transition-colors"
                  >
                    Hỏi Gia Sư AI
                  </button>
                )}
              </div>
            )}

            {/* DISCUSS TAB */}
            {leftTab === "discuss" && (
              <div className="flex flex-col items-center gap-2 pt-8 text-slate-400 text-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-[13px] text-slate-400 m-0">Chưa có thảo luận nào</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT PANEL ===== */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden bg-white px-2">
          {/* Editor block */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 min-h-0">
            {/* Dark editor header */}
            <div
              className="shadow-lg flex items-center px-4 shrink-0"
              style={{ background: "#252526", height: 42 }}
            >
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#61dafb" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                <span
                  className="text-[13px] text-[#d4d4d4]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  greeting.{fileExt[language] ?? "jsx"}
                </span>

                {/* Language Selector */}
                <div className="ml-4 h-6 border-l border-[#3f3f46] pl-[14px] flex items-center">
                  <Select
                    value={language}
                    onChange={(val) => setLanguage(val)}
                    size="small"
                    style={{ minWidth: 120 }}
                    options={LANGUAGES.map((l) => ({ label: l.label, value: l.value }))}
                  />
                </div>
              </div>

              <div className="flex-1" />

              {/* Traffic lights */}
              <div className="flex gap-1.5">
                {["#ed6a5e", "#f4bf4f", "#61c554"].map((c, i) => (
                  <div key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="shadow-lg flex-1 min-h-0">
              <Editor
                height="100%"
                language={LANGUAGES.find((l) => l.value === language)?.monaco ?? "javascript"}
                value={code}
                onChange={(val) => setCode(val || "")}
                onMount={handleEditorDidMount}
                theme="light"
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  lineNumbersMinChars: 3,
                  renderLineHighlight: "line",
                  padding: { top: 16, bottom: 16 },
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: "on",
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  formatOnPaste: true,
                  bracketPairColorization: { enabled: true },
                  quickSuggestions: true,
                }}
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="shadow-lg flex items-center justify-between bg-white rounded-full px-6 py-[10px] border border-slate-200 shrink-0">
            <div className="flex items-center gap-8">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={[
                  "flex items-center gap-2 bg-transparent border-0 text-sm font-semibold text-slate-600",
                  isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-slate-900",
                ].join(" ")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Chạy thử
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-transparent border-0 text-sm font-semibold text-slate-600 cursor-pointer hover:text-slate-900"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-4.9" />
                </svg>
                Làm lại
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={[
                "flex items-center gap-2 text-sm px-7 py-[10px] rounded-full border-0",
                "bg-brand-600 text-white font-semibold transition-colors",
                isSubmitting
                  ? "cursor-not-allowed opacity-70"
                  : "cursor-pointer hover:bg-brand-700",
              ].join(" ")}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                  Đang chấm...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="22 2 11 13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Nộp bài
                </>
              )}
            </button>
          </div>

          {/* Console Card */}
          <div
            className="shadow-lg flex flex-col rounded-2xl overflow-hidden shrink-0"
            style={{ height: 180, background: "#111827" }}
          >
            {/* Console header */}
            <div
              className="flex items-center px-4 shrink-0 border-b"
              style={{ background: "#1e2530", borderColor: "#2d3748", height: 42 }}
            >
              <div className="flex items-center gap-2 mr-6">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                <span className="text-[11px] font-bold tracking-[0.08em] text-slate-500 uppercase">
                  Console output
                </span>
              </div>

              {(["console", "result"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={[
                    "text-[13px] px-4 h-full bg-transparent border-0 border-b-2 cursor-pointer font-medium transition-colors flex items-center gap-2",
                    activeTab === tab
                      ? "border-green-500 text-slate-100 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-300",
                  ].join(" ")}
                >
                  {tab === "console" ? "Output" : "Kết quả"}
                  {tab === "result" && result && (
                    <span
                      className={[
                        "text-[11px] px-1.5 py-0.5 rounded-[10px] font-bold",
                        result.submission?.status === "ACCEPTED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700",
                      ].join(" ")}
                    >
                      {result.submission?.status === "ACCEPTED" ? "AC" : "WA"}
                    </span>
                  )}
                </button>
              ))}

              <div style={{ flex: 1 }} />

              {showAiTutorBtn && (
                <button
                  onClick={handleAskAiTutor}
                  className="flex items-center gap-1.5 text-xs px-[14px] py-1.5 rounded-lg cursor-pointer font-medium text-violet-400 border border-violet-500/40 bg-violet-500/15 hover:bg-violet-500/25 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Hỏi Gia Sư AI
                </button>
              )}
            </div>

            {/* Console content */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {activeTab === "console" && (
                <pre
                  className="m-0 whitespace-pre-wrap leading-[1.8]"
                  style={{ fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", fontSize: 12 }}
                >
                  {consoleOutput.split("\n").map((line, i) => (
                    <span key={i} className={`block ${consoleLineClass(line)}`}>
                      {line || " "}
                    </span>
                  ))}
                </pre>
              )}

              {activeTab === "result" && (
                <div className="text-slate-100">
                  {!result ? (
                    <span className="text-xs text-slate-500">Chưa có kết quả.</span>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {/* Status + Score */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500">Trạng thái:</span>
                          <span
                            className={[
                              "text-[11px] font-bold px-[10px] py-[3px] rounded-[20px]",
                              STATUS_CLASS[result.submission?.status] ?? "bg-slate-100 text-slate-500",
                            ].join(" ")}
                          >
                            {STATUS_LABEL[result.submission?.status] ??
                              result.submission?.status?.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Điểm:{" "}
                          <span className="text-base font-bold text-slate-100">
                            {result.submission?.score?.toFixed(1)}
                          </span>
                          <span className="text-[11px] text-slate-500">/10</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between mb-[5px] text-[11px] text-slate-500">
                          <span>Test cases</span>
                          <span>
                            <span className="text-slate-100 font-semibold">{result.passedCases}</span>
                            /{result.totalCases} ({pct}%)
                          </span>
                        </div>
                        <div className="h-1.5 rounded bg-[#1e2530] overflow-hidden">
                          <div
                            className={`h-full rounded transition-all duration-700 ${pctColor(pct)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Test case list */}
                      <div
                        className="grid gap-x-3 gap-y-1 border-t pt-2"
                        style={{ gridTemplateColumns: "1fr 1fr", borderColor: "#1e2530" }}
                      >
                        {Array.from({ length: result.totalCases }).map((_, i) => {
                          const passed = i < result.passedCases;
                          return (
                            <div key={i} className="flex items-center gap-1.5 text-[11px]">
                              <span
                                className={`w-[7px] h-[7px] rounded-full shrink-0 ${passed ? "bg-green-500" : "bg-red-500"
                                  }`}
                              />
                              <span className="text-slate-500">
                                Test #{i + 1}:{" "}
                                <span className={passed ? "text-green-400" : "text-red-400"}>
                                  {passed ? "Passed" : "Failed"}
                                </span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Success banner */}
          {isSuccess && (
            <div className="flex items-center gap-3 px-5 py-3 bg-green-50 border border-green-200 rounded-full shrink-0">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-sm text-green-700 flex-1 font-semibold">
                Tuyệt vời! Bạn đã hoàn thành bài tập này.
              </span>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-[13px] px-5 py-2 rounded-full bg-green-600 text-white border-0 cursor-pointer font-semibold hover:bg-green-700 transition-colors"
              >
                Bài tiếp theo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
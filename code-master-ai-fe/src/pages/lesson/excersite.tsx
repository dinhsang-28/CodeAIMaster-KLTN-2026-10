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
// TYPES (giữ nguyên)
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
// CONFIG (giữ nguyên)
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

// const DIFFICULTY_STYLE: Record<
//   string,
//   { bg: string; text: string; dot: string }
// > = {
//   Dễ: { bg: "#dcfce7", text: "#15803d", dot: "#22c55e" },
//   "Trung bình": { bg: "#fef9c3", text: "#a16207", dot: "#eab308" },
//   Khó: { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444" },
// };

const STATUS_LABEL: Record<string, string> = {
  ACCEPTED: "Chấp nhận",
  WRONG_ANSWER: "Sai đáp án",
  COMPILATION_ERROR: "Lỗi biên dịch",
  TIME_LIMIT_EXCEEDED: "Quá thời gian",
  RUNTIME_ERROR: "Lỗi runtime",
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  ACCEPTED: { bg: "#dcfce7", text: "#15803d" },
  WRONG_ANSWER: { bg: "#fee2e2", text: "#b91c1c" },
  COMPILATION_ERROR: { bg: "#fef9c3", text: "#a16207" },
  TIME_LIMIT_EXCEEDED: { bg: "#ffedd5", text: "#c2410c" },
  RUNTIME_ERROR: { bg: "#fee2e2", text: "#b91c1c" },
};

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
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          margin: "0 16px",
          background: "white",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#ede9fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#7c3aed">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Gia Sư AI
            </p>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
              Phân tích lỗi và gợi ý cải thiện
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              padding: 4,
              borderRadius: 6,
              display: "flex",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", maxHeight: "55vh", overflowY: "auto" }}>
          {isLoading ? (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#7c3aed",
                    display: "inline-block",
                    animation: "pulse 1.5s infinite",
                  }}
                />
                <span style={{ fontSize: 12, color: "#7c3aed" }}>
                  Gia sư AI đang phân tích code của bạn...
                </span>
              </div>
              {[100, 80, 95, 65].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: 10,
                    background: "#f1f5f9",
                    borderRadius: 4,
                    marginBottom: 10,
                    width: `${w}%`,
                    animation: "pulse 1.5s infinite",
                  }}
                />
              ))}
            </div>
          ) : aiHint ? (
            <p
              style={{
                fontSize: 13,
                color: "#334155",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                margin: 0,
              }}
            >
              {aiHint}
            </p>
          ) : (
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              Không có gợi ý.
            </p>
          )}
        </div>

        {!isLoading && (
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={onClose}
              style={{
                fontSize: 12,
                padding: "7px 18px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "white",
                color: "#64748b",
                cursor: "pointer",
                fontWeight: 500,
              }}
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
  // "Mô tả" | "Gợi ý" | "Thảo luận"
  const [leftTab, setLeftTab] = useState<"desc" | "hint" | "discuss">("desc");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(
    'Nhấn "Nộp bài" để chạy và chấm bài...',
  );
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const editorRef = useRef<any>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);

  // Fetch đề bài (giữ nguyên logic)
  useEffect(() => {
    if (!assignmentId) return;
    const fetchExercise = async () => {
      try {
        const res = await axiosInstance.get(
          `/code-assignments/65e000000000000000000001`,
        );
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
  }, [assignmentId, language]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleReset = () => {
    if (exercise?.default_code?.[language])
      setCode(exercise.default_code[language]);
    else setCode(DEFAULT_CODES[language] || "");
  };

  // Submit (giữ nguyên logic)
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
          `[${ts2}] Compiling project...\n✗ Compilation failed\n\n${data.compileError}`,
        );
      } else {
        setConsoleOutput(
          `[${ts2}] Compiling project...\n✓ Compiled successfully\n✓ All tests passed (${data.passedCases}/${data.totalCases})`,
        );
      }
      setResult(data);
      setActiveTab("result");
      if (data.submission?.ai_hint) setAiHint(data.submission.ai_hint);
      if (data.submission?.status === "ACCEPTED") setIsSuccess(true);
    } catch (err: any) {
      setConsoleOutput(
        `Lỗi từ server: ${err.response?.data?.message || err.message}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hỏi AI
  const handleAskAiTutor = async () => {
    setIsAiModalOpen(true);
    if (aiHint) return;

    const subId = result?.submission?._id || (result?.submission as any)?.id;
    if (!subId) {
      setAiHint(
        "Không tìm thấy ID bài nộp (có thể API giả lập hoặc hệ thống chưa trả về ID). Vui lòng nộp bài lại.",
      );
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await axiosInstance.post(
        `/submissions/${subId}/ask-ai-tutor`,
      );
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
  const showAiTutorBtn =
    result !== null && result.submission?.status !== "ACCEPTED";
  const title = exercise?.title ?? "Xây dựng Component Greeting";
  // const difficulty = exercise?.difficulty ?? "Dễ";
  // const diffStyle = DIFFICULTY_STYLE[difficulty];

  // filename badge
  const fileExt: Record<string, string> = {
    javascript: "jsx",
    typescript: "tsx",
    python: "py",
    java: "java",
    cpp: "cpp",
  };

  return (
    <>
      <AiTutorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        aiHint={aiHint}
        isLoading={isAiLoading}
      />

      <div
        style={{
          display: "flex",
          height: "100vh",
          background: "#f8fafc",
          fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif",
          fontSize: 13,
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        {/* ===== LEFT PANEL: ĐỀ BÀI ===== */}
        <div
          style={{
            width: "36%",
            minWidth: 300,
            background: "white",
            borderRight: "1px solid #e8edf2",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Title area */}
          <div style={{ padding: "20px 22px 0" }}>
            <h1
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#0f172a",
                lineHeight: 1.35,
                marginBottom: 10,
              }}
            >
              {loadingExercise ? (
                <div
                  style={{
                    height: 20,
                    background: "#f1f5f9",
                    borderRadius: 6,
                    width: "75%",
                    animation: "pulse 1.5s infinite",
                  }}
                />
              ) : (
                `Bài tập: ${title}`
              )}
            </h1>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: 0,
                borderBottom: "1.5px solid #f1f5f9",
              }}
            >
              {(["desc", "hint", "discuss"] as const).map((t, i) => {
                const labels = ["Mô tả", "Gợi ý", "Thảo luận"];
                const active = leftTab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setLeftTab(t)}
                    style={{
                      fontSize: 12,
                      fontWeight: active ? 600 : 500,
                      color: active ? "#16a34a" : "#94a3b8",
                      padding: "8px 14px 9px",
                      background: "none",
                      border: "none",
                      borderBottom: active
                        ? "2px solid #16a34a"
                        : "2px solid transparent",
                      marginBottom: -1.5,
                      cursor: "pointer",
                      transition: "color 0.15s",
                    }}
                  >
                    {labels[i]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
            {leftTab === "desc" &&
              (loadingExercise ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {[75, 55, 85, 45, 65].map((w, i) => (
                    <div
                      key={i}
                      style={{
                        height: 11,
                        background: "#f1f5f9",
                        borderRadius: 4,
                        width: `${w}%`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 18 }}
                >
                  {/* Difficulty badge removed */}

                  {/* Description */}
                  <p
                    style={{
                      fontSize: 13,
                      color: "#475569",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {exercise?.description ?? (
                      <>
                        Trong bài tập này, bạn sẽ tạo một functional component
                        đơn giản có tên là{" "}
                        <code
                          style={{
                            background: "#f1f5f9",
                            padding: "1px 6px",
                            borderRadius: 4,
                            fontSize: 12,
                            color: "#0891b2",
                            fontFamily: "monospace",
                          }}
                        >
                          Greeting
                        </code>
                        . Component này sẽ nhận vào một prop là{" "}
                        <code
                          style={{
                            background: "#f1f5f9",
                            padding: "1px 6px",
                            borderRadius: 4,
                            fontSize: 12,
                            color: "#0891b2",
                            fontFamily: "monospace",
                          }}
                        >
                          name
                        </code>{" "}
                        và hiển thị lời chào tương ứng.
                      </>
                    )}
                  </p>

                  {/* Requirements */}
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        marginBottom: 10,
                      }}
                    >
                      Yêu cầu:
                    </p>
                    <ul
                      style={{
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {(
                        exercise?.requirements ?? [
                          "Component phải được đặt tên là Greeting",
                          "Sử dụng cấu trúc Functional Component của React",
                          'Hiển thị văn bản theo định dạng: "Xin chào, [name]!" bên trong thẻ h1',
                          'Nếu không có prop name, mặc định sẽ hiển thị "Xin chào, Khách!"',
                        ]
                      ).map((req, i) => (
                        <li
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8,
                            fontSize: 13,
                            color: "#475569",
                            lineHeight: 1.5,
                          }}
                        >
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              background: "#dcfce7",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          >
                            <svg
                              width="9"
                              height="9"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#16a34a"
                              strokeWidth="3"
                            >
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
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        marginBottom: 10,
                      }}
                    >
                      Ví dụ:
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {(
                        exercise?.examples ?? [
                          {
                            input: '<Greeting name="An" />',
                            output: "<h1>Xin chào, An!</h1>",
                          },
                          {
                            input: "<Greeting />",
                            output: "<h1>Xin chào, Khách!</h1>",
                          },
                        ]
                      ).map((ex, i) => (
                        <div
                          key={i}
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e8edf2",
                            borderRadius: 10,
                            padding: "10px 14px",
                            fontFamily: "monospace",
                            fontSize: 12,
                          }}
                        >
                          <div style={{ color: "#0891b2", marginBottom: 4 }}>
                            <span
                              style={{
                                color: "#94a3b8",
                                fontSize: 10,
                                fontFamily: "sans-serif",
                                marginRight: 6,
                              }}
                            >
                              INPUT
                            </span>
                            {ex.input}
                          </div>
                          <div style={{ color: "#64748b" }}>
                            <span
                              style={{
                                color: "#94a3b8",
                                fontSize: 10,
                                fontFamily: "sans-serif",
                                marginRight: 6,
                              }}
                            >
                              OUTPUT
                            </span>
                            {ex.output}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Note */}
                  {(exercise?.note || true) && (
                    <div
                      style={{
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        borderRadius: 10,
                        padding: "10px 14px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 12,
                          color: "#92400e",
                          margin: 0,
                          lineHeight: 1.6,
                        }}
                      >
                        {exercise?.note ??
                          "Phải sử dụng cú pháp JSX hợp lệ. Không được dùng class component."}
                      </p>
                    </div>
                  )}
                </div>
              ))}

            {leftTab === "hint" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  paddingTop: 32,
                  color: "#94a3b8",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#ede9fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="#7c3aed"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>
                  Nộp bài trước để nhận gợi ý từ AI
                </p>
                {showAiTutorBtn && (
                  <button
                    onClick={handleAskAiTutor}
                    style={{
                      fontSize: 12,
                      padding: "8px 20px",
                      borderRadius: 8,
                      background: "#7c3aed",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Hỏi Gia Sư AI
                  </button>
                )}
              </div>
            )}

            {leftTab === "discuss" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  paddingTop: 32,
                  color: "#94a3b8",
                  textAlign: "center",
                }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                  Chưa có thảo luận nào
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT PANEL: STRUCTURE CONFORMS TO DESIGN ===== */}
        <div
          className="px-2"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            overflow: "hidden",
            background: "white",
          }}
        >
          {/* Editor block rounded */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "white",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              minHeight: 0,
            }}
          >
            {/* Dark editor header */}
            <div
              className="shadow-lg"
              style={{
                background: "#252526",
                height: 42,
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#61dafb"
                  strokeWidth="2"
                >
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                <span
                  style={{
                    fontSize: 13,
                    color: "#d4d4d4",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  greeting.{fileExt[language] ?? "jsx"}
                </span>

                {/* Language Selector in Light Theme */}
                <div
                  style={{
                    marginLeft: 16,
                    height: 24,
                    borderLeft: "1px solid #3f3f46",
                    paddingLeft: 14,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Select
                    value={language}
                    onChange={(val) => setLanguage(val)}
                    size="small"
                    style={{ minWidth: 120 }}
                    options={LANGUAGES.map((l) => ({
                      label: l.label,
                      value: l.value,
                    }))}
                  />
                </div>
              </div>
              <div style={{ flex: 1 }} />
              {/* Traffic lights on RIGHT */}
              <div style={{ display: "flex", gap: 6 }}>
                {["#ed6a5e", "#f4bf4f", "#61c554"].map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: c,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Monaco Editor (Light Theme) */}
            <div className="shadow-lg" style={{ flex: 1, minHeight: 0 }}>
              <Editor
                height="100%"
                language={
                  LANGUAGES.find((l) => l.value === language)?.monaco ??
                  "javascript"
                }
                value={code}
                onChange={(val) => setCode(val || "")}
                onMount={handleEditorDidMount}
                theme="light"
                options={{
                  fontSize: 13,
                  fontFamily:
                    "'JetBrains Mono', 'Fira Code', Consolas, monospace",
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
          <div
            className="shadow-lg"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "white",
              borderRadius: 999,
              padding: "10px 24px",
              border: "1px solid #e2e8f0",
              flexShrink: 0,
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "none",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#475569",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Chạy thử
              </button>
              <button
                onClick={handleReset}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "none",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-4.9" />
                </svg>
                Làm lại
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                padding: "10px 28px",
                borderRadius: 999,
                border: "none",
                background: "#4e7c5e",
                color: "white",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontWeight: 600,
                opacity: isSubmitting ? 0.7 : 1,
                transition: "background 0.15s",
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Đang chấm...
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
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
            className="shadow-lg"
            style={{
              height: 180,
              display: "flex",
              flexDirection: "column",
              background: "#111827",
              borderRadius: 16,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#1e2530",
                borderBottom: "1px solid #2d3748",
                padding: "0 16px",
                height: 42,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginRight: 24,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                >
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "#64748b",
                    textTransform: "uppercase",
                  }}
                >
                  Console output
                </span>
              </div>

              {(["console", "result"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    fontSize: 13,
                    padding: "0 16px",
                    height: "100%",
                    background: "none",
                    border: "none",
                    borderBottom:
                      activeTab === tab
                        ? "2px solid #22c55e"
                        : "2px solid transparent",
                    color: activeTab === tab ? "#f1f5f9" : "#64748b",
                    cursor: "pointer",
                    fontWeight: activeTab === tab ? 600 : 500,
                    transition: "color 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {tab === "console" ? "Output" : "Kết quả"}
                  {tab === "result" && result && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 10,
                        background:
                          result.submission?.status === "ACCEPTED"
                            ? "#dcfce7"
                            : "#fee2e2",
                        color:
                          result.submission?.status === "ACCEPTED"
                            ? "#15803d"
                            : "#b91c1c",
                        fontWeight: 700,
                      }}
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "rgba(124,58,237,0.15)",
                    border: "1px solid rgba(124,58,237,0.4)",
                    color: "#a78bfa",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Hỏi Gia Sư AI
                </button>
              )}
            </div>

            {/* Console content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
              {activeTab === "console" && (
                <pre
                  style={{
                    fontFamily:
                      "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    fontSize: 12,
                    lineHeight: 1.8,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {consoleOutput.split("\n").map((line, i) => {
                    let color = "#64748b";
                    if (
                      line.includes("✓") ||
                      line.includes("successfully") ||
                      line.includes("passed")
                    )
                      color = "#4ade80";
                    else if (
                      line.includes("✗") ||
                      line.includes("failed") ||
                      line.includes("Lỗi")
                    )
                      color = "#f87171";
                    else if (
                      line.includes("Compiling") ||
                      line.includes("Đang")
                    )
                      color = "#60a5fa";
                    return (
                      <span key={i} style={{ color, display: "block" }}>
                        {line || " "}
                      </span>
                    );
                  })}
                </pre>
              )}
              {activeTab === "result" && (
                <div style={{ color: "#f1f5f9" }}>
                  {!result ? (
                    <span style={{ fontSize: 12, color: "#475569" }}>
                      Chưa có kết quả.
                    </span>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {/* Status + Score */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span style={{ fontSize: 11, color: "#64748b" }}>
                            Trạng thái:
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "3px 10px",
                              borderRadius: 20,
                              background:
                                STATUS_COLOR[result.submission?.status]?.bg ??
                                "#f1f5f9",
                              color:
                                STATUS_COLOR[result.submission?.status]?.text ??
                                "#64748b",
                            }}
                          >
                            {STATUS_LABEL[result.submission?.status] ??
                              result.submission?.status?.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          Điểm:{" "}
                          <span
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              color: "#f1f5f9",
                            }}
                          >
                            {result.submission?.score?.toFixed(1)}
                          </span>
                          <span style={{ fontSize: 11, color: "#475569" }}>
                            /10
                          </span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 5,
                            fontSize: 11,
                            color: "#64748b",
                          }}
                        >
                          <span>Test cases</span>
                          <span>
                            <span style={{ color: "#f1f5f9", fontWeight: 600 }}>
                              {result.passedCases}
                            </span>
                            /{result.totalCases} ({pct}%)
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            background: "#1e2530",
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 4,
                              transition: "width 0.7s ease",
                              width: `${pct}%`,
                              background:
                                pct === 100
                                  ? "#22c55e"
                                  : pct > 50
                                    ? "#eab308"
                                    : "#ef4444",
                            }}
                          />
                        </div>
                      </div>
                      {/* Test cases list */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "4px 12px",
                          borderTop: "1px solid #1e2530",
                          paddingTop: 8,
                        }}
                      >
                        {Array.from({ length: result.totalCases }).map(
                          (_, i) => {
                            const passed = i < result.passedCases;
                            return (
                              <div
                                key={i}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  fontSize: 11,
                                }}
                              >
                                <span
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    flexShrink: 0,
                                    background: passed ? "#22c55e" : "#ef4444",
                                  }}
                                />
                                <span style={{ color: "#64748b" }}>
                                  Test #{i + 1}:{" "}
                                  <span
                                    style={{
                                      color: passed ? "#4ade80" : "#f87171",
                                    }}
                                  >
                                    {passed ? "Passed" : "Failed"}
                                  </span>
                                </span>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Success banner */}
          {isSuccess && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 20px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 100,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#22c55e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 14,
                  color: "#15803d",
                  flex: 1,
                  fontWeight: 600,
                }}
              >
                Tuyệt vời! Bạn đã hoàn thành bài tập này.
              </span>
              <button
                onClick={() => navigate(-1)}
                style={{
                  fontSize: 13,
                  padding: "8px 20px",
                  borderRadius: 100,
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Bài tiếp theo
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </>
  );
}

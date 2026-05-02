import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Spin,
  DatePicker,
  TimePicker,
  InputNumber,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  createQuiz,
  updateQuiz,
  getQuizzesByAssignmentId,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByQuizId,
  createCodeAssignment,
  updateCodeAssignment,
  getCodeAssignmentsByAssignmentId,
} from "../../api/excersice";

const { Option } = Select;
const { TextArea } = Input;

type AssignmentFormModalProps = {
  visible: boolean;
  mode: "create" | "edit" | "view";
  initialData?: any;
  type: "quiz" | "codeAssignment";
  courses: any[];
  getCourseFullInfo: (id: string) => Promise<any>;
  onCancel: () => void;
  onSuccess: () => void;
};

const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  visible,
  mode,
  initialData,
  type,
  courses,
  getCourseFullInfo,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);

  // Lưu trữ sub-entity IDs khi edit
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);
  const [currentCodeAsgId, setCurrentCodeAsgId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDeletedQuestionIds([]);
      setCurrentQuizId(null);
      setCurrentCodeAsgId(null);

      if ((mode === "edit" || mode === "view") && initialData) {
        initFormData(initialData);
      } else {
        form.resetFields();
        form.setFieldsValue({
          type: type,
          score: 10,
          time_limit: type === "quiz" ? 15 : 2,
          memory_limit: 128000,
          language: "javascript",
          starter_code: "function solve(){}",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, mode, initialData, type, form]);

  const initFormData = async (data: any) => {
    setLoading(true);
    try {
      if (data.course?._id || data.course) {
        await handleCourseChange(data.course?._id || data.course);
      }

      const formVals: any = {
        name: data.title || data.name,
        course_id: data.course?._id || data.course,
        lesson_id: data.lesson_id || data.lesson?._id || data.lesson,
        score: data.max_score || data.score || 10,
        description: data.description,
        dueDate:
          data.due_date || data.dueDate
            ? dayjs(data.due_date || data.dueDate)
            : undefined,
        dueTime:
          data.due_date || data.dueTime
            ? dayjs(data.due_date || data.dueTime)
            : undefined,
        type: data.type || type,
      };

      if (type === "quiz") {
        const quizzes = await getQuizzesByAssignmentId(data._id);
        if (quizzes && quizzes.length > 0) {
          const quiz = quizzes[0];
          setCurrentQuizId(quiz._id);
          formVals.time_limit = quiz.time_limit;

          const questions = await getQuestionsByQuizId(quiz._id);
          formVals.questions = questions.map((q: any) => ({
            _id: q._id,
            text: q.question_text || q.text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_answer: q.correct_answer || "A",
            score: q.score || 1,
          }));
        }
      } else if (type === "codeAssignment") {
        const codeAsgs = await getCodeAssignmentsByAssignmentId(data._id);
        if (codeAsgs && codeAsgs.length > 0) {
          const ca = codeAsgs[0];
          setCurrentCodeAsgId(ca._id);
          formVals.language = ca.language_support || ca.language;
          formVals.time_limit = ca.time_limit;
          formVals.memory_limit = ca.memory_limit;
          formVals.problem_description =
            ca.problem_description || ca.description;
          formVals.input_format = ca.input_format;
          formVals.output_format = ca.output_format;
          formVals.starter_code = ca.starter_code;
        }
      }

      form.setFieldsValue(formVals);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải chi tiết dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = async (courseId: string) => {
    try {
      const fullInfo = await getCourseFullInfo(courseId);
      setLessons(fullInfo.lessons || []);
      if (!initialData || initialData.course?._id !== courseId) {
        form.setFieldsValue({ lesson_id: undefined });
      }
    } catch (error) {
      setLessons([]);
    }
  };

  const submitQuizAssignment = async (assignmentId: string, values: any) => {
    let quizId = currentQuizId;

    if (mode === "create" || !quizId) {
      const quiz = await createQuiz({
        assignment_id: assignmentId,
        title: values.name,
        time_limit: values.time_limit || 15,
        total_score: values.score || 10,
      });
      quizId = quiz._id || quiz.id;
    } else {
      await updateQuiz(quizId, {
        title: values.name,
        time_limit: values.time_limit || 15,
        total_score: values.score || 10,
      });
    }

    const questions = values.questions || [];
    const questionPromises: any[] = [];

    questions.forEach((q: any) => {
      const payload = {
        quiz_id: quizId,
        question_text: q.text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        score: q.score || 1,
      };

      if (q._id) {
        questionPromises.push(updateQuestion(q._id, payload));
      } else {
        questionPromises.push(createQuestion(payload));
      }
    });

    deletedQuestionIds.forEach((id) => {
      questionPromises.push(deleteQuestion(id));
    });

    await Promise.allSettled(questionPromises);
  };

  const submitCodeAssignment = async (assignmentId: string, values: any) => {
    const payload = {
      assignment_id: assignmentId,
      problem_description:
        values.problem_description || values.description || "",
      input_format: values.input_format || "",
      output_format: values.output_format || "",
      time_limit: values.time_limit || 2,
      memory_limit: values.memory_limit || 128000,
      starter_code: values.starter_code || "function solve(){}",
      language_support: values.language || "javascript",
    };

    if (mode === "create" || !currentCodeAsgId) {
      await createCodeAssignment(payload);
    } else {
      await updateCodeAssignment(currentCodeAsgId, payload);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    let asgId = mode === "edit" ? initialData._id : null;

    try {
      let combinedDate = undefined;
      if (values.dueDate) {
        const dateStr = values.dueDate.format("YYYY-MM-DD");
        const timeStr = values.dueTime
          ? values.dueTime.format("HH:mm:00")
          : "00:00:00";
        combinedDate = `${dateStr}T${timeStr}.000Z`;
      }

      const basePayload: any = {
        lesson_id: values.lesson_id,
        title: values.name,
        description: values.description || "",
        max_score: values.score || 10,
        due_date: combinedDate,
        type: type,
      };

      if (mode === "create") {
        const newAsg = await createAssignment(basePayload);
        asgId = newAsg._id || newAsg.id;

        if (type === "codeAssignment" && newAsg.type === "quiz") {
          try {
            await updateAssignment(asgId, { type: "codeAssignment" });
          } catch (patchErr) {
            await deleteAssignment(asgId);
            throw new Error(
              "Hệ thống chưa hỗ trợ tạo Code Assignment trực tiếp.",
            );
          }
        }
      } else {
        await updateAssignment(asgId, basePayload);
      }

      if (type === "quiz") {
        await submitQuizAssignment(asgId, values);
      } else if (type === "codeAssignment") {
        await submitCodeAssignment(asgId, values);
      }

      message.success(`${mode === "create" ? "Tạo" : "Cập nhật"} thành công!`);
      onSuccess();
    } catch (err: any) {
      message.error(err.message || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        mode === "view"
          ? "Chi tiết bài tập"
          : mode === "create"
            ? `Tạo ${type === "quiz" ? "Trắc nghiệm" : "Code Assignment"}`
            : "Sửa bài tập"
      }
      open={visible}
      onCancel={onCancel}
      width={type === "codeAssignment" ? 800 : 800}
      footer={
        mode === "view" ? (
          <Button onClick={onCancel}>Đóng</Button>
        ) : (
          <>
            <Button onClick={onCancel} disabled={loading}>
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
            >
              Lưu
            </Button>
          </>
        )
      }
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={mode === "view"}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Tên bài tập"
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhập tên bài tập" />
            </Form.Item>
            <Form.Item
              name="score"
              label="Điểm tối đa"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>

            <Form.Item
              name="course_id"
              label="Khóa học"
              rules={[{ required: true }]}
            >
              <Select placeholder="Chọn khóa học" onChange={handleCourseChange}>
                {courses.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.title || c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="lesson_id"
              label="Bài học"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Chọn bài học"
                disabled={!form.getFieldValue("course_id")}
              >
                {lessons.map((l) => (
                  <Option key={l._id} value={l._id}>
                    {l.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="dueDate" label="Ngày hết hạn">
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="dueTime" label="Giờ hết hạn">
              <TimePicker style={{ width: "100%" }} format="HH:mm" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả bài tập">
            <TextArea rows={2} placeholder="Mô tả chung..." />
          </Form.Item>

          {type === "codeAssignment" && (
            <div className="bg-gray-50 p-4 rounded-lg mt-2">
              <h4 className="font-semibold mb-3">Cấu hình Code</h4>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="language"
                  label="Ngôn ngữ hỗ trợ"
                  initialValue="javascript"
                >
                  <Select>
                    <Option value="javascript">JavaScript</Option>
                    <Option value="python">Python</Option>
                    <Option value="cpp">C++</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="time_limit"
                  label="Time Limit (s)"
                  initialValue={2}
                >
                  <InputNumber style={{ width: "100%" }} min={0.1} step={0.1} />
                </Form.Item>
                <Form.Item
                  name="memory_limit"
                  label="Memory Limit (Bytes)"
                  initialValue={128000}
                >
                  <InputNumber style={{ width: "100%" }} min={1024} />
                </Form.Item>
              </div>
              <Form.Item name="problem_description" label="Đề bài">
                <TextArea rows={3} placeholder="Nhập đề bài chi tiết..." />
              </Form.Item>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="input_format" label="Định dạng Input">
                  <TextArea rows={2} />
                </Form.Item>
                <Form.Item name="output_format" label="Định dạng Output">
                  <TextArea rows={2} />
                </Form.Item>
              </div>
              <Form.Item name="starter_code" label="Starter Code">
                <TextArea rows={3} style={{ fontFamily: "monospace" }} />
              </Form.Item>
            </div>
          )}

          {type === "quiz" && (
            <div className="bg-gray-50 p-4 rounded-lg mt-2">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Danh sách câu hỏi</h4>
                <Form.Item
                  name="time_limit"
                  label="Thời gian làm bài (phút)"
                  className="mb-0"
                >
                  <InputNumber min={1} />
                </Form.Item>
              </div>

              <Form.List name="questions">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <div
                        key={key}
                        className="bg-white p-4 rounded border border-gray-200 mb-3 relative"
                      >
                        <div className="font-bold mb-2">Câu {index + 1}</div>
                        <Form.Item {...restField} name={[name, "_id"]} hidden>
                          <Input />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "text"]}
                          rules={[{ required: true, message: "Nhập câu hỏi" }]}
                        >
                          <TextArea rows={2} placeholder="Nội dung câu hỏi" />
                        </Form.Item>

                        <div className="grid grid-cols-2 gap-4">
                          <Form.Item
                            {...restField}
                            name={[name, "option_a"]}
                            label="Lựa chọn A"
                            rules={[{ required: true }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "option_b"]}
                            label="Lựa chọn B"
                            rules={[{ required: true }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "option_c"]}
                            label="Lựa chọn C"
                            rules={[{ required: true }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "option_d"]}
                            label="Lựa chọn D"
                            rules={[{ required: true }]}
                          >
                            <Input />
                          </Form.Item>
                        </div>

                        <div className="flex gap-4 items-center mt-2">
                          <Form.Item
                            {...restField}
                            name={[name, "correct_answer"]}
                            label="Đáp án đúng"
                            className="mb-0"
                            initialValue="A"
                          >
                            <Select style={{ width: 100 }}>
                              <Option value="A">A</Option>
                              <Option value="B">B</Option>
                              <Option value="C">C</Option>
                              <Option value="D">D</Option>
                            </Select>
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "score"]}
                            label="Điểm câu này"
                            className="mb-0"
                            initialValue={1}
                          >
                            <InputNumber min={1} />
                          </Form.Item>
                        </div>

                        {mode !== "view" && (
                          <Button
                            danger
                            type="text"
                            icon={<MinusCircleOutlined />}
                            className="absolute top-2 right-2"
                            onClick={() => {
                              const q = form.getFieldValue(["questions", name]);
                              if (q && q._id)
                                setDeletedQuestionIds((prev) => [
                                  ...prev,
                                  q._id,
                                ]);
                              remove(name);
                            }}
                          >
                            Xóa
                          </Button>
                        )}
                      </div>
                    ))}
                    {mode !== "view" && (
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Thêm câu hỏi mới
                      </Button>
                    )}
                  </>
                )}
              </Form.List>
            </div>
          )}
        </Form>
      </Spin>
    </Modal>
  );
};

export default AssignmentFormModal;

import React, { useEffect, useState } from "react";
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
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);
  const [currentCodeAsgId, setCurrentCodeAsgId] = useState<string | null>(null);

  const getNewestChild = (
    items: any[],
    entityName: string,
    assignmentId: string,
  ) => {
    if (!Array.isArray(items) || items.length === 0) {
      return null;
    }

    const sorted = [...items].sort((a, b) => {
      const aTime = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
      const bTime = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
      return bTime - aTime;
    });

    if (sorted.length > 1) {
      console.warn(
        `[AssignmentFormModal] Found ${sorted.length} ${entityName} records for assignment ${assignmentId}. Using the most recently updated one.`,
        sorted,
      );
    }

    return sorted[0];
  };

  useEffect(() => {
    if (!visible) {
      return;
    }

    console.debug("[AssignmentFormModal] open", {
      visible,
      mode,
      type,
      initialDataId: initialData?._id,
      initialData,
    });

    setDeletedQuestionIds([]);
    setCurrentQuizId(null);
    setCurrentCodeAsgId(null);

    if ((mode === "edit" || mode === "view") && initialData) {
      void initFormData(initialData);
      return;
    }

    form.resetFields();
    form.setFieldsValue({
      type,
      score: 10,
      time_limit: type === "quiz" ? 15 : 2,
      memory_limit: 128000,
      language: "javascript",
      starter_code: "function solve(){}",
    });
  }, [visible, mode, initialData, type, form]);

  const initFormData = async (data: any) => {
    setLoading(true);
    try {
      console.debug("[AssignmentFormModal] initFormData start", data);
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
        const quiz = getNewestChild(quizzes, "quiz", data._id);

        if (quiz?._id) {
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
        const codeAssignment = getNewestChild(
          codeAsgs,
          "code assignment",
          data._id,
        );

        if (codeAssignment?._id) {
          setCurrentCodeAsgId(codeAssignment._id);
          formVals.language =
            codeAssignment.language_support || codeAssignment.language;
          formVals.time_limit = codeAssignment.time_limit;
          formVals.memory_limit = codeAssignment.memory_limit;
          formVals.problem_description =
            codeAssignment.problem_description || codeAssignment.description;
          formVals.input_format = codeAssignment.input_format;
          formVals.output_format = codeAssignment.output_format;
          formVals.starter_code = codeAssignment.starter_code;
        }
      }

      form.setFieldsValue(formVals);
      console.debug("[AssignmentFormModal] formVals after init", formVals);
    } catch (err) {
      console.error(err);
      message.error("Loi khi tai chi tiet du lieu");
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

    console.debug("[AssignmentFormModal] submitCodeAssignment payload", {
      mode,
      assignmentId,
      currentCodeAsgId,
      payload,
    });

    if (mode === "create" || !currentCodeAsgId) {
      const created = await createCodeAssignment(payload);
      console.debug("[AssignmentFormModal] createCodeAssignment response", created);
      return created;
    } else {
      const updated = await updateCodeAssignment(currentCodeAsgId, payload);
      console.debug("[AssignmentFormModal] updateCodeAssignment response", updated);
      return updated;
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    let assignmentId = mode === "edit" ? initialData?._id : null;

    try {
      let combinedDate = undefined;
      if (values.dueDate) {
        const dateStr = values.dueDate.format("YYYY-MM-DD");
        const timeStr = values.dueTime
          ? values.dueTime.format("HH:mm:00")
          : "00:00:00";
        combinedDate = `${dateStr}T${timeStr}.000Z`;
      }

      const basePayload = {
        lesson_id: values.lesson_id,
        title: values.name,
        description: values.description || "",
        max_score: values.score || 10,
        due_date: combinedDate,
        type,
      };

      if (mode === "create") {
        const assignment = await createAssignment(basePayload);
        assignmentId = assignment._id || assignment.id;
      } else if (assignmentId) {
        await updateAssignment(assignmentId, basePayload);
      }

      if (!assignmentId) {
        throw new Error("Khong tao duoc assignment");
      }

      if (type === "quiz") {
        await submitQuizAssignment(assignmentId, values);
      } else {
        const codeAsgResult = await submitCodeAssignment(assignmentId, values);
        console.debug("[AssignmentFormModal] currentCodeAsgId before refresh", currentCodeAsgId);
        try {
          const refreshedCodeAsgs = await getCodeAssignmentsByAssignmentId(assignmentId);
          console.debug("[AssignmentFormModal] refreshed code assignments", refreshedCodeAsgs);
          const list = Array.isArray(refreshedCodeAsgs)
            ? refreshedCodeAsgs
            : refreshedCodeAsgs?.data || refreshedCodeAsgs?.results || [];
          const newest = list[0] || codeAsgResult || null;
          console.debug("[AssignmentFormModal] newest code assignment selected", newest);
          if (newest?._id) {
            setCurrentCodeAsgId(newest._id);
            console.debug("[AssignmentFormModal] setCurrentCodeAsgId", newest._id);
          }
        } catch (refreshErr) {
          console.debug("[AssignmentFormModal] refresh code assignments failed", refreshErr);
        }
      }

      message.success(`${mode === "create" ? "Tao" : "Cap nhat"} thanh cong!`);
      onSuccess();
    } catch (err: any) {
      message.error(err.message || "Co loi xay ra, vui long thu lai!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        mode === "view"
          ? "Chi tiet bai tap"
          : mode === "create"
            ? `Tao ${type === "quiz" ? "Trac nghiem" : "Code Assignment"}`
            : "Sua bai tap"
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={
        mode === "view" ? (
          <Button onClick={onCancel}>Dong</Button>
        ) : (
          <>
            <Button onClick={onCancel} disabled={loading}>
              Huy
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
            >
              Luu
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
              label="Ten bai tap"
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhap ten bai tap" />
            </Form.Item>
            <Form.Item
              name="score"
              label="Diem toi da"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>

            <Form.Item
              name="course_id"
              label="Khoa hoc"
              rules={[{ required: true }]}
            >
              <Select placeholder="Chon khoa hoc" onChange={handleCourseChange}>
                {courses.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.title || c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="lesson_id"
              label="Bai hoc"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Chon bai hoc"
                disabled={!form.getFieldValue("course_id")}
              >
                {lessons.map((l) => (
                  <Option key={l._id} value={l._id}>
                    {l.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="dueDate" label="Ngay het han">
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="dueTime" label="Gio het han">
              <TimePicker style={{ width: "100%" }} format="HH:mm" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mo ta bai tap">
            <TextArea rows={2} placeholder="Mo ta chung..." />
          </Form.Item>

          {type === "codeAssignment" && (
            <div className="bg-gray-50 p-4 rounded-lg mt-2">
              <h4 className="font-semibold mb-3">Cau hinh Code</h4>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="language"
                  label="Ngon ngu ho tro"
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
              <Form.Item name="problem_description" label="De bai">
                <TextArea rows={3} placeholder="Nhap de bai chi tiet..." />
              </Form.Item>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="input_format" label="Dinh dang Input">
                  <TextArea rows={2} />
                </Form.Item>
                <Form.Item name="output_format" label="Dinh dang Output">
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
                <h4 className="font-semibold">Danh sach cau hoi</h4>
                <Form.Item
                  name="time_limit"
                  label="Thoi gian lam bai (phut)"
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
                        <div className="font-bold mb-2">Cau {index + 1}</div>
                        <Form.Item {...restField} name={[name, "_id"]} hidden>
                          <Input />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "text"]}
                          rules={[{ required: true, message: "Nhap cau hoi" }]}
                        >
                          <TextArea rows={2} placeholder="Noi dung cau hoi" />
                        </Form.Item>

                        <div className="grid grid-cols-2 gap-4">
                          <Form.Item
                            {...restField}
                            name={[name, "option_a"]}
                            label="Lua chon A"
                            rules={[{ required: true }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "option_b"]}
                            label="Lua chon B"
                            rules={[{ required: true }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "option_c"]}
                            label="Lua chon C"
                            rules={[{ required: true }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "option_d"]}
                            label="Lua chon D"
                            rules={[{ required: true }]}
                          >
                            <Input />
                          </Form.Item>
                        </div>

                        <div className="flex gap-4 items-center mt-2">
                          <Form.Item
                            {...restField}
                            name={[name, "correct_answer"]}
                            label="Dap an dung"
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
                            label="Diem cau nay"
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
                              if (q && q._id) {
                                setDeletedQuestionIds((prev) => [...prev, q._id]);
                              }
                              remove(name);
                            }}
                          >
                            Xoa
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
                        Them cau hoi moi
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

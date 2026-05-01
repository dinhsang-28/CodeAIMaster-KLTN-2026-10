import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Upload, Button, Space, message, Spin } from "antd";
import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { 
  createCourse, 
  updateCourse, 
  createLesson, 
  updateLesson, 
  deleteLesson,
  GetCategories
} from "../../api/course";

const { Option } = Select;
const { TextArea } = Input;

type CourseFormModalProps = {
  visible: boolean;
  mode: "create" | "edit" | "view";
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => void;
};

const CourseFormModal: React.FC<CourseFormModalProps> = ({
  visible,
  mode,
  initialData,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [deletedLessonIds, setDeletedLessonIds] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      fetchCategories();
      setDeletedLessonIds([]);
      if (mode === "edit" || mode === "view") {
        if (initialData) {
          form.setFieldsValue({
            title: initialData.title || initialData.name,
            description: initialData.description,
            price: initialData.price,
            category: initialData.category?._id || initialData.category,
            thumbnail: initialData.thumbnail || "",
            learning_outcomes: initialData.learning_outcomes || [],
            requirements: initialData.requirements || [],
            lessons: (initialData.lessons || []).map((l: any) => ({
              _id: l._id,
              title: l.title,
              content: l.content || l.description,
              video_url: l.video_url,
            })),
          });
        }
      } else {
        form.resetFields();
      }
    }
  }, [visible, mode, initialData, form]);

  const fetchCategories = async () => {
    try {
      const cats = await GetCategories();
      setCategories(cats || []);
    } catch (err) {
      console.error("Lỗi fetch categories:", err);
    }
  };

  const onFinish = async (values: any) => {
    if (mode === "view") return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title || "");
      formData.append("description", values.description || "");
      formData.append("price", values.price ? values.price.toString() : "0");
      if (values.category) formData.append("category", values.category);
      
      if (values.learning_outcomes?.length > 0) {
        values.learning_outcomes.forEach((item: string) => formData.append("learning_outcomes[]", item));
      }
      if (values.requirements?.length > 0) {
        values.requirements.forEach((item: string) => formData.append("requirements[]", item));
      }

      if (values.thumbnail) {
        formData.append("thumbnail", values.thumbnail);
      }

      let courseId = "";

      if (mode === "create") {
        const newCourse = await createCourse(formData);
        courseId = newCourse._id || newCourse.id;
        if (!courseId) throw new Error("Không lấy được ID khóa học sau khi tạo.");

        // Create lessons
        const lessons = values.lessons || [];
        if (lessons.length > 0) {
          const lessonPromises = lessons.map((l: any, index: number) => 
            createLesson({
              course_id: courseId,
              title: l.title,
              content: l.content || "",
              video_url: l.video_url || "",
              lesson_order: index + 1,
            })
          );
          await Promise.allSettled(lessonPromises);
        }
        message.success("Tạo khóa học thành công!");
      } else if (mode === "edit") {
        courseId = initialData._id || initialData.id;
        await updateCourse(courseId, formData);

        // Handle lessons logic
        const lessons = values.lessons || [];
        const lessonPromises: Promise<any>[] = [];

        // Update or create active lessons
        lessons.forEach((l: any, index: number) => {
          if (l._id) {
            lessonPromises.push(
              updateLesson(l._id, {
                title: l.title,
                content: l.content || "",
                video_url: l.video_url || "",
                lesson_order: index + 1,
              })
            );
          } else {
            lessonPromises.push(
              createLesson({
                course_id: courseId,
                title: l.title,
                content: l.content || "",
                video_url: l.video_url || "",
                lesson_order: index + 1,
              })
            );
          }
        });

        // Delete removed lessons
        deletedLessonIds.forEach((id) => {
          lessonPromises.push(deleteLesson(id));
        });

        await Promise.allSettled(lessonPromises);
        message.success("Cập nhật khóa học thành công!");
      }

      onSuccess();
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === "view";

  return (
    <Modal
      title={
        mode === "create" ? "Thêm khóa học mới" : mode === "edit" ? "Sửa khóa học" : "Chi tiết khóa học"
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={
        isReadOnly ? (
          <Button onClick={onCancel}>Đóng</Button>
        ) : (
          <>
            <Button onClick={onCancel} disabled={loading}>
              Hủy
            </Button>
            <Button type="primary" onClick={() => form.submit()} loading={loading}>
              Lưu khóa học
            </Button>
          </>
        )
      }
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish} disabled={isReadOnly}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="title"
              label="Tên khóa học"
              rules={[{ required: true, message: "Vui lòng nhập tên khóa học" }]}
            >
              <Input placeholder="Nhập tên khóa học" />
            </Form.Item>

            <Form.Item
              name="category"
              label="Thể loại"
              rules={[{ required: true, message: "Vui lòng chọn thể loại" }]}
            >
              <Select placeholder="Chọn thể loại">
                {categories.map((cat) => (
                  <Option key={cat._id} value={cat._id}>
                    {cat.category_name || cat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="price"
              label="Giá (VNĐ)"
              rules={[{ required: true, message: "Vui lòng nhập giá" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, "") : "") as any}
                placeholder="Nhập giá khóa học"
              />
            </Form.Item>

            <Form.Item name="thumbnail" label="Ảnh thu nhỏ (URL)" rules={[{ required: true, message: "Vui lòng nhập URL ảnh" }]}>
              <Input placeholder="Nhập đường dẫn URL ảnh (VD: https://...)" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả chi tiết">
            <TextArea rows={4} placeholder="Nhập mô tả khóa học..." />
          </Form.Item>

          {/* LEARNING OUTCOMES */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold mb-2">Kết quả đạt được (Learning Outcomes)</h4>
            <Form.List name="learning_outcomes">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={name}
                        rules={[{ required: true, message: "Vui lòng nhập kết quả đạt được" }]}
                      >
                        <Input placeholder="Ví dụ: Nắm vững React hooks" style={{ width: 400 }} />
                      </Form.Item>
                      {!isReadOnly && <MinusCircleOutlined onClick={() => remove(name)} />}
                    </Space>
                  ))}
                  {!isReadOnly && (
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Thêm kết quả đạt được
                      </Button>
                    </Form.Item>
                  )}
                </>
              )}
            </Form.List>
          </div>

          {/* REQUIREMENTS */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold mb-2">Yêu cầu đầu vào (Requirements)</h4>
            <Form.List name="requirements">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={name}
                        rules={[{ required: true, message: "Vui lòng nhập yêu cầu" }]}
                      >
                        <Input placeholder="Ví dụ: Biết HTML/CSS cơ bản" style={{ width: 400 }} />
                      </Form.Item>
                      {!isReadOnly && <MinusCircleOutlined onClick={() => remove(name)} />}
                    </Space>
                  ))}
                  {!isReadOnly && (
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Thêm yêu cầu
                      </Button>
                    </Form.Item>
                  )}
                </>
              )}
            </Form.List>
          </div>

          {/* LESSONS */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Danh sách Bài học</h4>
            <Form.List name="lessons">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="border border-gray-200 p-3 rounded mb-3 bg-white relative">
                      <Form.Item
                        {...restField}
                        name={[name, "title"]}
                        label="Tên bài học"
                        rules={[{ required: true, message: "Vui lòng nhập tên bài học" }]}
                      >
                        <Input placeholder="Nhập tên bài học" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "content"]}
                        label="Nội dung bài học"
                      >
                        <TextArea rows={2} placeholder="Nhập nội dung" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "video_url"]}
                        label="Video URL"
                      >
                        <Input placeholder="Nhập đường dẫn video (VD: https://youtube.com/...)" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, "_id"]} hidden>
                        <Input />
                      </Form.Item>
                      
                      {!isReadOnly && (
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          className="absolute top-2 right-2"
                          onClick={() => {
                            const lessonValues = form.getFieldValue(["lessons", name]);
                            if (lessonValues && lessonValues._id) {
                              setDeletedLessonIds([...deletedLessonIds, lessonValues._id]);
                            }
                            remove(name);
                          }}
                        >
                          Xóa bài
                        </Button>
                      )}
                    </div>
                  ))}
                  {!isReadOnly && (
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Thêm bài học mới
                      </Button>
                    </Form.Item>
                  )}
                </>
              )}
            </Form.List>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CourseFormModal;

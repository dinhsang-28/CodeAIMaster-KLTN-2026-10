import React, { useState, useEffect } from "react";
import { Modal, Table, Button, Form, Input, Checkbox, message, Space, Popconfirm, Spin, InputNumber, Row, Col } from "antd";
import { 
  getTestcasesByCodeAssignmentId, 
  updateTestcase, 
  deleteTestcase, 
  createTestcase,
  generateTestcasesByAI 
} from "../../api/excersice";
import { RobotOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import PermissionControl from "../permissionControl";

const { TextArea } = Input;

type TestcaseManagerModalProps = {
  visible: boolean;
  assignmentId: string;
  codeAssignmentId: string;
  onCancel: () => void;
};

const TestcaseManagerModal: React.FC<TestcaseManagerModalProps> = ({
  visible,
  assignmentId,
  codeAssignmentId,
  onCancel,
}) => {
  const [testcases, setTestcases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && codeAssignmentId) {
      fetchTestcases();
    } else {
      setTestcases([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, codeAssignmentId]);

  const fetchTestcases = async () => {
    setLoading(true);
    try {
      const res = await getTestcasesByCodeAssignmentId(codeAssignmentId);
      // Array fallback
      setTestcases(Array.isArray(res) ? res : res?.results || res?.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách testcases");
    } finally {
      setLoading(false);
    }
  };

  const [aiForm] = Form.useForm();

  const handleGenerateAI = async () => {
    if (!assignmentId || !codeAssignmentId) {
      message.error("Không xác định được assignment/code assignment để sinh testcase");
      return;
    }

    try {
      const values = await aiForm.validateFields();
      const payload = {
        solutionCode: values.solutionCode,
        constraints: values.constraints,
        numberOfTestCases: values.numberOfTestCases,
      };
      console.log("[generate-ai] assignmentId:", assignmentId);
      console.log("[generate-ai] codeAssignmentId:", codeAssignmentId);
      console.log("[generate-ai] body:", payload);
      setAiLoading(true);
      const res = await generateTestcasesByAI(assignmentId, payload);
      console.log("[generate-ai] response:", res);
      message.success(res?.message || "Sinh testcase bằng AI thành công!");
      await fetchTestcases();
      aiForm.resetFields();
    } catch (error: any) {
      console.error("[generate-ai] error:", error?.response?.data || error);
      message.error(error?.response?.data?.message || error.message || "Không thể sinh testcase tự động lúc này.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteTestcase(id);
      message.success("Xóa testcase thành công");
      fetchTestcases();
    } catch (error) {
      message.error("Lỗi khi xóa testcase");
    } finally {
      setLoading(false);
    }
  };

  const isEditing = (record: any) => record._id === editingId;

  const edit = (record: Partial<any> & { key: React.Key }) => {
    form.setFieldsValue({ 
      input_data: '', 
      expected_output: '', 
      is_hidden: false, 
      ...record 
    });
    setEditingId(record._id);
  };

  const cancel = () => {
    setEditingId(null);
    form.resetFields();
  };

  const save = async (id: string) => {
    try {
      const row = (await form.validateFields()) as any;
      setLoading(true);
      await updateTestcase(id, row);
      message.success("Cập nhật testcase thành công");
      setEditingId(null);
      form.resetFields();
      fetchTestcases();
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const values = (await form.validateFields()) as any;
      setCreating(true);
      await createTestcase({
        code_assignment_id: codeAssignmentId,
        input_data: values.input_data,
        expected_output: values.expected_output,
        is_hidden: values.is_hidden ?? false,
      });
      message.success("Tạo testcase thành công");
      form.resetFields();
      fetchTestcases();
    } catch (errInfo) {
      console.log('Create testcase failed:', errInfo);
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      title: 'Input',
      dataIndex: 'input_data',
      width: '30%',
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item name="input_data" style={{ margin: 0 }} rules={[{ required: true }]}>
            <TextArea rows={2} />
          </Form.Item>
        ) : (
          <pre className="text-xs bg-gray-50 p-2 rounded whitespace-pre-wrap">{record.input_data}</pre>
        );
      },
    },
    {
      title: 'Output (Expected)',
      dataIndex: 'expected_output',
      width: '30%',
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item name="expected_output" style={{ margin: 0 }} rules={[{ required: true }]}>
            <TextArea rows={2} />
          </Form.Item>
        ) : (
          <pre className="text-xs bg-gray-50 p-2 rounded whitespace-pre-wrap">{record.expected_output}</pre>
        );
      },
    },

    {
      title: 'Ẩn',
      dataIndex: 'is_hidden',
      width: '10%',
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item name="is_hidden" valuePropName="checked" style={{ margin: 0 }}>
            <Checkbox />
          </Form.Item>
        ) : (
          <Checkbox checked={record.is_hidden} disabled />
        );
      },
    },
    {
      title: 'Thao tác',
      dataIndex: 'operation',
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <PermissionControl permission="testcases_edit">
          <Space>
            <Button icon={<SaveOutlined />} type="primary" size="small" onClick={() => save(record._id)} />
            <Button icon={<CloseOutlined />} size="small" onClick={cancel} />
          </Space>
          </PermissionControl>
        ) : (
          <PermissionControl permission="testcases_delete">
          <Space>
            <Button disabled={editingId !== null} icon={<EditOutlined />} size="small" onClick={() => edit(record)} />
            <Popconfirm title="Chắc chắn xóa?" onConfirm={() => handleDelete(record._id)}>
              <Button disabled={editingId !== null} icon={<DeleteOutlined />} danger size="small" />
            </Popconfirm>
          </Space>
          </PermissionControl>
        );
      },
    },
  ];

  const hasCodeAssignment = Boolean(codeAssignmentId);

  return (
    <Modal
      title={
        <div className="flex items-center justify-between pr-8">
          <span>Quản lý Testcases</span>
          <PermissionControl permission="testcases_create">
          <Button 
            type="primary" 
            icon={<RobotOutlined />} 
            loading={aiLoading} 
            onClick={handleGenerateAI}
            disabled={!hasCodeAssignment}
            style={{ background: '#3a5a40', borderColor: '#3a5a40' }}
          >
            Tạo tự động bằng AI
          </Button>
          </PermissionControl>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>
      ]}
    >
      <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-4 text-sm">
        <strong>Lưu ý:</strong> Testcase được gắn theo code assignment. Nếu chưa có dữ liệu, hãy tạo code assignment trước hoặc dùng AI để sinh testcase từ đề bài.
      </div>

      {!hasCodeAssignment ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Bài tập này chưa có code assignment hợp lệ nên chưa thể quản lý testcase.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
            <h4 className="mb-3 font-semibold text-violet-900">Tạo testcase tự động bằng AI</h4>
            <Form form={aiForm} layout="vertical">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="solutionCode" label="Solution code mẫu / lời giải chuẩn" rules={[{ required: true, message: 'Nhập solution code' }]}>
                    <TextArea rows={5} placeholder="function solve() { ... }" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={16}>
                  <Form.Item name="constraints" label="Constraints" rules={[{ required: true, message: 'Nhập constraints' }]}>
                    <TextArea rows={3} placeholder="1 <= n <= 1e5" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={4}>
                  <Form.Item name="numberOfTestCases" label="Số testcase" initialValue={5} rules={[{ required: true }]}>
                    <InputNumber min={1} max={50} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={4}>
                  <Form.Item name="hiddenCount" label="Hidden testcase" initialValue={3} rules={[{ required: true }]}>
                    <InputNumber min={0} max={50} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <div className="flex justify-end">
                <PermissionControl permission="testcases_create">
                <Button type="primary" loading={aiLoading} onClick={handleGenerateAI} icon={<RobotOutlined />} style={{ background: '#6d28d9', borderColor: '#6d28d9' }}>
                  Tạo tự động bằng AI
                </Button>
                </PermissionControl>
              </div>
            </Form>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-3 font-semibold text-slate-800">Thêm testcase thủ công</h4>
            <Form form={form} layout="vertical">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item name="input_data" label="Input" rules={[{ required: true, message: 'Nhập input' }]}>
                  <TextArea rows={4} placeholder="Nhập input testcase" />
                </Form.Item>
                <Form.Item name="expected_output" label="Expected Output" rules={[{ required: true, message: 'Nhập output' }]}>
                  <TextArea rows={4} placeholder="Nhập output mong đợi" />
                </Form.Item>
                <Form.Item name="is_hidden" valuePropName="checked" label="Ẩn testcase">
                  <Checkbox />
                </Form.Item>
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={() => form.resetFields()}>Xóa form</Button>
                <PermissionControl permission="testcases_create">
                <Button type="primary" loading={creating} onClick={handleCreate} style={{ background: '#3a5a40', borderColor: '#3a5a40' }}>
                  Lưu testcase
                </Button>
                </PermissionControl>
              </div>
            </Form>
          </div>

          <Spin spinning={loading}>
            <Form form={form} component={false}>
              <Table
                components={{
                  body: {
                    cell: (props: any) => <td {...props}>{props.children}</td>,
                  },
                }}
                bordered
                dataSource={testcases}
                columns={columns}
                rowClassName="editable-row"
                pagination={false}
                rowKey="_id"
                scroll={{ y: 400 }}
              />
            </Form>
          </Spin>
        </div>
      )}
    </Modal>
  );
};

export default TestcaseManagerModal;

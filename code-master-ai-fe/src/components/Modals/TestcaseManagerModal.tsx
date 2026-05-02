import React, { useState, useEffect } from "react";
import { Modal, Table, Button, Form, Input, Checkbox, message, Space, Popconfirm, Spin } from "antd";
import { 
  getTestcasesByCodeAssignmentId, 
  updateTestcase, 
  deleteTestcase, 
  generateTestcasesByAI 
} from "../../api/excersice";
import { RobotOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";

const { TextArea } = Input;

type TestcaseManagerModalProps = {
  visible: boolean;
  codeAssignmentId: string;
  onCancel: () => void;
};

const TestcaseManagerModal: React.FC<TestcaseManagerModalProps> = ({
  visible,
  codeAssignmentId,
  onCancel,
}) => {
  const [testcases, setTestcases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const handleGenerateAI = async () => {
    setAiLoading(true);
    try {
      // Gọi API sinh testcase bằng AI
      await generateTestcasesByAI(codeAssignmentId, { 
        // Có thể truyền thêm context nếu API yêu cầu
        prompt: "Generate standard testcases for this assignment"
      });
      message.success("Sinh testcase bằng AI thành công!");
      fetchTestcases();
    } catch (error) {
      message.error("Không thể sinh testcase tự động lúc này.");
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
  };

  const save = async (id: string) => {
    try {
      const row = (await form.validateFields()) as any;
      setLoading(true);
      await updateTestcase(id, row);
      message.success("Cập nhật testcase thành công");
      setEditingId(null);
      fetchTestcases();
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    } finally {
      setLoading(false);
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
          <Space>
            <Button icon={<SaveOutlined />} type="primary" size="small" onClick={() => save(record._id)} />
            <Button icon={<CloseOutlined />} size="small" onClick={cancel} />
          </Space>
        ) : (
          <Space>
            <Button disabled={editingId !== null} icon={<EditOutlined />} size="small" onClick={() => edit(record)} />
            <Popconfirm title="Chắc chắn xóa?" onConfirm={() => handleDelete(record._id)}>
              <Button disabled={editingId !== null} icon={<DeleteOutlined />} danger size="small" />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center justify-between pr-8">
          <span>Quản lý Testcases</span>
          <Button 
            type="primary" 
            icon={<RobotOutlined />} 
            loading={aiLoading} 
            onClick={handleGenerateAI}
            style={{ background: '#3a5a40', borderColor: '#3a5a40' }}
          >
            Tạo tự động bằng AI
          </Button>
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
        <strong>Lưu ý:</strong> Chức năng tạo testcase thủ công tạm thời không được hỗ trợ. Vui lòng sử dụng AI để tự động phân tích đề bài và sinh testcase. Bạn có thể sửa đổi testcase sau khi AI đã tạo.
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
    </Modal>
  );
};

export default TestcaseManagerModal;

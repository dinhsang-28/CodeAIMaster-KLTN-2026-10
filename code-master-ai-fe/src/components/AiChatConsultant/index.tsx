import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Input, Button, Avatar, Spin, Tooltip, Badge } from 'antd';
import { RobotOutlined, SendOutlined, CloseOutlined, MessageOutlined } from '@ant-design/icons';
import { PostChatConsultant } from '../../api/auth'; 

type Message = {
  role: 'user' | 'model';
  text: string;
};

const formatAiMessage = (text: string) => {
  let formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #2c4430; font-weight: 800;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*)/gm, '• $1')
    .replace(/\n/g, '<br/>');

  return { __html: formattedText };
};

export default function FloatingAiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: 'Chào bạn! Mình là AI tư vấn của CodeMaster. Bạn cần hỗ trợ lộ trình học hay thông tin khóa học nào?' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newUserMsg: Message = { role: 'user', text: inputText };
    const currentHistory = [...messages]; 
    
    setMessages([...currentHistory, newUserMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyToSend = currentHistory
        .slice(1)
        .filter(msg => !msg.text.includes('Xin lỗi, hệ thống AI đang hơi bận'));

      const res = await PostChatConsultant({
        chatHistory: historyToSend,
        newMessage: newUserMsg.text
      });

      if (res && res.success) {
        setMessages(prev => [...prev, { role: 'model', text: res.reply }]);
      }
    } catch (error: any) {
      console.error("Lỗi từ Backend:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'Xin lỗi, hệ thống AI đang hơi bận. Bạn vui lòng thử lại sau nhé!' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderedMessages = useMemo(() => {
    return messages.map((msg, index) => (
      <div key={index} className={`flex w-full gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        
        {msg.role === 'model' && (
          <Avatar size={28} icon={<RobotOutlined />} className="mt-1 bg-[#3a5a40] flex-shrink-0" />
        )}
        
        {msg.role === 'user' ? (
          <div className="max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-[#3a5a40] px-4 py-2.5 text-[14.5px] leading-relaxed text-white shadow-sm">
            {msg.text}
          </div>
        ) : (
          <div 
            className="max-w-[85%] break-words rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-4 py-2.5 text-[14.5px] leading-relaxed text-gray-800 shadow-sm"
            dangerouslySetInnerHTML={formatAiMessage(msg.text)}
          />
        )}
      </div>
    ));
  }, [messages]); 

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      
      <div 
        className={`mb-4 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-300 origin-bottom-right ${
          isOpen ? 'h-[550px] w-[360px] scale-100 opacity-100' : 'h-0 w-0 scale-0 opacity-0'
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#3a5a40] to-[#588157] px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <Avatar size={36} icon={<RobotOutlined />} className="bg-white/20 text-white" />
            <div>
              <h3 className="m-0 text-[15px] font-bold text-white">CodeMaster AI</h3>
              <p className="m-0 text-[11px] text-green-100">Đang hoạt động</p>
            </div>
          </div>
          <Button 
            type="text" 
            icon={<CloseOutlined className="text-white text-lg" />} 
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/10"
          />
        </div>

        {/* BODY */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto bg-[#f8fafc] p-4">
          <div className="flex flex-col gap-4">
            
            {renderedMessages}
            
            {isLoading && (
              <div className="flex w-full justify-start gap-2">
                <Avatar size={28} icon={<RobotOutlined />} className="mt-1 bg-[#3a5a40] flex-shrink-0" />
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-4 py-2 shadow-sm">
                  <Spin size="small" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-200 bg-white p-3">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập câu hỏi..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onPressEnter={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              disabled={isLoading}
              className="rounded-full !bg-gray-50 hover:!bg-white focus:!bg-white text-[14.5px]"
            />
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={isLoading}
              className="flex flex-shrink-0 items-center justify-center border-none !bg-[#3a5a40] shadow-md hover:!bg-[#2c4430]"
            />
          </div>
        </div>
      </div>

      {/* --- NÚT BẤM NỔI (FAB) --- */}
      <Tooltip title="Chat với AI Tư Vấn" placement="left">
        <Badge dot={!isOpen} color="red" offset={[-5, 5]}>
          <Button 
            type="primary" 
            shape="circle" 
            size="large"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-14 w-14 items-center justify-center !bg-[#3a5a40] shadow-2xl hover:!bg-[#2c4430] hover:scale-105 transition-transform border-none"
          >
            {isOpen ? <CloseOutlined className="text-xl" /> : <MessageOutlined className="text-2xl" />}
          </Button>
        </Badge>
      </Tooltip>
      
    </div>
  );
}
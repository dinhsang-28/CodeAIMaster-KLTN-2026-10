import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Input, Button, Avatar, Tooltip, Badge } from 'antd';
import { RobotOutlined, SendOutlined, CloseOutlined, MessageOutlined } from '@ant-design/icons';
import { PostChatConsultant } from '../../api/auth'; 
import { useUserInfo } from '../../store/user';

type Message = {
  role: 'user' | 'model';
  text: string;
};

const formatAiMessage = (text: string) => {
  let formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#2c4430] font-extrabold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
    .replace(/^- (.*)/gm, '<div class="flex items-start gap-2 mb-1"><span class="text-[#3a5a40] mt-0.5">•</span><span>$1</span></div>')
    .replace(/\n/g, '<div class="h-1.5"></div>'); // Thay <br> bằng div tạo khoảng cách dễ thở hơn

  return { __html: formattedText };
};

export default function FloatingAiChat() {
  const currentUser = useUserInfo((state) => state.userInfo);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: 'Chào bạn! 👋\nMình là AI tư vấn của CodeMaster. Mình có thể giúp gì cho lộ trình học của bạn hôm nay?' 
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
        newMessage: newUserMsg.text,
        currentUser: currentUser
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
      <div 
        key={index} 
        className={`flex w-full gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
      >
        {msg.role === 'model' && (
          <Avatar 
            size={32} 
            icon={<RobotOutlined />} 
            className="mt-1 flex-shrink-0 bg-gradient-to-b from-[#4a7251] to-[#3a5a40] shadow-sm" 
          />
        )}
        
        {msg.role === 'user' ? (
          <div className="max-w-[75%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-[4px] bg-gradient-to-br from-[#4a7251] to-[#3a5a40] px-4 py-3 text-[14.5px] leading-relaxed text-white shadow-md">
            {msg.text}
          </div>
        ) : (
          <div 
            className="max-w-[80%] break-words rounded-2xl rounded-tl-[4px] border border-gray-100 bg-white px-4 py-3 text-[14.5px] leading-relaxed text-gray-700 shadow-sm"
            dangerouslySetInnerHTML={formatAiMessage(msg.text)}
          />
        )}
      </div>
    ));
  }, [messages]); 

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      
      {/* --- KHUNG CHAT --- */}
      <div 
        className={`mb-4 flex flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right ${
          isOpen ? 'h-[580px] w-[380px] scale-100 opacity-100 translate-y-0' : 'h-0 w-0 scale-50 opacity-0 translate-y-10'
        }`}
      >
        {/* HEADER HIỆN ĐẠI */}
        <div className="flex items-center justify-between bg-white px-5 py-4 border-b border-gray-100 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar size={40} icon={<RobotOutlined />} className="bg-[#3a5a40] text-white" />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
            </div>
            <div>
              <h3 className="m-0 text-[16px] font-extrabold text-gray-800 tracking-tight">CodeMaster AI</h3>
              <p className="m-0 text-[12px] font-medium text-green-600">Sẵn sàng hỗ trợ</p>
            </div>
          </div>
          <Button 
            type="text" 
            shape="circle"
            icon={<CloseOutlined className="text-gray-400 text-lg" />} 
            onClick={() => setIsOpen(false)}
            className="hover:bg-gray-100 hover:text-gray-600 flex items-center justify-center"
          />
        </div>

        {/* BODY TÙY CHỈNH SCROLLBAR */}
        <div 
          ref={chatContainerRef} 
          className="flex-1 overflow-y-auto bg-[#f8fafc] p-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300"
        >
          <div className="flex flex-col gap-5">
            {/* Lời chào mừng mờ nhạt ở trên cùng */}
            <div className="text-center text-xs text-gray-400 font-medium my-2">
              Hôm nay, {new Date().toLocaleDateString('vi-VN')}
            </div>

            {renderedMessages}
            
            {/* HIỆU ỨNG TYPING 3 DẤU CHẤM */}
            {isLoading && (
              <div className="flex w-full justify-start gap-2.5 animate-fade-in-up">
                <Avatar size={32} icon={<RobotOutlined />} className="mt-1 flex-shrink-0 bg-[#3a5a40]" />
                <div className="flex h-[42px] items-center gap-1.5 rounded-2xl rounded-tl-[4px] border border-gray-100 bg-white px-4 shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER - KHUNG NHẬP LIỆU KIỂU PILL */}
        <div className="bg-white p-4 pt-3 z-10">
          <div className="relative flex items-center rounded-full bg-gray-50 border border-gray-200 px-2 py-1.5 focus-within:border-[#3a5a40] focus-within:ring-1 focus-within:ring-[#3a5a40]/20 transition-all">
            <Input
              placeholder="Hỏi AI bất cứ điều gì..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onPressEnter={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              disabled={isLoading}
              className="flex-1 border-none bg-transparent hover:bg-transparent focus:bg-transparent shadow-none !outline-none px-3 text-[14.5px]"
            />
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined className={inputText.trim() ? "text-white" : "text-white/70"} />}
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center border-none shadow-md transition-all ${
                inputText.trim() && !isLoading ? '!bg-[#3a5a40] hover:!bg-[#2c4430] hover:scale-105' : '!bg-gray-300'
              }`}
            />
          </div>
          {/* Dòng credit nhỏ xíu phía dưới */}
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400">Được hỗ trợ bởi CodeMaster AI</span>
          </div>
        </div>
      </div>

      {/* --- NÚT BẤM NỔI (FAB) VỚI HIỆU ỨNG TỎA SÓNG --- */}
      <Tooltip title="Tư vấn cùng AI" placement="left">
        <div className="relative">
          {/* Hiệu ứng sóng lan tỏa mờ phía sau */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full bg-[#3a5a40] animate-ping opacity-20"></div>
          )}
          
          <Badge dot={!isOpen} color="#ef4444" offset={[-5, 5]}>
            <Button 
              type="primary" 
              shape="circle" 
              onClick={() => setIsOpen(!isOpen)}
              className="relative flex h-14 w-14 items-center justify-center !bg-[#3a5a40] shadow-[0_8px_20px_rgba(58,90,64,0.3)] hover:!bg-[#2c4430] hover:scale-110 transition-all duration-300 border-none"
            >
              {isOpen ? (
                <CloseOutlined className="text-xl text-white" />
              ) : (
                <MessageOutlined className="text-2xl text-white" />
              )}
            </Button>
          </Badge>
        </div>
      </Tooltip>
      
    </div>
  );
}
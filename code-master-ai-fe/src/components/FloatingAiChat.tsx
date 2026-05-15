import React, { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Badge, Button, Input, Tooltip } from "antd";
import {
  CloseOutlined,
  MessageOutlined,
  RobotOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { PostChatConsultant } from "../api/auth";
import { useUserInfo } from "../store/user";

type Message = {
  role: "user" | "model";
  text: string;
};

const formatAiMessage = (text: string) => {
  const formattedText = text
    .replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-extrabold text-[#2c4430]">$1</strong>',
    )
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
    .replace(
      /^- (.*)/gm,
      '<div class="mb-1 flex items-start gap-2"><span class="mt-0.5 text-[#3a5a40]">•</span><span>$1</span></div>',
    )
    .replace(/\n/g, '<div class="h-1.5"></div>');

  return { __html: formattedText };
};

export default function FloatingAiChat() {
  const currentUser = useUserInfo((state) => state.userInfo);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Chào bạn!\nMình là AI tư vấn của CodeMaster. Mình có thể hỗ trợ gì cho lộ trình học của bạn hôm nay?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newUserMsg: Message = { role: "user", text: inputText };
    const currentHistory = [...messages];

    setMessages([...currentHistory, newUserMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const historyToSend = currentHistory
        .slice(1)
        .filter((msg) => !msg.text.includes("Xin lỗi, hệ thống AI đang hơi bận"));

      const res = await PostChatConsultant({
        chatHistory: historyToSend,
        newMessage: newUserMsg.text,
        currentUser,
      });

      if (res && res.success) {
        setMessages((prev) => [...prev, { role: "model", text: res.reply }]);
      }
    } catch (error: any) {
      console.error("Lỗi từ Backend:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Xin lỗi, hệ thống AI đang hơi bận. Bạn vui lòng thử lại sau nhé!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderedMessages = useMemo(() => {
    return messages.map((msg, index) => (
      <div
        key={index}
        className={`animate-fade-in-up flex w-full gap-2.5 ${
          msg.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        {msg.role === "model" && (
          <Avatar
            size={32}
            icon={<RobotOutlined />}
            className="mt-1 flex-shrink-0 bg-gradient-to-b from-[#4a7251] to-[#3a5a40] shadow-sm"
          />
        )}

        {msg.role === "user" ? (
          <div className="max-w-[82%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-[4px] bg-gradient-to-br from-[#4a7251] to-[#3a5a40] px-4 py-3 text-[14px] leading-relaxed text-white shadow-md sm:max-w-[75%]">
            {msg.text}
          </div>
        ) : (
          <div
            className="max-w-[88%] break-words rounded-2xl rounded-tl-[4px] border border-gray-100 bg-white px-4 py-3 text-[14px] leading-relaxed text-gray-700 shadow-sm sm:max-w-[80%]"
            dangerouslySetInnerHTML={formatAiMessage(msg.text)}
          />
        )}
      </div>
    ));
  }, [messages]);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] flex flex-col items-stretch font-sans sm:bottom-6 sm:left-auto sm:right-6 sm:items-end">
      <div
        className={`mb-3 flex origin-bottom-right flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:mb-4 ${
          isOpen
            ? "pointer-events-auto h-[min(78vh,640px)] w-[calc(100vw-32px)] translate-y-0 scale-100 opacity-100 sm:h-[580px] sm:w-[380px]"
            : "pointer-events-none h-0 w-0 translate-y-10 scale-95 opacity-0"
        }`}
      >
        <div className="z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 shadow-sm sm:px-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar
                size={40}
                icon={<RobotOutlined />}
                className="bg-[#3a5a40] text-white"
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            </div>
            <div>
              <h3 className="m-0 text-[16px] font-extrabold tracking-tight text-gray-800">
                CodeMaster AI
              </h3>
              <p className="m-0 text-[12px] font-medium text-green-600">
                Sẵn sàng hỗ trợ
              </p>
            </div>
          </div>
          <Button
            type="text"
            shape="circle"
            icon={<CloseOutlined className="text-lg text-gray-400" />}
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center hover:bg-gray-100 hover:text-gray-600"
          />
        </div>

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 sm:p-5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar]:w-1.5"
        >
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="my-2 text-center text-xs font-medium text-gray-400">
              Hôm nay, {new Date().toLocaleDateString("vi-VN")}
            </div>

            {renderedMessages}

            {isLoading && (
              <div className="animate-fade-in-up flex w-full justify-start gap-2.5">
                <Avatar
                  size={32}
                  icon={<RobotOutlined />}
                  className="mt-1 flex-shrink-0 bg-[#3a5a40]"
                />
                <div className="flex h-[42px] items-center gap-1.5 rounded-2xl rounded-tl-[4px] border border-gray-100 bg-white px-4 shadow-sm">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="z-10 bg-white p-4 pt-3">
          <div className="relative flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1.5 transition-all focus-within:border-[#3a5a40] focus-within:ring-1 focus-within:ring-[#3a5a40]/20">
            <Input
              placeholder="Hỏi AI bất cứ điều gì..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onPressEnter={(e) => {
                e.preventDefault();
                void handleSendMessage();
              }}
              disabled={isLoading}
              className="!outline-none flex-1 border-none bg-transparent px-3 text-[14px] shadow-none hover:bg-transparent focus:bg-transparent"
            />
            <Button
              type="primary"
              shape="circle"
              icon={
                <SendOutlined
                  className={inputText.trim() ? "text-white" : "text-white/70"}
                />
              }
              onClick={() => void handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center border-none shadow-md transition-all ${
                inputText.trim() && !isLoading
                  ? "!bg-[#3a5a40] hover:!bg-[#2c4430] hover:scale-105"
                  : "!bg-gray-300"
              }`}
            />
          </div>
          <div className="mt-2 text-center">
            <span className="text-[10px] text-gray-400">
              Được hỗ trợ bởi CodeMaster AI
            </span>
          </div>
        </div>
      </div>

      <Tooltip title="Tư vấn cùng AI" placement="left">
        <div className="relative self-end">
          {!isOpen && (
            <div className="absolute inset-0 animate-ping rounded-full bg-[#3a5a40] opacity-20" />
          )}

          <Badge dot={!isOpen} color="#ef4444" offset={[-5, 5]}>
            <Button
              type="primary"
              shape="circle"
              onClick={() => setIsOpen((prev) => !prev)}
              className="relative flex h-14 w-14 items-center justify-center border-none !bg-[#3a5a40] shadow-[0_8px_20px_rgba(58,90,64,0.3)] transition-all duration-300 hover:scale-110 hover:!bg-[#2c4430]"
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

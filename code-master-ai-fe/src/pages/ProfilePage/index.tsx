import React, { useState, useEffect, useRef } from "react";
import { useUserInfo } from "../../store/user";
import { UpdateMyProfile } from "../../api/admin/user"; // Đường dẫn file API ở trên

const ProfilePage: React.FC = () => {
    // Lấy thông tin user hiện tại từ Zustand
    const { userInfo, setUserInfo } = useUserInfo((state) => state);
    
    const [formData, setFormData] = useState({ name: "", phone: "", address: "", password: "" });
    const [previewImage, setPreviewImage] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Đổ dữ liệu từ Zustand vào form khi trang load
    useEffect(() => {
        if (userInfo) {
            setFormData({
                name: userInfo.name || "",
                phone: userInfo.phone || "",
                address: userInfo.address || "",
                password: "", // Luôn để trống pass
            });
            setPreviewImage(userInfo.image || "https://via.placeholder.com/150");
        }
    }, [userInfo]);

    const showNotification = (type: 'success' | 'error', msg: string) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 3000);
    };

    // Xử lý chọn ảnh
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file)); // Preview ảnh ảo
        }
    };

    // Gửi dữ liệu lên Backend
    const handleSaveProfile = async () => {
        if (!formData.name.trim()) return showNotification("error", "Tên không được để trống!");
        
        setIsSaving(true);
        try {
            // Dùng FormData vì có upload File
            const submitData = new FormData();
            submitData.append("name", formData.name);
            if (formData.phone) submitData.append("phone", formData.phone);
            if (formData.address) submitData.append("address", formData.address);
            if (formData.password) submitData.append("password", formData.password);
            if (selectedFile) {
                submitData.append("image", selectedFile); // key 'image' phải khớp với FileInterceptor backend
            }

            const response = await UpdateMyProfile(submitData);
            
            showNotification("success", "Cập nhật hồ sơ thành công!");
            
            // Cập nhật lại Zustand bằng data mới trả về để Header đổi Avatar/Tên ngay lập tức
            if (response.user) {
               setUserInfo({
                    ...userInfo,
                   
                    name: response.user.name,
                    phone: response.user.phone,
                    address: response.user.address,
                    image: response.user.image,
                }as any);
            }
            setFormData(prev => ({ ...prev, password: "" })); // Xóa ô pass
        } catch (error: any) {
            showNotification("error", error.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl p-6">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Hồ Sơ Của Tôi</h2>

            {notification && (
                <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {notification.msg}
                </div>
            )}

            <div className="grid gap-8 md:grid-cols-3">
                {/* Cột Trái: Ảnh Đại Diện */}
                <div className="flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-gray-50 shadow-md">
                        <img src={previewImage} alt="Avatar" className="h-full w-full object-cover" />
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-white opacity-0 transition-opacity hover:opacity-100"
                        >
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                    <p className="text-sm text-gray-500">Bấm vào ảnh để thay đổi</p>
                    {/* <span className="mt-4 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-200">
                        {/* {userInfo?.role_id?.role_name || "Thành viên"} */}
                    {/* </span> */} */
                </div>

                {/* Cột Phải: Thông tin Form */}
                <div className="md:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Họ và Tên</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                        </div>

                        {/* Ô EMAIL BỊ KHÓA */}
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Email đăng nhập</label>
                            <input 
                                type="email" 
                                value={userInfo?.email || ""} 
                                disabled 
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" 
                            />
                            <p className="mt-1 text-xs text-gray-400">Email là định danh duy nhất, không thể thay đổi.</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Số điện thoại</label>
                            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                        </div> 
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button 
                            onClick={handleSaveProfile} 
                            disabled={isSaving}
                            className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-95 disabled:bg-brand-400"
                        >
                            {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
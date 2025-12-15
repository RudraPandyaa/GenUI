import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiCamera } from "react-icons/fi";

// const BASE_URL = "https://genui-9lkq.onrender.com/api/auth";
const BASE_URL = "http://localhost:5000/api/auth";
const SetupProfile = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) navigate("/login");
    else setToken(t);
  }, [navigate]);

  const handleFileSelect = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!image) return toast.error("Please select an image");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("profilePic", image);

      const res = await fetch(`${BASE_URL}/upload-profile-pic`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("profileComplete", "true");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.profilePic = data.imageUrl;
      user.isProfileComplete = true;

      localStorage.setItem("user", JSON.stringify(user));
      toast.success("Profile updated");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const skipProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/skip-profile-pic`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("profileComplete", "true");

        toast.success("Profile setup skipped");
        navigate("/");
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141319] text-white">
      <div className="w-full max-w-sm bg-[#0b0b10] rounded-2xl p-8 flex flex-col items-center shadow-xl">

        {/* Avatar */}
        <div
          onClick={() => fileRef.current.click()}
          className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-purple-500 cursor-pointer group"
        >
          <img
            src={
              preview ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            // alt="avatar"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <FiCamera size={28} />
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFileSelect(e.target.files[0])}
        />

        {/* Text */}
        <h2 className="text-xl font-semibold mt-6">Set your profile picture</h2>
        <p className="text-sm text-gray-400 text-center mt-1">
          This helps personalize your account
        </p>

        {/* Actions */}
        <button
          onClick={uploadImage}
          disabled={loading}
          className="mt-6 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition font-medium disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>

        <button
          onClick={skipProfile}
          className="mt-4 text-sm text-gray-400 hover:underline"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default SetupProfile;
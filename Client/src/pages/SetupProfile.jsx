import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://genui-9lkq.onrender.com/api/auth";
// const BASE_URL = "http://localhost:5000/api/auth";

const SetupProfile = () => {
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null); // ✅ FIX

  // ✅ Auth check (runs once)
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/login");
    } else {
      setToken(storedToken);
    }
  }, [navigate]);

  const uploadImage = async () => {
    if (!image) {
      toast.error("Please select an image");
      return;
    }

    if (!token) {
      toast.error("Authentication failed. Please login again.");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", image);

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/upload-profile-pic`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ NOW ACTUALLY VALID
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      localStorage.setItem("profileComplete", "true");
      toast.success("Profile updated successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const skipProfile = async () => {
    if (!token) {
      toast.error("Authentication failed. Please login again.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/skip-profile-pic`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");

      localStorage.setItem("profileComplete", "true");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141319] text-white">
      <div className="bg-[#09090B] p-8 rounded-xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-2">Set Profile Picture</h2>
        <p className="text-gray-400 mb-6">Complete your profile to continue</p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="mb-4"
        />

        <button
          onClick={uploadImage}
          disabled={loading}
          className="w-full py-3 bg-purple-600 rounded-lg mb-3 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload & Continue"}
        </button>

        <button
          onClick={skipProfile}
          className="w-full text-sm text-gray-400 hover:underline"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default SetupProfile;
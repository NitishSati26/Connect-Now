import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Calendar, Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();

  const handleImageUpload = (e) => {
    // e.preventDefault();

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="min-h-screen flex flex-col pt-16 bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="max-w-2xl w-full p-4">
          <button
            className="flex items-center gap-2 mb-6 text-base-content/70 hover:text-primary transition-colors"
            onClick={() => navigate("/app")}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl p-6 w-full shadow-2xl border border-base-content/10 relative max-h-[90vh] overflow-y-auto">
            {/* Account Status Badge - Top Right */}
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-success/20 text-success font-semibold rounded-full text-sm border border-success/30">
              <Shield className="w-4 h-4" />
              Active
            </div>

            {/* Header Section */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-full mb-3 shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Profile
              </h1>
              <p className="mt-1 text-base-content/70 font-medium text-sm">
                Manage your account information
              </p>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <img
                  src={selectedImg || authUser.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="relative size-24 rounded-full object-cover border-4 border-base-100 shadow-xl group-hover:scale-105 transition-transform duration-300"
                />
                <label
                  htmlFor="avatar-upload"
                  className={`
                  absolute bottom-0 right-0 
                  bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110
                  ${
                    isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                  }
                `}
                >
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>
              <p className="text-xs text-base-content/60 font-medium">
                {isUpdatingProfile
                  ? "Uploading..."
                  : "Click the camera icon to update your photo"}
              </p>
            </div>

            {/* Profile Information */}
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <div className="text-sm text-base-content/60 flex items-center gap-2 font-medium">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  Full Name
                </div>
                <div className="bg-base-200/50 backdrop-blur-sm rounded-xl p-3 border border-base-content/10 hover:border-primary/30 transition-colors duration-300">
                  <p className="font-semibold text-base-content">
                    {authUser?.fullName}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-base-content/60 flex items-center gap-2 font-medium">
                  <div className="p-1.5 bg-secondary/10 rounded-lg">
                    <Mail className="w-4 h-4 text-secondary" />
                  </div>
                  Email Address
                </div>
                <div className="bg-base-200/50 backdrop-blur-sm rounded-xl p-3 border border-base-content/10 hover:border-secondary/30 transition-colors duration-300">
                  <p className="font-semibold text-base-content">
                    {authUser?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Joined Since Section */}
            <div className="border-t border-base-content/20 pt-4">
              <div className="flex items-center justify-between p-3 bg-base-200/30 rounded-xl border border-base-content/10 hover:border-accent/30 transition-colors duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-base-content/10 rounded-lg">
                    <Calendar className="w-4 h-4 text-base-content/60" />
                  </div>
                  <span className="font-medium text-sm">Joined Since</span>
                </div>
                <span className="font-semibold text-primary text-sm">
                  {authUser.createdAt?.split("T")[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

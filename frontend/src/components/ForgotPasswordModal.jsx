import { useState } from "react";
import { X, Eye, EyeOff, Lock, Mail, Shield, AlertCircle } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ForgotPasswordModal = ({ onClose, email }) => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    // Password validation (same as signup)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      toast.error(
        "Password must:\n" +
          "- Be at least 8 characters\n" +
          "- Include one uppercase letter\n" +
          "- Include one lowercase letter\n" +
          "- Include one special character"
      );
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/auth/reset-password", {
        email: email,
        newPassword: formData.newPassword,
      });

      if (response.data.success) {
        toast.success("Password reset successfully!");
        onClose();
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-base-300/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md transform transition-all border border-base-300">
        {/* Header with Icon */}
        <div className="relative p-6 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">
                Reset Password
              </h2>
              <p className="text-sm text-base-content/60">
                Create a new secure password
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-base-200 hover:bg-base-300 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-base-content/60" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Email Display (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-base-content mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                className="input input-bordered w-full pl-10 bg-base-200 text-base-content/70"
                readOnly
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-base-content mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="input input-bordered w-full pl-10 pr-12"
                placeholder="Enter new password"
                minLength={8}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-base-200 transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff size={18} className="text-base-content/60" />
                ) : (
                  <Eye size={18} className="text-base-content/60" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-base-content mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="input input-bordered w-full pl-10 pr-12"
                placeholder="Confirm new password"
                minLength={8}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-base-200 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} className="text-base-content/60" />
                ) : (
                  <Eye size={18} className="text-base-content/60" />
                )}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm text-base-content">
                <p className="font-medium mb-1">Password Requirements:</p>
                <ul className="space-y-1 text-xs text-base-content/70">
                  <li>• At least 8 characters</li>
                  <li>• One uppercase letter (A-Z)</li>
                  <li>• One lowercase letter (a-z)</li>
                  <li>• One special character (!@#$%^&*)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex-1"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  Resetting...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;

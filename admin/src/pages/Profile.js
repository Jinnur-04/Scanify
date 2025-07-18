import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { toast } from 'react-toastify';

function MyProfile() {
  const token = localStorage.getItem('token');
  const staffId = localStorage.getItem('staffId');

  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirm: '',
  });

  // Fetch user details
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/staff/${staffId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      localStorage.setItem('uname', res.data.name);
      if (res.data.profileImageUrl) {
        localStorage.setItem('photo', res.data.profileImageUrl);
      }
    } catch (err) {
      toast.error('❌ Failed to fetch profile');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [staffId, token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async () => {
    if (!photoFile) return toast.warning('⚠️ Choose a photo first');

    const formData = new FormData();
    formData.append('photo', photoFile);

    try {
      const res = await axios.patch(`/staff/${staffId}/photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('✅ Profile photo updated');

      // Update image and name locally
      const newPhoto = res.data.photo || '';
      localStorage.setItem('photo', newPhoto);

      // Refresh updated profile
      await fetchProfile();

      setPhotoFile(null);
      setPreview(null);
    } catch (err) {
      console.error('❌ Upload error:', err);
      toast.error('❌ Failed to update photo');
    }
  };

  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirm } = passwords;

    if (newPassword !== confirm) {
      return toast.warning("⚠️ Passwords don't match");
    }

    try {
      await axios.patch(
        `/staff/${staffId}/password`,
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('✅ Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error('❌ Incorrect current password');
    }
  };

  if (!user) {
    return <p className="text-center mt-4">Loading profile...</p>;
  }

  return (
    <div className="container py-4">
      <h2 className="text-center text-primary mb-4">My Profile</h2>

      <div className="card shadow p-4">
        <div className="row align-items-center">
          {/* Profile Image + Upload */}
          <div className="col-md-3 text-center mb-3">
            <img
              src={preview || user.profileImageUrl || '/img/undraw_profile.svg'}
              className="img-fluid rounded-circle border"
              style={{ width: '130px', height: '130px', objectFit: 'cover' }}
              alt="Profile"
            />
            <div className="custom-file mt-3">
              <input
                type="file"
                className="custom-file-input"
                id="customFile"
                accept="image/*"
                onChange={handleImageChange}
              />
              <label className="custom-file-label" htmlFor="customFile">
                {photoFile ? photoFile.name : 'Choose new photo'}
              </label>
            </div>
            <button
              className="btn btn-sm btn-outline-primary mt-2"
              onClick={uploadPhoto}
            >
              Upload Photo
            </button>
          </div>

          {/* Profile Details */}
          <div className="col-md-9">
            <h4 className="text-dark">{user.name}</h4>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Status:</strong> {user.status}</p>
            {user.billsHandled !== undefined && (
              <p><strong>Bills Handled:</strong> {user.billsHandled}</p>
            )}
            <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Password Section */}
        <hr className="my-4" />
        <h5 className="mb-3">Change Password</h5>
        <div className="row">
          {['Current Password', 'New Password', 'Confirm Password'].map((label, i) => {
            const keys = ['currentPassword', 'newPassword', 'confirm'];
            return (
              <div className="col-md-4 mb-3" key={keys[i]}>
                <input
                  type="password"
                  className="form-control"
                  placeholder={label}
                  value={passwords[keys[i]]}
                  onChange={(e) =>
                    setPasswords({ ...passwords, [keys[i]]: e.target.value })
                  }
                />
              </div>
            );
          })}
        </div>
        <button className="btn btn-warning" onClick={handlePasswordChange}>
          Change Password
        </button>
      </div>
    </div>
  );
}

export default MyProfile;

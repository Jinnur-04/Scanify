import { createSlice } from "@reduxjs/toolkit";

// Initial state with full user info
const initialState = {
  name: '',
  photo: '',
  role: '',
  token: '',
  staffId: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set all user fields at once
    setUser: (state, action) => {
      const { name, photo, role, token, staffId } = action.payload;
      state.name = name || '';
      state.photo = photo || '';
      state.role = role || '';
      state.token = token || '';
      state.staffId = staffId || '';
    },

    // Individual updates
    updateName: (state, action) => {
      state.name = action.payload || '';
    },
    updatePhoto: (state, action) => {
      state.photo = action.payload || '';
    },
    updateRole: (state, action) => {
      state.role = action.payload || '';
    },
    updateToken: (state, action) => {
      state.token = action.payload || '';
    },
    updateStaffId: (state, action) => {
      state.staffId = action.payload || '';
    },

    // Reset everything
    clearUser: () => initialState,
  },
});

// Export actions and reducer
export const {
  setUser,
  updateName,
  updatePhoto,
  updateRole,
  updateToken,
  updateStaffId,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;

import { createAsyncThunk } from "@reduxjs/toolkit";
import clientServer from "@/config/clientServer";

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      // ✅ FIXED: Updated URL to include the /user prefix.
      const response = await clientServer.post(`/user/login`, {
        email: user.email,
        password: user.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      } else {
        return thunkAPI.rejectWithValue({
          message: "token not provided",
        });
      }

      return thunkAPI.fulfillWithValue(response.data.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      console.log("Sending register request:", user);

      // ✅ FIXED: Updated URL to include the /user prefix.
      const response = await clientServer.post(`/user/register`, {
        username: user.username,
        password: user.password,
        email: user.email,
        name: user.name,
      });

      console.log("Register response:", response.data);

      return thunkAPI.fulfillWithValue(response.data); // ✅ Return success
    } catch (err) {
      console.error("Register error:", err.response?.data || err.message);
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user, thunkAPI) => {
    try {
      // ✅ FIXED: Updated URL to include the /user prefix.
      const response = await clientServer.get("/user/get_user_and_profile", {
        params: {
          token: user.token,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/get_all_users");

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (payload, thunkAPI) => {
    try {
      const { token, connectionId } = payload;

      const response = await clientServer.post(
        "/user/send_connection_request",
        {
          token: token,
          connectionId: connectionId,
        }
      );

      // thunkAPI.dispatch(getConnectionsRequest({ token: user.token }));

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: err.message }
      );
    }
  }
);

export const getConnectionsRequest = createAsyncThunk(
  "user/getConnectionRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/getConnectionRequest", {
        params: {
          token: user.token,
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const getMyConnectionRequest = createAsyncThunk(
  "user/getMyConnectionRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/user_connection_request", {
        params: {
          token: user.token,
        },
      });
      return thunkAPI.fulfillWithValue(response.data.connections);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const acceptConnection = createAsyncThunk(
  "/user/acceptConnection",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/user/accept_connection_request",
        {
          token: user.token,
          requestId: user.connectionId,
          action_type: user.action,
        }
      );
      thunkAPI.dispatch(getConnectionsRequest({ token: user.token }));
      thunkAPI.dispatch(getMyConnectionRequest({ token: user.token }));
      return thunkAPI.fulfillWithValue(response.data.connections);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const updateProfileData = createAsyncThunk(
  "user/updateProfileData",
  async (userData, thunkAPI) => {
    try {
      const response = await clientServer.post(
        `/user/update_profile_data`,
        userData
      );
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (payload, thunkAPI) => {
    try {
      const response = await clientServer.post("/user/user_update", payload);
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// ✅ Action for GET /user/download_resume

export const downloadProfile = createAsyncThunk(
  "user/downloadProfile",
  async (token, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/download_resume", {
        params: {
          token,
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// ✅ Action for GET /user/get_profile_based_on_username

export const getUserProfileByUsername = createAsyncThunk(
  "user/getUserProfileByUsername",
  async (username, thunkAPI) => {
    try {
      const response = await clientServer.get(
        "/user/get_profile_based_on_username",
        {
          params: {
            username,
          },
        }
      );
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// ✅ Action for POST /user/comment_post

export const commentPost = createAsyncThunk(
  "user/commentPost",
  async (payload, thunkAPI) => {
    try {
      const response = await clientServer.post("/user/comment_post", payload);
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

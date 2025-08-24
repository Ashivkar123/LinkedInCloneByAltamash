import { getAboutUser } from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { BASE_URL, clientServer } from "@/config";
import { getAllPosts } from "@/config/redux/action/postAction";

export default function ProfilePage() {
  const authState = useSelector((state) => state.auth);
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const dispatch = useDispatch();
  const postReducer = useSelector((state) => state.postReducer);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputData, setInputData] = useState({
    company: "",
    position: "",
    years: "",
  });

  const handleWorkInputChange = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  };

  useEffect(() => {
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    dispatch(getAllPosts());
  }, [dispatch]);

  useEffect(() => {
    if (authState?.user != undefined) {
      setUserProfile(authState.user);

      const posts = postReducer.posts.filter((post) => {
        return post.userId.username === authState.user.userId.username;
      });
      setUserPosts(posts);
    }
  }, [authState.user, postReducer.posts]);

  const updateProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("token", localStorage.getItem("token"));

    const response = await clientServer.post(
      "/user/update_profile_picture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  const updateProfileData = async () => {
    const request = await clientServer.post("/user/user_update", {
      token: localStorage.getItem("token"),
      name: userProfile?.userId?.name,
    });

    const response = await clientServer.post("/user/update_profile_data", {
      token: localStorage.getItem("token"),
      bio: userProfile.bio,
      currentPost: userProfile.currentPost,
      pastWork: userProfile.pastWork,
      education: userProfile.education,
    });

    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  return (
    <UserLayout>
      <DashboardLayout>
        {userProfile?.userId ? (
          <div className={styles.container}>
            <div className={styles.backDropContainer}>
              <img
                className={styles.backDrop__overlay}
                src={`${BASE_URL}/${userProfile.userId.coverPicture}`}
                alt="backdrop"
              />
              <label
                htmlFor="profilePictureUpload"
                className={styles.backDrop__overlay}
              >
                <p>Edit</p>
              </label>
              <input
                onChange={(e) => {
                  updateProfilePicture(e.target.files[0]);
                }}
                hidden
                type="file"
                id="profilePictureUpload"
              />
              <img
                className={styles.profileImage}
                src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
                alt="profile"
              />
            </div>

            <div className={styles.profileContainer__details}>
              <div style={{ display: "flex", gap: "2rem", width: "100%" }}>
                {/* LEFT SIDE */}
                <div style={{ flex: "1" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      className={styles.nameEdit}
                      type="text"
                      value={userProfile?.userId?.name}
                      onChange={(e) => {
                        setUserProfile({
                          ...userProfile,
                          userId: {
                            ...userProfile.userId,
                            name: e.target.value,
                          },
                        });
                      }}
                    />
                    <p style={{ color: "grey" }}>
                      @{userProfile?.userId?.username}
                    </p>
                  </div>

                  <textarea
                    value={userProfile.bio}
                    onChange={(e) => {
                      setUserProfile({ ...userProfile, bio: e.target.value });
                    }}
                    rows={Math.max(3, Math.ceil(userProfile?.bio.length / 80))}
                    style={{ width: "100%" }}
                  />
                </div>

                {/* RIGHT SIDE */}
                <div style={{ flex: "1" }}>
                  <h3>Recent Activity</h3>
                  {userPosts?.length > 0 ? (
                    userPosts.map((post) => (
                      <div key={post._id} className={styles.postCard}>
                        <div className={styles.card}>
                          <div className={styles.card__profileContainer}>
                            {post.media !== "" ? (
                              <img
                                src={`${BASE_URL}/${post.media}`}
                                alt="Post media"
                              />
                            ) : (
                              <div
                                style={{ width: "3.4rem", height: "3.4rem" }}
                              ></div>
                            )}
                          </div>
                          <p>{post.body}</p>
                          <div className={styles.postActions}>
                            <button onClick={() => handleLikeClick(post._id)}>
                              👍
                            </button>
                            <button
                              onClick={() =>
                                handleMessageClick(
                                  userProfile?.userId?.username
                                )
                              }
                            >
                              ✉️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No recent activity found.</p>
                  )}
                </div>
              </div>
            </div>

            {/* WORK HISTORY */}
            <div className={styles.workHistory}>
              <h4>Work History</h4>
              <div className={styles.workHistoryContainer}>
                {userProfile?.pastWork?.length > 0 ? (
                  userProfile.pastWork.map((work, index) => (
                    <div key={index} className={styles.workHistoryCard}>
                      <p
                        style={{
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.8rem",
                        }}
                      >
                        {work.company} - {work.position}
                      </p>
                      <p>{work.years}</p>
                    </div>
                  ))
                ) : (
                  <p>No work history found.</p>
                )}
                <button
                  className={styles.addWorkButton}
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                >
                  Add Work
                </button>
              </div>
            </div>

            {userProfile != authState.user && (
              <div
                onClick={() => {
                  updateProfileData();
                }}
                className={styles.connectBtn}
              >
                update Profile
              </div>
            )}
          </div>
        ) : (
          <p>Loading profile...</p>
        )}

        {isModalOpen && (
          <div
            onClick={() => {
              setIsModalOpen(false);
            }}
            className={styles.commentsContainer}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={styles.allCommentsContainer}
            >
              <input
                onChange={handleWorkInputChange}
                name="company"
                className={styles.inputField}
                type="text"
                placeholder="Enter Company"
              />
              <input
                onChange={handleWorkInputChange}
                name="position"
                className={styles.inputField}
                type="text"
                placeholder="Enter Position"
              />
              <input
                onChange={handleWorkInputChange}
                name="years"
                className={styles.inputField}
                type="number"
                placeholder="Years"
              />

              <div
                onClick={() => {
                  setUserProfile({
                    ...userProfile,
                    pastWork: [...userProfile.pastWork, inputData],
                  });
                  setIsModalOpen(false);
                }}
                className={styles.connectBtn}
              >
                Add Work
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </UserLayout>
  );
}

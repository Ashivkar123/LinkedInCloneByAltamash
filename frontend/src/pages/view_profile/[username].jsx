import { BASE_URL, clientServer } from "@/config";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  getConnectionsRequest,
  getMyConnectionRequest,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";
import { getAllPosts } from "@/config/redux/action/postAction";

export default function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer);
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUSerInConnection, setIsCurrentUserInConnection] =
    useState(false);
  const [isConnectionPending, setIsConnectionPending] = useState(false);

  // Function to fetch posts and connection requests
  const getUsersData = () => {
    dispatch(getAllPosts());
    dispatch(getConnectionsRequest({ token: localStorage.getItem("token") }));
    dispatch(getMyConnectionRequest({ token: localStorage.getItem("token") }));
  };

  // Effect to fetch initial data on component mount
  useEffect(() => {
    getUsersData();
  }, []);

  // Effect to process data once it's available in the Redux store
  useEffect(() => {
    // ⭐ FIX: Add a conditional check to ensure postReducer.posts is not undefined
    if (postReducer.posts) {
      // Filter posts for the current user
      const posts = postReducer.posts.filter((post) => {
        return post.userId.username === router.query.username;
      });
      setUserPosts(posts);
    }

    // Check for an existing connection with the profile user
    if (authState?.connections && userProfile?.userId?._id) {
      const connection = authState.connections.find(
        (req) => req?.connectionId?._id === userProfile.userId._id
      );

      // Check if a connection request exists and set the state accordingly
      if (connection) {
        setIsCurrentUserInConnection(true);
        setIsConnectionPending(connection.status_accepted === false);
      } else {
        setIsCurrentUserInConnection(false);
        setIsConnectionPending(false);
      }
    }
    if (authState?.connectionRequest && userProfile?.userId?._id) {
      const request = authState.connectionRequest.find(
        (user) => user?.userId?._id === userProfile.userId._id
      );

      if (request) {
        setIsCurrentUserInConnection(true);
        setIsConnectionPending(request.status_accepted === false);
      }
    }
  }, [
    postReducer.posts,
    router.query.username,
    authState.connections,
    authState.connectionRequest,
    userProfile?.userId?._id,
  ]);

  // Handle click for the like button
  const handleLikeClick = (postId) => {
    // Implement your Redux action to like a post here
    // Example: dispatch(likePost({ token: localStorage.getItem("token"), postId }));
    console.log(`Liked post with ID: ${postId}`);
    // You would add a Redux dispatch call here to send the like to your server
  };

  // Handle click for the message button
  const handleMessageClick = (username) => {
    // This will navigate to a private message page or open a chat modal
    router.push(`/messages/${username}`);
    console.log(`Starting a message with user: ${username}`);
  };

  // Helper function for the button's onClick handler
  const handleConnectClick = () => {
    // Optimistic UI Update: Set the state to pending immediately
    setIsCurrentUserInConnection(true);
    setIsConnectionPending(true);

    dispatch(
      sendConnectionRequest({
        token: localStorage.getItem("token"),
        connectionId: userProfile.userId._id,
      })
    );
  };

  if (!userProfile) {
    return <div>Profile not found</div>;
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              className={styles.backDrop__overlay}
              src={`${BASE_URL}/${userProfile.userId.coverPicture}`}
              alt="backdrop"
            />
            <div className={styles.backDrop__overlay}>
              <p>Edit</p>
            </div>
            <img
              className={styles.profileImage}
              src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
              alt="profile"
            />
          </div>
          <div className={styles.profileContainer__details}>
            <div className={styles.profileContainer__flex}>
              <div style={{ flex: "1" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <h2>{userProfile.userId.name}</h2>
                  <p style={{ color: "grey" }}>
                    @{userProfile.userId.username}
                  </p>
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <p>{userProfile.bio}</p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.2rem",
                  }}
                >
                  {isCurrentUSerInConnection ? (
                    <button className={styles.connectedButton}>
                      {isConnectionPending ? "Pending" : "Connected"}
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectClick}
                      className={styles.connectBtn}
                    >
                      Connect
                    </button>
                  )}

                  <div
                    onClick={async () => {
                      const response = await clientServer.get(
                        `/user/download_resume?id=${userProfile.userId._id}`
                      );
                      window.open(
                        `${BASE_URL}/${response.data.message}`,
                        "_blank"
                      );
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <svg
                      style={{ width: "1.2em" }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div style={{ flex: "1" }}>
                <h3>Recent Activity</h3>
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <div className={styles.card__profileContainer}>
                          {post.media !== "" ? (
                            <img
                              src={`${BASE_URL}/${post.media} `}
                              alt="Post media"
                            />
                          ) : (
                            <div
                              style={{ width: "3.4rem", height: "3.4rem" }}
                            ></div>
                          )}
                        </div>
                        <p>{post.body}</p>
                        {/* Add action buttons here */}
                        <div className={styles.postActions}>
                          <button onClick={() => handleLikeClick(post._id)}>
                            👍
                          </button>
                          <button
                            onClick={() =>
                              handleMessageClick(userProfile.userId.username)
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

          <div className={styles.workHistory}>
            <h4>work History</h4>

            <div className={styles.workHistoryContainer}>
              {/* ⭐ FIX: Conditionally render the map based on userProfile.pastWork's existence */}
              {userProfile.pastWork && userProfile.pastWork.length > 0 ? (
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
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  try {
    const { username } = context.query;
    const response = await clientServer.get(
      "/user/get_profile_based_on_username",
      {
        params: {
          username,
        },
      }
    );

    if (response.status === 200 && response.data && response.data.profile) {
      return {
        props: {
          userProfile: response.data.profile,
        },
      };
    } else {
      return {
        props: {
          userProfile: null,
        },
      };
    }
  } catch (error) {
    return {
      props: {
        userProfile: null,
      },
    };
  }
}

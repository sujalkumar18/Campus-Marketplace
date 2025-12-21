// Default user for MVP (no login required)
const DEFAULT_USER = {
  id: 1,
  username: "student",
  college: "Alliance University",
  password: "",
  avatar: ""
};

type User = typeof DEFAULT_USER;

export function useAuth() {
  return {
    user: DEFAULT_USER,
  };
}

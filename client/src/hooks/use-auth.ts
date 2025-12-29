// Helper to get or create a unique visitor ID
function getVisitorId(): number {
  if (typeof window === "undefined") return 1;
  const storedId = localStorage.getItem("campusrent_visitor_id");
  if (storedId) return parseInt(storedId);
  
  // Generate a random ID for the visitor (simplified for MVP)
  const newId = Math.floor(Math.random() * 1000000) + 2; // +2 to avoid ID 1
  localStorage.setItem("campusrent_visitor_id", newId.toString());
  return newId;
}

const VISITOR_ID = getVisitorId();

export function useAuth() {
  const user = {
    id: VISITOR_ID,
    username: `Guest ${VISITOR_ID % 1000}`,
    college: "Alliance University",
    password: "",
    avatar: ""
  };

  return {
    user,
  };
}

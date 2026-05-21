import http from "./http";

export const getAdminDashboardKpis = async () => {
  const response = await http.get("/admin/dashboard");
  return response.data;
};

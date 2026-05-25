import http from "./http";

export const createComplaint = async (payload) => {
  const response = await http.post("/complaints", payload);
  return response.data;
};

export const getMyComplaints = async () => {
  const response = await http.get("/complaints/my");
  return response.data;
};

export const getComplaints = async (params = {}) => {
  const response = await http.get("/complaints", { params });
  return response.data;
};

export const updateComplaint = async (complaintId, payload) => {
  const response = await http.patch(`/complaints/${complaintId}`, payload);
  return response.data;
};

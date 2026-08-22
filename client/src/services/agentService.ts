import { apiClient } from '../api/axiosInstance';
import { AgentReport } from '../types';

export const agentService = {
  async runMultiAgentWorkflow(): Promise<AgentReport> {
    const res = await apiClient.post('/agents/run-workflow');
    return res.data.data;
  },

  async getReports(): Promise<AgentReport[]> {
    const res = await apiClient.get('/agents/reports');
    return res.data.data;
  },

  async getReportById(id: string): Promise<AgentReport> {
    const res = await apiClient.get(`/agents/reports/${id}`);
    return res.data.data;
  },
};

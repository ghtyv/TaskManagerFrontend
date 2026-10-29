import apiClient from './client';
export type Project = { id: number; title: string; description: string | null; open: boolean; leadId: number | null };
export type ProjectInput = { title: string; description: string | null; leadId: number | null };
export async function getProjects() { return (await apiClient.get<Project[]>('/projects')).data; }
export async function getProject(id: string) { return (await apiClient.get<Project>(`/projects/${id}`)).data; }
export async function createProject(input: ProjectInput) { return (await apiClient.post<Project>('/projects', input)).data; }
export async function updateProject(id: number, input: Partial<ProjectInput> & { open?: boolean }) { return (await apiClient.patch<Project>(`/projects/${id}`, input)).data; }
export async function deleteProject(id: number) { await apiClient.delete(`/projects/${id}`); }

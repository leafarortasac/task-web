import axios, { AxiosError } from 'axios';
import { 
  LoginRequestDTO, LoginResponseDTO, Task, PagedResponse, Usuario, NotificationDocument 
} from '../types';

const API_IAM_URL = import.meta.env.VITE_API_IAM_URL || 'http://localhost:8080/v1';
const API_TASK_URL = import.meta.env.VITE_API_TASK_URL || 'http://localhost:8081/v1';
const API_NOTIFICATION_URL = import.meta.env.VITE_API_NOTIFICATION_URL || 'http://localhost:8082/v1';

const iamApi = axios.create({
  baseURL: API_IAM_URL,
  headers: { 'Content-Type': 'application/json' },
});

const taskApi = axios.create({
  baseURL: API_TASK_URL,
  headers: { 'Content-Type': 'application/json' },
});

const notificationApi = axios.create({
  baseURL: API_NOTIFICATION_URL,
  headers: { 'Content-Type': 'application/json' },
});

taskApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

notificationApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(credentials: LoginRequestDTO): Promise<LoginResponseDTO> {
    const response = await iamApi.post<LoginResponseDTO>('/usuario/login', credentials);
    return response.data;
  },

  async register(data: any): Promise<Usuario> {
    const response = await iamApi.post<Usuario>('/usuario/register', data);
    return response.data;
  }
};

export const usuarioService = {
  async getUsuarios(filtros: any): Promise<PagedResponse<{ usuario: Usuario }>> {
    const response = await iamApi.get<PagedResponse<{ usuario: Usuario }>>('/usuario/login', { 
      params: filtros 
    });
    return response.data;
  }
};

export const taskService = {
  async getAll(params?: any): Promise<PagedResponse<Task>> {
    const response = await taskApi.get<PagedResponse<Task>>('/tasks', { 
      params: { unPaged: false, ...params } 
    });
    return response.data;
  },

  async create(tasks: Task[]): Promise<void> {
    await taskApi.post('/tasks', tasks);
  },

  async update(tasks: Task[]): Promise<void> {
    await taskApi.put('/tasks', tasks);
  },

  async delete(tasks: Task[]): Promise<void> {
    await taskApi.delete('/tasks', { data: tasks });
  }
};

export const notificationService = {

  async getAll(params?: any): Promise<PagedResponse<NotificationDocument>> {
    const response = await notificationApi.get<PagedResponse<NotificationDocument>>('/notifications', { 
      params: { unPaged: true, ...params } 
    });
    return response.data;
  },

  async update(notifications: Notification[]): Promise<void> {
    await notificationApi.put('/notifications', notifications);
  }
};

export default taskApi;
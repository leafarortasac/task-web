import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Trash2, CheckCircle2, Clock, AlertCircle, XCircle, CheckCircle } from 'lucide-react';
import { taskService } from '../services/api';
import { Task, TaskStatus } from '../types';
import { formatDateTime } from '../utils';
import { useAuth } from '../context/AuthContext';
import TaskForm from '../components/TaskForm';
import toast from 'react-hot-toast';

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialLoad = useRef(true);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get('status') || 'ALL');

  const fetchTasks = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const response = await taskService.getAll({ usuarioId: user.id });
      setTasks(response.registros || []);
    } catch (error) {
      toast.error('Erro ao carregar tarefas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialLoad.current && user?.id) {
      isInitialLoad.current = false;
      fetchTasks();
    }
  }, [user]);

  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedTask = { ...task, status: 'CONCLUIDA' as TaskStatus };
      
      await taskService.update([updatedTask]);
      
      toast.success('Tarefa concluída!');
      fetchTasks();
    } catch (error) {
      toast.error('Erro ao atualizar status da tarefa.');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('ALL');
    setSearchParams({});
  };

  const handleDelete = async (task: Task) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await taskService.delete([task]);
        toast.success('Tarefa excluída com sucesso!');
        fetchTasks();
      } catch (error) {
        toast.error('Erro ao excluir tarefa.');
      }
    }
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONCLUIDA':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-green-100 text-green-700 border border-green-200">
            <CheckCircle2 size={12} className="mr-1" /> Concluída
          </span>
        );
      case 'EM_ANDAMENTO':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-100 text-indigo-700 border border-indigo-200">
            <Clock size={12} className="mr-1" /> Em Andamento
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-orange-100 text-orange-700 border border-orange-200">
            <AlertCircle size={12} className="mr-1" /> Pendente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Tarefas</h1>
          <p className="text-gray-600">Gerencie suas atividades diárias.</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center justify-center gap-2">
          <Plus size={20} /> Nova Tarefa
        </button>
      </div>

      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-white shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Buscar..." className="input pl-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            className="input w-full md:w-48" 
            value={filterStatus} 
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setSearchParams(e.target.value === 'ALL' ? {} : { status: e.target.value });
            }}
          >
            <option value="ALL">Todos os Status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="CONCLUIDA">Concluídas</option>
          </select>

          {(filterStatus !== 'ALL' || searchTerm !== '') && (
            <button onClick={clearFilters} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Limpar filtros">
              <XCircle size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="loading-spinner w-8 h-8 mx-auto animate-spin"></div>
            <p className="mt-4 text-gray-500">Buscando tarefas...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Nenhuma tarefa encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Título</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Criada em</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">{task.titulo}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{task.descricao}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(task.status as string)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(task.dataCriacao)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {}
                        {task.status !== 'CONCLUIDA' && (
                          <button 
                            onClick={() => handleToggleComplete(task)} 
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Marcar como concluída"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button onClick={() => handleEdit(task)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(task)} className="p-2 text-red-600 hover:bg-red-700/10 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">{selectedTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <div className="p-6">
              <TaskForm task={selectedTask} onSuccess={() => { setIsModalOpen(false); fetchTasks(); }} onCancel={() => setIsModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
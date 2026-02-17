import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle, Clock, AlertCircle, List } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { taskService, notificationService } from '../services/api';
import { formatDateTime } from '../utils';
import { Task, TaskStatus, NotificationDocument } from '../types';

interface DashboardStats {
  totalTasks: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isFirstRender = useRef(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    pendentes: 0,
    emAndamento: 0,
    concluidas: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);

        try {
          const taskResponse = await taskService.getAll({ usuarioId: user.id });
          const tasks = taskResponse.registros || [];
          
          setStats({
            totalTasks: tasks.length,
            pendentes: tasks.filter((t: Task) => t.status === 'PENDENTE' || t.status === TaskStatus.PENDENTE).length,
            emAndamento: tasks.filter((t: Task) => t.status === 'EM_ANDAMENTO' || t.status === TaskStatus.EM_ANDAMENTO).length,
            concluidas: tasks.filter((t: Task) => t.status === 'CONCLUIDA' || t.status === TaskStatus.CONCLUIDA).length,
          });

          setRecentTasks([...tasks].sort((a, b) => 
            new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
          ).slice(0, 5));
        } catch (taskErr) {
          console.error("Falha ao carregar tarefas:", taskErr);
        }

        try {
          await notificationService.getAll({ usuarioId: user.id, lida: false });
          console.log("Chamada ao notification-service enviada com sucesso.");
        } catch (notifErr) {
          console.error("Notification Service fora do ar na porta 8082:", notifErr);
        }

      } catch (error) {
        console.error('Erro crítico no dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const statCards = [
    { title: 'Total de Tarefas', value: stats.totalTasks, icon: List, textColor: 'text-blue-600', bgColor: 'bg-blue-50', link: '/tarefas' },
    { title: 'Pendentes', value: stats.pendentes, icon: AlertCircle, textColor: 'text-orange-600', bgColor: 'bg-orange-50', link: '/tarefas?status=PENDENTE' },
    { title: 'Em Andamento', value: stats.emAndamento, icon: Clock, textColor: 'text-indigo-600', bgColor: 'bg-indigo-50', link: '/tarefas?status=EM_ANDAMENTO' },
    { title: 'Concluídas', value: stats.concluidas, icon: CheckCircle, textColor: 'text-green-600', bgColor: 'bg-green-50', link: '/tarefas?status=CONCLUIDA' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 mt-4 text-gray-600 font-medium">Sincronizando tarefas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá, {user?.nome}!</h1>
          <p className="text-gray-600">Gerencie suas atividades para hoje - {formatDateTime(new Date().toISOString())}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">IAM & TASK SERVICES ONLINE</div>
          <span className="text-[10px] text-gray-400 mt-1 uppercase">Role: {user?.role}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={index} to={card.link} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-lg`}><Icon className={`w-6 h-6 ${card.textColor}`} /></div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Tarefas Recentes</h2>
          </div>
          <Link to="/tarefas" className="text-sm font-medium text-blue-600 hover:underline">Ver todas</Link>
        </div>
        <div className="space-y-3">
          {recentTasks.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-500">Nenhuma tarefa encontrada.</p>
            </div>
          ) : (
            recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                <div className="flex items-center">
                  <div className="bg-white p-2 rounded-lg shadow-sm mr-4"><List className="w-5 h-5 text-gray-400" /></div>
                  <div>
                    <p className="font-bold text-gray-900">{task.titulo}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{task.descricao}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${task.status === 'CONCLUIDA' ? 'bg-green-100 text-green-700' : task.status === 'EM_ANDAMENTO' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                    {task.status?.replace('_', ' ')}
                  </span>
                  <p className="text-[10px] font-medium text-gray-400">{formatDateTime(task.dataCriacao)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
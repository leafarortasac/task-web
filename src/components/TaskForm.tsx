import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Type, FileText, User, Tag, Lock } from 'lucide-react';
import { Task, TaskStatus, Usuario } from '../types';
import { taskService, usuarioService } from '../services/api';
import toast from 'react-hot-toast';

const taskSchema = z.object({
  titulo: z
    .string()
    .min(1, 'Título é obrigatório')
    .min(3, 'Título deve ter pelo menos 3 caracteres'),
  descricao: z
    .string()
    .min(1, 'Descrição é obrigatória'),
  status: z.nativeEnum(TaskStatus, {
    errorMap: () => ({ message: 'Selecione um status válido' }),
  }),
  usuarioId: z.string().min(1, 'Atribuição de usuário é obrigatória'),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: TaskStatus.PENDENTE,
      usuarioId: '',
    }
  });

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await usuarioService.getUsuarios({ unPaged: true });
        const listaSimples = response.registros.map((reg: any) => reg.usuario);
        setUsuarios(listaSimples);
      } catch (error) {
        toast.error('Erro ao carregar lista de usuários');
      }
    };
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (task && (usuarios.length > 0 || isEditing)) {
      reset({
        titulo: task.titulo,
        descricao: task.descricao,
        status: task.status as TaskStatus,
        usuarioId: task.usuarioId,
      });
    }
  }, [task, usuarios, reset, isEditing]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsLoading(true);

      const taskData: Task = {
        id: task?.id,
        titulo: isEditing ? task!.titulo : data.titulo,
        usuarioId: isEditing ? task!.usuarioId : data.usuarioId,
        descricao: data.descricao,
        status: data.status,
        dataCriacao: task?.dataCriacao || new Date().toISOString(),
      };

      if (isEditing) {
        await taskService.update([taskData]);
        toast.success('Tarefa atualizada com sucesso!');
      } else {
        await taskService.create([taskData]);
        toast.success('Tarefa criada com sucesso!');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar tarefa:', error);
      toast.error('Erro ao processar tarefa no servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título {isEditing && <span className="text-[10px] text-orange-500 font-bold">(Imutável)</span>} *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isEditing ? <Lock className="h-5 w-5 text-orange-400" /> : <Type className="h-5 w-5 text-gray-400" />}
          </div>
          <input
            {...register('titulo')}
            readOnly={isEditing}
            className={`input pl-10 ${isEditing ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''} ${errors.titulo ? 'border-red-500' : ''}`}
            placeholder="Ex: Refatorar API"
          />
        </div>
        {errors.titulo && <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>}
      </div>

      {}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <textarea
            {...register('descricao')}
            rows={3}
            className={`input pl-10 pt-2 ${errors.descricao ? 'border-red-500' : ''}`}
            placeholder="Descreva os detalhes da tarefa..."
          />
        </div>
        {errors.descricao && <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Atribuir a {isEditing && <span className="text-[10px] text-orange-500 font-bold">(Imutável)</span>} *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isEditing ? <Lock className="h-5 w-5 text-orange-400" /> : <User className="h-5 w-5 text-gray-400" />}
            </div>
            <select
              {...register('usuarioId')}
              disabled={isEditing}
              className={`input pl-10 ${isEditing ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''} ${errors.usuarioId ? 'border-red-500' : ''}`}
            >
              <option value="">Selecione um usuário</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        {}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
            <select
              {...register('status')}
              className={`input pl-10 ${errors.status ? 'border-red-500' : ''}`}
            >
              <option value={TaskStatus.PENDENTE}>Pendente</option>
              <option value={TaskStatus.EM_ANDAMENTO}>Em Andamento</option>
              <option value={TaskStatus.CONCLUIDA}>Concluída</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary btn-md flex-1" disabled={isLoading}>
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="btn-primary btn-md flex-1">
          {isLoading ? 'Salvando...' : isEditing ? 'Atualizar Tarefa' : 'Criar Tarefa'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
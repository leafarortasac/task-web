import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import mqtt from 'mqtt';
import { 
  Menu, X, Home, CheckSquare, User, LogOut,
  Bell, Settings, LayoutGrid, BellOff, Check, CheckCheck, Info, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import { getInitials, stringToColor, formatDateTime } from '../utils';
import { Notification, NotificationDocument } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { user, logout } = useAuth();
  const location = useLocation();

  const hasUnread = notifications.length > 0;

  const loadNotifications = async () => {
    if (!user?.id) return;
    try {
      const response = await notificationService.getAll({ usuarioId: user.id, lida: false });
      const fetched = response.registros.map((doc: NotificationDocument) => doc.notification);
      setNotifications(fetched);
    } catch (error) {
      console.error('Erro ao carregar notificações no Layout:', error);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    loadNotifications();

    const client = mqtt.connect('ws://localhost:9001');

    client.on('connect', () => {
  console.log('MQTT: Conectado ao Broker');
  
    const topic = `notificacoes/usuario/${user.id}`; 
    client.subscribe(topic);
    
    console.log(`MQTT: Inscrito no tópico ${topic}`);
  });

    client.on('message', (topic, message) => {
      try {
        const newNotif = JSON.parse(message.toString());
        
        setNotifications(prev => [newNotif, ...prev]);

        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(err => console.error("Erro ao tocar som:", err));

      } catch (err) {
        console.error("Erro ao processar mensagem MQTT:", err);
      }
    });

    return () => {
      if (client) {
        client.end();
        console.log('MQTT: Conexão encerrada');
      }
    };
  }, [user?.id]);

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) loadNotifications();
  };

  const openNotificationDetail = (notif: Notification) => {
    setSelectedNotification(notif);
    setIsDrawerOpen(true);
    setShowNotifications(false);
  };

  const markAsRead = async (notif: Notification) => {
    try {
      const updatedNotif = { ...notif, lida: true };
      await notificationService.update([updatedNotif]);
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
      
      if (selectedNotification?.id === notif.id) {
        setIsDrawerOpen(false);
        setSelectedNotification(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updatedList = notifications.map(n => ({ ...n, lida: true }));
      await notificationService.update(updatedList);
      setNotifications([]);
      setShowNotifications(false);
    } catch (error) {
      console.error('Erro ao ler todas:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, current: location.pathname === '/' || location.pathname === '/dashboard' },
    { name: 'Tarefas', href: '/tarefas', icon: CheckSquare, current: location.pathname.startsWith('/tarefas') },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
          <div className="flex items-center">
            <LayoutGrid className="w-8 h-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white">TaskApp</span>
          </div>
        </div>
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name} to={item.href}
                  className={`${item.current ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-sm font-medium border-l-4 transition-colors`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`${item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'} mr-3 h-6 w-6`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: stringToColor(user?.nome || '') }}>
              {getInitials(user?.nome || '')}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.nome}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <div className="mt-3 flex space-x-2">
            <Link to="/perfil" className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <User className="w-3 h-3 mr-1" /> Perfil
            </Link>
            <button onClick={logout} className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
              <LogOut className="w-3 h-3 mr-1" /> Sair
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white shadow-sm border-b border-gray-200 relative z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button className="text-gray-500 lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
              <div className="ml-4 lg:ml-0"><h1 className="text-lg font-semibold text-gray-900">Gerenciador de Tarefas</h1></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button onClick={handleBellClick} className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-gray-100 text-blue-600' : 'text-gray-400 hover:text-gray-500'}`}>
                  <Bell className="w-6 h-6" />
                  {hasUnread && <span className="absolute top-2 right-2.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />}
                </button>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                      <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center text-xs font-bold text-gray-700 uppercase">
                        <span>Notificações</span>
                        {hasUnread && (
                          <button onClick={markAllAsRead} className="text-[10px] text-blue-600 font-bold hover:underline flex items-center">
                            <CheckCheck className="w-3 h-3 mr-1" /> Marcar todas
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-400"><BellOff className="w-8 h-8 mx-auto mb-2 opacity-20" /><p className="text-xs">Nenhuma notificação nova</p></div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} onClick={() => openNotificationDetail(n)} className="p-3 border-b border-gray-50 hover:bg-blue-50 transition-colors group cursor-pointer">
                              <div className="flex justify-between items-start">
                                <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{n.titulo}</h4>
                                <Check className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100" />
                              </div>
                              <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{n.mensagem}</p>
                              <span className="text-[9px] text-gray-400 mt-2 block uppercase">{formatDateTime(n.dataNotificacao)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-500"><Settings className="w-6 h-6" /></button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
        </main>

        {}
        {isDrawerOpen && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-30 z-[60]" onClick={() => setIsDrawerOpen(false)} />
            <div className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-[70] transform transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="h-full flex flex-col">
                <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                  <div className="flex items-center text-blue-600"><Info className="w-5 h-5 mr-2" /><h2 className="text-lg font-bold text-gray-900">Detalhes</h2></div>
                  <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-full hover:bg-gray-200 text-gray-400"><X className="w-6 h-6" /></button>
                </div>
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                  <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título</label><h3 className="text-xl font-bold text-gray-900 mt-1">{selectedNotification?.titulo}</h3></div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100"><label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Mensagem</label><p className="text-gray-700 mt-2 text-sm leading-relaxed">{selectedNotification?.mensagem}</p></div>
                  <div className="flex items-center text-gray-400 text-xs font-medium"><Calendar className="w-4 h-4 mr-2" />{selectedNotification && formatDateTime(selectedNotification.dataNotificacao)}</div>
                </div>
                <div className="p-6 border-t bg-gray-50">
                  <button onClick={() => selectedNotification && markAsRead(selectedNotification)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-md">
                    <CheckCheck className="w-5 h-5 mr-2" /> Marcar como Lida
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Layout;
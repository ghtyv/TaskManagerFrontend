import { useEffect, useState } from 'react';
import { Alert, Button, Card, Empty, Flex, Form, Input, Layout, Modal, Popconfirm, Segmented, Select, Space, Spin, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router';
import { createProject, deleteProject, getProjects, updateProject, type Project, type ProjectInput } from '../api/projects';
import { getUsers, type UserListItem } from '../api/users';
import { logout } from '../api/auth';
import './TasksPage.css';

export default function ProjectsPage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [usersError, setUsersError] = useState('');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [editing, setEditing] = useState<Project | 'new' | null>(null);
    const [status, setStatus] = useState('all');
    const [lead, setLead] = useState<number | string>('all');
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('current');
    const [form] = Form.useForm<ProjectInput & { open: boolean }>();
    async function load() {
        setLoading(true);
        const [p, u] = await Promise.allSettled([getProjects(), getUsers()]);
        if (p.status === 'fulfilled') { setProjects(p.value); setError(''); } else setError('Не удалось загрузить проекты.');
        if (u.status === 'fulfilled') { setUsers(u.value); setUsersError(''); } else setUsersError('Не удалось загрузить пользователей.');
        setLoading(false);
    }
    useEffect(() => { let active = true; Promise.allSettled([getProjects(), getUsers()]).then(([p, u]) => { if (!active) return; if (p.status === "fulfilled") setProjects(p.value); else setError("Не удалось загрузить проекты."); if (u.status === "fulfilled") setUsers(u.value); else setUsersError("Не удалось загрузить пользователей."); setLoading(false); }); return () => { active = false; }; }, []);
    function open(project: Project | 'new') {
        form.resetFields();
        form.setFieldsValue(project === 'new' ? { open: true, leadId: null } : project);
        setFormError(''); setEditing(project);
    }
    async function save() {
        try {
            const values = await form.validateFields(); setSaving(true); setFormError('');
            const input = { title: values.title.trim(), description: values.description?.trim() || null, leadId: values.leadId ?? null };
            const result = editing === 'new' ? await createProject(input) : await updateProject((editing as Project).id, { ...input, open: values.open });
            setProjects(old => [result, ...old.filter(p => p.id !== result.id)]); setEditing(null);
        } catch (e) {
            if (!(e && typeof e === 'object' && 'errorFields' in e)) setFormError('Не удалось сохранить проект. Повторите попытку.');
        } finally { setSaving(false); }
    }
    const leadLabel = (id: number | null) => id === null ? 'Руководитель не назначен' : `Руководитель: ${users.find(u => u.id === id)?.email ?? `пользователь #${id}`}`;
    const visible = projects.filter(p => (status === 'all' || p.open === (status === 'open')) && (lead === 'all' || (lead === 'none' ? p.leadId === null : p.leadId === lead)) && `${p.title} ${p.description ?? ''} ${leadLabel(p.leadId)}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title, 'ru') : Number(b.open) - Number(a.open) || b.id - a.id);
    return <Layout className="tasks-layout">
        <Layout.Header className="tasks-header"><div><Typography.Title level={2} className="tasks-header__title">Проекты</Typography.Title><Typography.Text type="secondary">Рабочее пространство команды</Typography.Text></div><Space wrap><Button type="primary" onClick={() => open('new')}>Создать проект</Button><Button loading={loading} onClick={() => void load()}>Обновить</Button><Button danger loading={loggingOut} onClick={async () => { try { setLoggingOut(true); await logout(); navigate('/login', { replace: true }); } catch { setError('Не удалось выйти. Повторите попытку.'); } finally { setLoggingOut(false); } }}>Выйти</Button></Space></Layout.Header>
        <Layout.Content className="tasks-content"><Flex wrap gap={16} className="tasks-toolbar"><Segmented value={status} onChange={setStatus} options={[{ value: 'all', label: 'Все' }, { value: 'open', label: 'Открытые' }, { value: 'closed', label: 'Закрытые' }]} /><Select style={{ minWidth: 220 }} value={lead} onChange={setLead} options={[{ value: 'all', label: 'Все руководители' }, { value: 'none', label: 'Без руководителя' }, ...users.map(u => ({ value: u.id, label: u.email }))]} /><Input.Search className="tasks-toolbar__search" allowClear placeholder="Поиск проектов…" value={query} onChange={e => setQuery(e.target.value)} /><Select value={sort} onChange={setSort} options={[{ value: 'current', label: 'Сначала актуальные' }, { value: 'title', label: 'По названию' }]} /></Flex>
            {usersError && <Alert type="warning" title={usersError} />}{error && <Alert type="error" title={error} action={<Button onClick={() => void load()}>Повторить</Button>} />}
            {loading ? <div className="tasks-state"><Spin /></div> : !error && !visible.length ? <Empty description={projects.length ? 'Проекты не найдены' : 'Проектов пока нет. Создайте первый проект.'} /> : <div className="projects-grid">{visible.map(p => <Card className="task-card" key={p.id}><Space orientation="vertical" size={16} style={{ width: '100%' }}><Flex gap={12} justify="space-between"><Typography.Title level={4} className="task-card__title">{p.title}</Typography.Title><Tag color={p.open ? 'green' : 'default'}>{p.open ? 'Открыт' : 'Закрыт'}</Tag></Flex><Typography.Paragraph className="task-card__description">{p.description || 'Описание не указано.'}</Typography.Paragraph><div>♙ {leadLabel(p.leadId)}</div><Space wrap><Button onClick={() => open(p)}>Изменить</Button><Popconfirm title="Удалить проект?" description="Проект больше не будет доступен в списке." okText="Удалить" cancelText="Отмена" onConfirm={async () => { try { await deleteProject(p.id); setProjects(old => old.filter(item => item.id !== p.id)); } catch { setError('Не удалось удалить проект.'); } }}><Button danger>Удалить</Button></Popconfirm></Space><Button block className="project-open" onClick={() => navigate(`/projects/${p.id}`)}>Открыть проект →</Button></Space></Card>)}</div>}
        </Layout.Content>
        <Modal title={editing === 'new' ? 'Создать проект' : 'Изменить проект'} open={editing !== null} confirmLoading={saving} closable={!saving} maskClosable={!saving} okText="Сохранить" cancelText="Отмена" onOk={() => void save()} onCancel={() => { if (!saving) setEditing(null); }}><Form form={form} layout="vertical" disabled={saving}><Form.Item name="title" label="Название" rules={[{ required: true, whitespace: true, message: 'Введите название.' }]}><Input maxLength={255} /></Form.Item><Form.Item name="description" label="Описание"><Input.TextArea rows={4} /></Form.Item><Form.Item name="leadId" label="Руководитель"><Select allowClear showSearch optionFilterProp="label" placeholder="Не назначен" options={users.map(u => ({ value: u.id, label: u.email }))} /></Form.Item>{editing !== 'new' && <Form.Item name="open" label="Статус"><Select options={[{ value: true, label: 'Открыт' }, { value: false, label: 'Закрыт' }]} /></Form.Item>}{usersError && <Alert type="warning" title={usersError} />}{formError && <Alert type="error" title={formError} />}</Form></Modal>
    </Layout>;
}

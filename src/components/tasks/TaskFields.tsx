import { Button, Collapse, DatePicker, Form, Input, Select, Space, Tag } from 'antd';
import type { UserListItem } from '../../api/users';
import { formatTaskDeadline, getDeadlineTone, getTaskState } from './taskPresentation';

export function TaskFields({ prefix = [], users, loading }: { prefix?: (string | number)[]; users: UserListItem[]; loading: boolean }) {
    return <>
        {prefix.length > 0 && <Form.Item name={[...prefix, 'id']} hidden><Input /></Form.Item>}
        <Form.Item name={[...prefix, 'title']} label="Название" rules={[{ required: true, whitespace: true, message: 'Введите название.' }]}><Input maxLength={255} placeholder="Введите название" /></Form.Item>
        <Form.Item name={[...prefix, 'description']} label="Описание"><Input.TextArea rows={3} placeholder="Опишите задачу…" /></Form.Item>
        <Form.Item name={[...prefix, 'assigneeId']} label="Исполнитель"><Select allowClear showSearch optionFilterProp="label" loading={loading} placeholder="Не назначен" options={users.map(u => ({ value: u.id, label: u.email }))} /></Form.Item>
        <Form.Item name={[...prefix, 'open']} label="Статус"><Select options={[{ value: true, label: 'Открыта' }, { value: false, label: 'Закрыта' }]} /></Form.Item>
        <Form.Item name={[...prefix, 'deadline']} label="Срок выполнения"><DatePicker className="task-create__date-picker" format="DD.MM.YYYY" placeholder="Выберите дату" /></Form.Item>
    </>;
}

export function SubtaskFields({ users, loading }: { users: UserListItem[]; loading: boolean }) {
    const form = Form.useFormInstance();
    const drafts = Form.useWatch('subTasks', form) ?? [];
    return <section className="subtask-editor"><h3>Подзадачи</h3><p className="task-create__hint">Разделите задачу на небольшие части. Каждая подзадача имеет свой статус и срок.</p>
        <Form.List name="subTasks">{(fields, { add, remove }) => <Space orientation="vertical" style={{ width: '100%' }}>
            {fields.map(field => {
                const draft = drafts[field.name];
                const deadline = draft?.deadline?.format('YYYY-MM-DD') ?? null;
                return <Collapse key={field.key} defaultActiveKey={[field.key]} items={[{ key: field.key, forceRender: true, label: <Space wrap><span>{draft?.title || `Подзадача ${field.name + 1}`}</span><Tag className={`tone-${getDeadlineTone(draft?.open !== false, deadline)}`}>{getTaskState(draft?.open !== false)}</Tag><small>{draft?.assigneeId ? users.find(u => u.id === draft.assigneeId)?.email ?? `Пользователь #${draft.assigneeId}` : 'Не назначен'} · {formatTaskDeadline(deadline)}</small></Space>, children: <><TaskFields prefix={[field.name]} users={users} loading={loading} /><Button danger onClick={() => remove(field.name)}>Удалить подзадачу</Button></> }]} />;
            })}
            <Button block type="dashed" onClick={() => add({ open: true })}>+ Добавить подзадачу</Button>
        </Space>}</Form.List>
    </section>;
}

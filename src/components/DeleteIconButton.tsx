import { useState } from 'react';
import { Button, Popconfirm, message } from 'antd';
import MetadataIcon from './MetadataIcon';

export default function DeleteIconButton({ label, description, onDelete, disabled = false }: {
    label: string;
    description?: string;
    onDelete: () => Promise<void>;
    disabled?: boolean;
}) {
    const [deleting, setDeleting] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    return <span className="delete-action" onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
        {contextHolder}
        <Popconfirm title={`${label}?`} description={description} okText="Удалить" cancelText="Отмена"
            disabled={disabled || deleting} okButtonProps={{ danger: true, loading: deleting }}
            onConfirm={async () => {
                setDeleting(true);
                try { await onDelete(); }
                catch { void messageApi.error('Не удалось удалить. Попробуйте снова.'); }
                finally { setDeleting(false); }
            }}>
            <Button danger type="text" className="delete-icon-button" icon={<MetadataIcon type="delete" />}
                aria-label={label} title={label} loading={deleting} disabled={disabled} />
        </Popconfirm>
    </span>;
}

import { useEffect, useState } from 'react';
import { Alert, Button, Flex, Popconfirm, Space, Spin, Typography } from 'antd';
import {
    deleteAttachmentById,
    downloadAttachment,
    getTaskAttachments,
    type Attachment,
} from '../../api/attachments';
import type { Task } from '../../api/tasks';

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

type TaskAttachmentsProps = {
    projectId: string;
    task: Task;
};

function TaskAttachments({ projectId, task }: TaskAttachmentsProps) {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloadError, setDownloadError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [retry, setRetry] = useState(0);
    const isBusy = downloadingId !== null || deletingId !== null;

    useEffect(() => {
        let active = true;
        void getTaskAttachments(projectId, task.id)
            .then((files) => {
                if (active) {
                    setAttachments(files);
                    setError('');
                }
            })
            .catch(() => {
                if (active) setError('Не удалось загрузить список файлов.');
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });
        return () => {
            active = false;
        };
    }, [projectId, task, retry]);

    const handleDownload = async (attachment: Attachment) => {
        if (isBusy) return;

        setDownloadingId(attachment.id);
        setDownloadError('');
        try {
            await downloadAttachment(projectId, attachment);
        } catch {
            setDownloadError(`Не удалось скачать файл «${attachment.name}». Попробуйте снова.`);
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDelete = async (attachment: Attachment) => {
        if (isBusy) return;

        setDeletingId(attachment.id);
        setDeleteError('');
        try {
            await deleteAttachmentById(projectId, attachment.id);
            setAttachments((current) =>
                current.filter((file) => file.id !== attachment.id),
            );
        } catch {
            setDeleteError(
                `Не удалось удалить файл «${attachment.name}». Попробуйте снова.`,
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <section className="task-attachments">
            <Typography.Title level={4}>Файлы задачи</Typography.Title>
            <Typography.Paragraph type="secondary">
                Прикрепить файлы к задаче можно в окне редактирования.
            </Typography.Paragraph>
            {downloadError && <Alert type="error" title={downloadError} />}
            {deleteError && <Alert type="error" title={deleteError} />}
            {isLoading ? (
                <Spin />
            ) : error ? (
                <Space wrap>
                    <Typography.Text type="danger">{error}</Typography.Text>
                    <Button
                        onClick={() => {
                            setIsLoading(true);
                            setRetry((current) => current + 1);
                        }}
                    >
                        Повторить
                    </Button>
                </Space>
            ) : attachments.length ? (
                <ul className="task-attachments__list">
                    {attachments.map((attachment) => (
                        <li key={attachment.id}>
                            <Flex justify="space-between" align="center" gap={12} wrap>
                                <div className="task-attachments__name">
                                    <Typography.Text>{attachment.name}</Typography.Text>
                                    <Typography.Text type="secondary">
                                        {' · '}
                                        {formatSize(attachment.size)}
                                    </Typography.Text>
                                </div>
                                <Space wrap>
                                    <Button
                                        loading={downloadingId === attachment.id}
                                        disabled={isBusy}
                                        onClick={() => void handleDownload(attachment)}
                                        aria-label={`Скачать ${attachment.name}`}
                                    >
                                        Скачать
                                    </Button>
                                    <Popconfirm
                                        title="Удалить файл?"
                                        description={
                                            `Файл «${attachment.name}» будет удалён безвозвратно.`
                                        }
                                        okText="Удалить"
                                        cancelText="Отмена"
                                        okButtonProps={{
                                            danger: true,
                                            loading: deletingId === attachment.id,
                                        }}
                                        disabled={isBusy}
                                        onConfirm={() => handleDelete(attachment)}
                                    >
                                        <Button
                                            danger
                                            loading={deletingId === attachment.id}
                                            disabled={isBusy}
                                            aria-label={`Удалить ${attachment.name}`}
                                        >
                                            Удалить
                                        </Button>
                                    </Popconfirm>
                                </Space>
                            </Flex>
                        </li>
                    ))}
                </ul>
            ) : (
                <Typography.Text type="secondary">Файлов пока нет.</Typography.Text>
            )}
        </section>
    );
}

export default TaskAttachments;

import { useEffect, useState } from 'react';
import { Alert, Button, Flex, Space, Spin, Typography } from 'antd';
import { downloadAttachment, getTaskAttachments, type Attachment } from '../../api/attachments';
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
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [retry, setRetry] = useState(0);

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

    return (
        <section className="task-attachments">
            <Typography.Title level={4}>Файлы задачи</Typography.Title>
            <Typography.Paragraph type="secondary">
                Прикрепить файлы к задаче можно в окне редактирования.
            </Typography.Paragraph>
            {downloadError && <Alert type="error" title={downloadError} />}
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
                                <Button
                                    loading={downloadingId === attachment.id}
                                    disabled={downloadingId !== null}
                                    onClick={() => void handleDownload(attachment)}
                                    aria-label={`Скачать ${attachment.name}`}
                                >
                                    Скачать
                                </Button>
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

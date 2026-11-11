import { Button, Form, Upload, message, type UploadFile } from 'antd';
import { useParams } from 'react-router';
import { prepareAttachmentUpload, type AttachmentUpload } from '../../api/attachments';

export type AttachmentFile = UploadFile<AttachmentUpload>;

function AttachmentField({ prefix = [] }: { prefix?: (string | number)[] }) {
    const { projectId = '' } = useParams();
    const [messageApi, contextHolder] = message.useMessage();

    return (
        <>
            {contextHolder}
            <Form.Item
                name={[...prefix, 'attachmentFiles']}
                label="Прикрепить файлы"
                valuePropName="fileList"
                getValueFromEvent={(event: { fileList: AttachmentFile[] }) => event.fileList}
                extra="Файлы будут прикреплены к задаче после сохранения."
                rules={[
                    {
                        validator: async (_, files: AttachmentFile[] = []) => {
                            if (files.some((file) => file.status === 'uploading')) {
                                throw new Error('Дождитесь окончания загрузки файлов.');
                            }
                            if (files.some((file) => file.status !== 'done' || !file.response)) {
                                throw new Error('Удалите файлы с ошибкой и загрузите их повторно.');
                            }
                        },
                    },
                ]}
            >
                <Upload
                    multiple
                    beforeUpload={(file) => {
                        if (file.size === 0) {
                            void messageApi.error(`Файл «${file.name}» пустой.`);
                            return Upload.LIST_IGNORE;
                        }
                        return true;
                    }}
                    customRequest={({ file, onSuccess, onError }) => {
                        if (!(file instanceof File)) {
                            onError?.(new Error('Не удалось прочитать файл.'));
                            return;
                        }
                        void prepareAttachmentUpload(projectId, file)
                            .then((result) => onSuccess?.(result))
                            .catch(() => onError?.(new Error('Не удалось загрузить файл.')));
                    }}
                >
                    <Button>Выбрать файлы</Button>
                </Upload>
            </Form.Item>
        </>
    );
}

export default AttachmentField;

import type { AttachmentUpload } from '../../api/attachments';
import type { AttachmentFile } from './AttachmentField';

export function toAttachmentPayload(files: AttachmentFile[] = []): AttachmentUpload[] {
    return files.map((file) => {
        if (file.status !== 'done' || !file.response) {
            throw new Error('Файл ещё не загружен.');
        }
        return file.response;
    });
}

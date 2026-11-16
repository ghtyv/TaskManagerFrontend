import apiClient from './client';

export type Attachment = {
    id: number;
    name: string;
    size: number;
};

export type AttachmentUpload = {
    fileId: string;
    originalFilename: string;
};

export async function getTaskAttachments(projectId: string, taskId: number) {
    const response = await apiClient.get<Attachment[]>(
        `/projects/${projectId}/attachments/tasks/${taskId}`,
    );
    return response.data;
}

export async function deleteAttachmentById(
    projectId: string,
    attachmentId: number,
) {
    await apiClient.delete(
        `/projects/${projectId}/attachments/${attachmentId}/delete`,
    );
}

export async function prepareAttachmentUpload(projectId: string, file: File) {
    const payload = new FormData();
    payload.append('file', file);

    const response = await apiClient.post<string>(
        `/projects/${projectId}/attachments/upload`,
        payload,
    );
    return { fileId: response.data, originalFilename: file.name };
}

export async function downloadAttachment(projectId: string, attachment: Attachment) {
    const response = await apiClient.get<Blob>(
        `/projects/${projectId}/attachments/${attachment.id}/download`,
        { responseType: 'blob' },
    );
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Allow the browser to start reading the blob before releasing it.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

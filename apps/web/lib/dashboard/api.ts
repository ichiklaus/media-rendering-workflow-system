import axios from "axios";
import { API_BASE_URL } from "../consts";
import type { Room, Student } from "@/types/dashboard";
import { buildRenderPayload } from "./render";

export interface TemplateOption {
  id: string;
  label: string;
  previewUrl: string;
}

interface LatestTemplateHistory {
  id: number;
  campaign_uuid: string;
  recipient_uuid: string;
  template_id: string;
  template_request_id: string;
  template_request_year: string;
  template_path: string;
  created_at: string;
}

interface RenderQueueItem {
  id?: string;
}

export async function fetchRooms(): Promise<Room[]> {
  const res = await axios.get(`${API_BASE_URL}/recipients/rooms`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchStudentsByRoom(campaignUuid: string): Promise<Student[]> {
  const res = await axios.get(`${API_BASE_URL}/recipients/room/${campaignUuid}`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function enqueueRenderForStudents(students: Student[]): Promise<string[]> {
  if (students.length === 0) {
    return [];
  }

  const payload = students.flatMap((student) => buildRenderPayload(student));

  const renderResponse = await axios.post<RenderQueueItem[]>(`${API_BASE_URL}/render`, payload);

  const queuedRenders = Array.isArray(renderResponse.data) ? renderResponse.data : [];

  if (queuedRenders.length !== students.length) {
    throw new Error(
      `Unexpected render response length. Expected ${students.length}, received ${queuedRenders.length}.`,
    );
  }

  const renderIds = queuedRenders.map((item, index) => {
    const renderId = item?.id;

    if (!renderId) {
      throw new Error(`Render ID missing from render response at index ${index}.`);
    }

    return renderId;
  });

  await Promise.all(
    students.map((student, index) =>
      axios.patch(`${API_BASE_URL}/recipients/${student.campaign_uuid}/${student.recipient_uuid}/render-id`, {
        renderId: renderIds[index],
      }),
    ),
  );

  return renderIds;
}

export async function enqueueRenderForStudent(student: Student): Promise<string> {
  const [renderId] = await enqueueRenderForStudents([student]);

  if (!renderId) {
    throw new Error("Render ID missing from render response.");
  }

  return renderId;
}

export async function updateStudentCurrentTemplate(params: {
  campaignUuid: string;
  recipientUuid: string;
  templateId: string;
  templateRequestId: string;
  templateRequestYear: string;
  templatePath: string;
}) {
  const { campaignUuid, recipientUuid, ...body } = params;

  return axios.patch(`${API_BASE_URL}/recipients/${campaignUuid}/${recipientUuid}/current-template`, body);
}

export async function insertStudentTemplateHistory(params: {
  campaignUuid: string;
  recipientUuid: string;
  templateId: string;
  templateRequestId: string;
  templateRequestYear: string;
  templatePath: string;
}) {
  const { campaignUuid, recipientUuid, ...body } = params;

  return axios.post(`${API_BASE_URL}/recipients/${campaignUuid}/${recipientUuid}/template-history`, body);
}

export async function fetchLatestStudentTemplateHistory(params: {
  campaignUuid: string;
  recipientUuid: string;
  templateId: string;
}) {
  const { campaignUuid, recipientUuid, templateId } = params;

  const response = await axios.get<LatestTemplateHistory | null>(
    `${API_BASE_URL}/recipients/${campaignUuid}/${recipientUuid}/template-history/latest`,
    {
      params: { templateId },
    },
  );

  return response.data;
}

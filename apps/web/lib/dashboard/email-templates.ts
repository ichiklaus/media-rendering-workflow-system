import type { Student } from "@/types/dashboard";
import { insertStudentTemplateHistory, updateStudentCurrentTemplate } from "./api";
import { buildTemplateData } from "./template-registry";
import { resolveStudentSendDecision } from "./email-send-strategy";
import { resolveBulkSendDecision } from "./bulk-email-send-strategy";
import axios from "axios";
import { API_BASE_URL } from "../consts";

const DEMO_USER_ID = "demo_user";

const DEMO_WEB_DOMAIN = "https://example.com";

const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop";

function resolveTemplateThumbnail(student: Student) {
  return student.render_thumbnail ?? DEFAULT_THUMBNAIL;
}

function buildEmailRecipient(params: { student: Student; email: string }) {
  const { student, email } = params;

  return {
    recipientId: student.recipient_uuid,
    videoUrl: student.render_url!,
    thumbnailUrl: resolveTemplateThumbnail(student),
    recipientData: {
      fullName: student.name,
      email,
    },
  };
}

export async function sendStudentVideoEmail(params: {
  student: Student;
  email: string;
  templateId: string;
}) {
  const { student, email, templateId } = params;

  const decision = await resolveStudentSendDecision({
    student,
    templateId,
  });

  const payload = {
    mode: decision.mode,
    currentUserId: DEMO_USER_ID,
    templateId,
    webServiceDomain: DEMO_WEB_DOMAIN,
    templateData: buildTemplateData({
      templateId,
      thumbnailUrl: resolveTemplateThumbnail(student),
    }),
    recipients: [buildEmailRecipient({ student, email })],
    requestId: decision.requestId,
    requestYear: decision.requestYear,
  };

  const response = await axios.post(
    `${API_BASE_URL}/campaign/send-template`,
    payload,
  );

  console.log("🚀 sendStudentVideoEmail response:", response.data);

  const requestId: string | undefined = response.data?.requestId;
  const requestYear: string | undefined = response.data?.requestYear;
  const templatePath: string | undefined =
    response.data?.recipients?.[0]?.templatePath;

  if (requestId && requestYear && templatePath) {
    await updateStudentCurrentTemplate({
      campaignUuid: student.campaign_uuid,
      recipientUuid: student.recipient_uuid,
      templateId,
      templateRequestId: requestId,
      templateRequestYear: requestYear,
      templatePath,
    });

    if (decision.mode === "create") {
      await insertStudentTemplateHistory({
        campaignUuid: student.campaign_uuid,
        recipientUuid: student.recipient_uuid,
        templateId,
        templateRequestId: requestId,
        templateRequestYear: requestYear,
        templatePath,
      });
    }
  }

  return response;
}

export async function sendBulkStudentVideoEmails(params: {
  students: Student[];
  templateId: string;
}) {
  const { students, templateId } = params;

  const decision = resolveBulkSendDecision({
    students,
    templateId,
  });

  const recipients = students.map((student) =>
    buildEmailRecipient({
      student,
      email: student.email!,
    }),
  );

  const payload = {
    mode: decision.mode,
    currentUserId: DEMO_USER_ID,
    templateId,
    webServiceDomain: DEMO_WEB_DOMAIN,
    templateData: buildTemplateData({ templateId }),
    recipients,
    requestId: decision.requestId,
    requestYear: decision.requestYear,
  };

  const response = await axios.post(
    `${API_BASE_URL}/campaign/send-template`,
    payload,
  );

  const requestId: string | undefined = response.data?.requestId;
  const requestYear: string | undefined = response.data?.requestYear;

  const returnedRecipients:
    | Array<{
        recipientId: string;
        templatePath: string;
      }>
    | undefined = response.data?.recipients;

  if (requestId && requestYear && returnedRecipients?.length) {
    const studentMap = new Map(
      students.map((student) => [student.recipient_uuid, student]),
    );

    await Promise.all(
      returnedRecipients.map(async (recipient) => {
        const student = studentMap.get(recipient.recipientId);

        if (!student || !recipient.templatePath) return;

        await updateStudentCurrentTemplate({
          campaignUuid: student.campaign_uuid,
          recipientUuid: student.recipient_uuid,
          templateId,
          templateRequestId: requestId,
          templateRequestYear: requestYear,
          templatePath: recipient.templatePath,
        });

        if (decision.mode === "create") {
          await insertStudentTemplateHistory({
            campaignUuid: student.campaign_uuid,
            recipientUuid: student.recipient_uuid,
            templateId,
            templateRequestId: requestId,
            templateRequestYear: requestYear,
            templatePath: recipient.templatePath,
          });
        }
      }),
    );
  }

  return response;
}
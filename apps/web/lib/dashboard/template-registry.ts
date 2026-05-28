export interface TemplateDefinition {
  id: string;
  label: string;
  previewUrl: string;
  previewImageUrl: string;
  templateData: {
    template_style: string;
    template_logo: string;
    template_thumbnail: string;
    template_favicon: string;
    template_headline: string;
    template_message: string;
    template_sub_message: string;
    call_to_action: string;
    call_to_action_title: string;
    call_to_action_redirect_link: string;
  };
}

const PLACEHOLDER_LOGO =
  "https://placehold.co/240x80/png?text=Demo+Logo";

const PLACEHOLDER_FAVICON =
  "https://placehold.co/32x32/png?text=D";

const PLACEHOLDER_THUMBNAIL =
  "https://placehold.co/1200x630/png?text=Campaign+Thumbnail";

const PLACEHOLDER_PREVIEW_1 =
  "https://placehold.co/1280x720/png?text=Campaign+Preview+1";

const PLACEHOLDER_PREVIEW_2 =
  "https://placehold.co/1280x720/png?text=Campaign+Preview+2";

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  campaign_demo_1: {
    id: "campaign_demo_1",
    label: "Campaign Preview 1",

    // Placeholder route for demo
    previewUrl: "https://placehold.co/1200x630/png?text=Campaign+Thumbnail",

    // Used by TemplatePreviewPanel
    previewImageUrl: PLACEHOLDER_PREVIEW_1,

    templateData: {
      template_style: "campaign_demo_1",

      template_logo: PLACEHOLDER_LOGO,

      template_thumbnail: PLACEHOLDER_THUMBNAIL,

      template_favicon: PLACEHOLDER_FAVICON,

      template_headline: "Congratulations, {{firstName}}",

      template_message:
        "{{firstName}}, this campaign preview demonstrates how personalized content can be presented in a clean and engaging format. This is placeholder content for the demo environment.",

      template_sub_message:
        "Your custom campaign experience would appear here.",

      call_to_action: "yes",

      call_to_action_title: "View Campaign",

      call_to_action_redirect_link: "#",
    },
  },

  campaign_demo_2: {
    id: "campaign_demo_2",

    label: "Campaign Preview 2",

    previewUrl: "https://placehold.co/1200x630/png?text=Campaign+Thumbnail",

    previewImageUrl: PLACEHOLDER_PREVIEW_2,

    templateData: {
      template_style: "campaign_demo_2",

      template_logo: PLACEHOLDER_LOGO,

      template_thumbnail: PLACEHOLDER_THUMBNAIL,

      template_favicon: PLACEHOLDER_FAVICON,

      template_headline: "Your Personalized Campaign",

      template_message:
        "{{firstName}}, this is a second demo campaign style showcasing alternate layouts and messaging using placeholder assets and sample content only.",

      template_sub_message:
        "Demo environment — no production services connected.",

      call_to_action: "yes",

      call_to_action_title: "Open Experience",

      call_to_action_redirect_link: "#",
    },
  },
};

export const TEMPLATE_OPTIONS = Object.values(
  TEMPLATE_REGISTRY,
).map(({ id, label, previewUrl, previewImageUrl }) => ({
  id,
  label,
  previewUrl,
  previewImageUrl,
}));

export function getTemplateDefinition(
  templateId: string,
): TemplateDefinition {
  const template = TEMPLATE_REGISTRY[templateId];

  if (!template) {
    throw new Error(`Unsupported templateId: ${templateId}`);
  }

  return template;
}

export function buildTemplateData(params: {
  templateId: string;
  thumbnailUrl?: string | null;
}) {
  const { templateId, thumbnailUrl } = params;

  const template = getTemplateDefinition(templateId);

  return {
    ...template.templateData,
    template_thumbnail:
      thumbnailUrl || template.templateData.template_thumbnail,
  };
}
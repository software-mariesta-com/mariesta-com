export const PUBLISH_STATUSES = ['draft', 'published'] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const PUBLISH_STATUS_LABELS: Record<PublishStatus, string> = {
	draft: 'Draft',
	published: 'Published'
};

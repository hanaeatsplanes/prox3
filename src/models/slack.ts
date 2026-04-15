export type SlackApiResponse = {
	ok: boolean;
	error?: string;
	ts?: string;
};

export type ConversationRepliesResponse =
	| {
			ok: true;
			messages: {
				user: string;
				ts: string;
				text: string;
				thread_ts: string;
				bot_id?: string;
			}[];
			has_more: boolean;
			response_metadata?: {
				next_cursor: string;
			};
	  }
	| {
			ok: false;
			error: string;
	  };

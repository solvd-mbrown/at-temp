export type IntroductionListItemType = {
	// type: 'images' | 'video' | 'text';
	type?: string;
	images?: Array<{[key: string]: string}>;
	video?: string | undefined;
	poster?: string | undefined;
	mediaParams?:
		| {
				width: number | undefined;
				height: number | undefined;
		  }
		| undefined
		| null;
	text?: string | undefined;
	description?: string | undefined;
	videoPoster?: string;
	length?: number | undefined;
};

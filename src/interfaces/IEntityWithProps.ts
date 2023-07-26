export interface EntityWithProps<Props> {
	identity: string;
	labels: string[];
	properties: Props;
}

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {RootState} from '~redux/store';

type InviteLinkParamsType = {
	userId: string;
	invitedBy: string;
};

type InviteLinkType = {
	params: InviteLinkParamsType;
	isLoaded: boolean;
};

type InitialStateType = {
	inviteLink: InviteLinkType;
};

const initialState: InitialStateType = {
	inviteLink: {
		params: {
			userId: '',
			invitedBy: '',
		},
		isLoaded: false,
	},
};

const deepLinksSlice = createSlice({
	name: 'deepLinks',
	initialState,
	reducers: {
		cleanInviteLink: state => {
			state.inviteLink = initialState.inviteLink;
		},
		setInviteLink: (state, action: PayloadAction<InviteLinkParamsType>) => {
			state.inviteLink.params = action.payload;
			state.inviteLink.isLoaded = true;
		},
	},
});

export const {cleanInviteLink, setInviteLink} = deepLinksSlice.actions;
export const deepLinksSelector = {
	getInviteLink: (state: RootState) => state.deepLinks.inviteLink,
};

export default deepLinksSlice.reducer;
